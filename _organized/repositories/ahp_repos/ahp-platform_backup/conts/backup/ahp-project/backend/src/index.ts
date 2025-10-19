import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { runMigrations } from './database/migrate';
import { initDatabase } from './database/connection';
import WorkshopSyncService from './services/workshopSync';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import criteriaRoutes from './routes/criteria';
import alternativesRoutes from './routes/alternatives';
import comparisonsRoutes from './routes/comparisons';
import evaluateRoutes from './routes/evaluate';
import evaluatorsRoutes from './routes/evaluators';
import resultsRoutes from './routes/results';
import analysisRoutes from './routes/analysis';
import matrixRoutes from './routes/matrix';
import computeRoutes from './routes/compute';
import exportRoutes from './routes/export';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize WebSocket service (disabled for deployment)
const workshopSync = new WorkshopSyncService(httpServer);

// Trust proxy for Render.com
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// Enhanced CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'https://aebonlee.github.io',
  'https://ahp-frontend-render.onrender.com',
  'https://ahp-forpaper.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGIN === origin) {
      return callback(null, true);
    }
    
    // In development, allow any origin
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'AHP Decision System API', 
    version: '1.6.2',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      projects: '/api/projects'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manual migration endpoint for production debugging
app.post('/api/admin/migrate', async (req, res) => {
  try {
    console.log('🔧 Manual migration requested...');
    await runMigrations();
    res.json({ success: true, message: 'Database migrations completed successfully' });
  } catch (error) {
    console.error('❌ Manual migration failed:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/criteria', criteriaRoutes);
app.use('/api/alternatives', alternativesRoutes);
app.use('/api/comparisons', comparisonsRoutes);
app.use('/api/evaluate', evaluateRoutes);
app.use('/api/evaluators', evaluatorsRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/matrix', matrixRoutes);
app.use('/api/compute', computeRoutes);
app.use('/api/export', exportRoutes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Workshop status API endpoints
app.get('/api/workshop/:projectId', (req, res) => {
  const workshopInfo = workshopSync.getWorkshopInfo(req.params.projectId);
  if (workshopInfo) {
    res.json(workshopInfo);
  } else {
    res.status(404).json({ error: 'Workshop not found' });
  }
});

app.get('/api/workshops', (req, res) => {
  const workshops = workshopSync.getAllWorkshops();
  res.json({ workshops });
});

// Start server
const server = httpServer.listen(PORT, async () => {
  console.log(`🚀 AHP Backend Server started with PostgreSQL`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔗 Health check: /api/health`);
  
  try {
    console.log('🔧 Initializing PostgreSQL database...');
    await initDatabase();
    console.log('✅ PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    // Continue running the server even if database init fails
    console.log('⚠️ Server starting without database initialization');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});