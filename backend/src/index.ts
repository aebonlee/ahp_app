import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
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
import subscriptionRoutes from './routes/subscription';
import supportRoutes from './routes/support';
import newsRoutes from './routes/news';
import adminRoutes from './routes/admin';
import surveyRoutes from './routes/survey';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize WebSocket service (disabled for deployment)
const workshopSync = new WorkshopSyncService(httpServer);
console.log('🚀 AHP Platform Backend v2.4.0 - News & Support API Added');

// Trust proxy for Render.com
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// Enhanced CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3005',
  'https://aebonlee.github.io',
  'https://ahp-platform.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow any localhost origin
    if (process.env.NODE_ENV !== 'production' || !process.env.DATABASE_URL) {
      console.log('CORS: Development mode - allowing origin:', origin);
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGIN === origin) {
      console.log('CORS: Allowed origin:', origin);
      return callback(null, true);
    }
    
    console.log('CORS: Blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Check users in database
app.get('/api/admin/users', async (req, res) => {
  try {
    const { query } = await import('./database/connection');
    const result = await query('SELECT id, email, first_name, last_name, role, is_active FROM users ORDER BY id');
    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Create test user endpoint
app.post('/api/admin/create-test-user', async (req, res) => {
  try {
    const { query } = await import('./database/connection');
    const bcrypt = require('bcrypt');
    
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    await query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active
    `, ['test@ahp.com', hashedPassword, 'Test', 'User', 'admin', true]);
    
    res.json({ success: true, message: 'Test user created: test@ahp.com / test123' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

// Emergency phantom data cleanup for specific project
app.post('/api/emergency/cleanup-project-phantoms', async (req, res) => {
  try {
    const { project_id, confirm } = req.body;
    
    if (confirm !== 'CLEANUP_PROJECT_PHANTOMS' || !project_id) {
      return res.status(400).json({
        success: false,
        message: 'To confirm cleanup, send { "project_id": number, "confirm": "CLEANUP_PROJECT_PHANTOMS" }'
      });
    }
    
    console.log(`🧹 프로젝트 ${project_id} 허수 데이터 정리 시작...`);
    
    const { query } = await import('./database/connection');
    
    // 프로젝트 존재 확인
    const projectCheck = await query('SELECT id, title FROM projects WHERE id = $1', [project_id]);
    if (projectCheck.rows.length === 0) {
      return res.json({
        success: false,
        message: `프로젝트 ${project_id}가 존재하지 않습니다.`
      });
    }
    
    console.log(`📊 프로젝트 "${projectCheck.rows[0].title}" (ID: ${project_id}) 허수 데이터 정리 중...`);
    
    // 1. 빈 비교 데이터 삭제
    const deletedComparisons = await query(
      'DELETE FROM pairwise_comparisons WHERE project_id = $1 AND (value IS NULL OR value = 0) RETURNING id',
      [project_id]
    );
    
    // 2. 가중치가 0인 기준들 확인 및 정리
    const zeroCriteria = await query(
      'SELECT id, name, weight FROM criteria WHERE project_id = $1 AND weight = 0',
      [project_id]
    );
    
    // 3. 빈 평가 세션 정리
    const deletedSessions = await query(
      'DELETE FROM workshop_sessions WHERE project_id = $1 AND status = $2 RETURNING id',
      [project_id, 'created']
    );
    
    // 4. 중복된 평가자 정리
    const duplicateEvaluators = await query(`
      DELETE FROM project_evaluators 
      WHERE id IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id, evaluator_id ORDER BY id) as rn
          FROM project_evaluators 
          WHERE project_id = $1
        ) t WHERE rn > 1
      ) RETURNING id
    `, [project_id]);
    
    const cleanupSummary = {
      deleted_comparisons: deletedComparisons.rows.length,
      zero_weight_criteria: zeroCriteria.rows.length,
      deleted_sessions: deletedSessions.rows.length,
      deleted_duplicate_evaluators: duplicateEvaluators.rows.length
    };
    
    console.log(`✅ 프로젝트 ${project_id} 허수 데이터 정리 완료:`, cleanupSummary);
    
    res.json({
      success: true,
      message: `프로젝트 ${project_id}의 허수 데이터가 정리되었습니다.`,
      project_title: projectCheck.rows[0].title,
      cleanup_summary: cleanupSummary,
      zero_criteria: zeroCriteria.rows
    });
    
  } catch (error: any) {
    console.error('❌ 프로젝트 허수 데이터 정리 중 오류:', error);
    res.status(500).json({
      success: false,
      message: '프로젝트 허수 데이터 정리 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// Emergency phantom project cleanup endpoint (no auth required)
app.post('/api/emergency/cleanup-phantom-projects', async (req, res) => {
  try {
    const { confirm } = req.body;
    
    if (confirm !== 'CLEANUP_PHANTOM_PROJECTS_EMERGENCY') {
      return res.status(400).json({
        success: false,
        message: 'To confirm cleanup, send { "confirm": "CLEANUP_PHANTOM_PROJECTS_EMERGENCY" }'
      });
    }
    
    console.log('🚨 긴급 허수 프로젝트 정리 시작...');
    
    const { query } = await import('./database/connection');
    
    // 특정 프로젝트 ID가 제공된 경우 해당 프로젝트의 허수 데이터만 정리
    if (req.body.project_id) {
      const projectId = req.body.project_id;
      console.log(`🎯 프로젝트 ${projectId} 전용 허수 데이터 정리 시작...`);
      
      // 프로젝트 존재 확인
      const projectCheck = await query('SELECT id, title FROM projects WHERE id = $1', [projectId]);
      if (projectCheck.rows.length === 0) {
        return res.json({
          success: false,
          message: `프로젝트 ${projectId}가 존재하지 않습니다.`
        });
      }
      
      // 1. 빈 비교 데이터 삭제
      const deletedComparisons = await query(
        'DELETE FROM pairwise_comparisons WHERE project_id = $1 AND (value IS NULL OR value = 0) RETURNING id',
        [projectId]
      );
      
      // 2. 빈 평가 세션 정리
      const deletedSessions = await query(
        'DELETE FROM workshop_sessions WHERE project_id = $1 AND status = $2 RETURNING id',
        [projectId, 'created']
      );
      
      // 3. 중복된 평가자 정리
      const duplicateEvaluators = await query(`
        DELETE FROM project_evaluators 
        WHERE id IN (
          SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id, evaluator_id ORDER BY id) as rn
            FROM project_evaluators 
            WHERE project_id = $1
          ) t WHERE rn > 1
        ) RETURNING id
      `, [projectId]);
      
      console.log(`✅ 프로젝트 ${projectId} 허수 데이터 정리 완료`);
      
      return res.json({
        success: true,
        message: `프로젝트 ${projectId}의 허수 데이터가 정리되었습니다.`,
        project_title: projectCheck.rows[0].title,
        cleanup_summary: {
          deleted_comparisons: deletedComparisons.rows.length,
          deleted_sessions: deletedSessions.rows.length,
          deleted_duplicate_evaluators: duplicateEvaluators.rows.length
        }
      });
    }
    
    // 1. 현재 프로젝트 목록 확인
    const projectsResult = await query(`
      SELECT p.id, p.title, p.name, p.description, p.status, p.admin_id, p.created_at,
             u.email as admin_email,
             (SELECT COUNT(*) FROM criteria WHERE project_id = p.id) as criteria_count,
             (SELECT COUNT(*) FROM alternatives WHERE project_id = p.id) as alternatives_count,
             (SELECT COUNT(*) FROM project_evaluators WHERE project_id = p.id) as evaluators_count
      FROM projects p
      LEFT JOIN users u ON p.admin_id = u.id
      ORDER BY p.created_at DESC
    `);
    console.log(`📊 현재 프로젝트 총 개수: ${projectsResult.rows.length}개`);
    
    // 2. 허수/테스트 데이터 식별
    const phantomProjects = projectsResult.rows.filter((project: any) => {
      const title = (project.title || '').toLowerCase();
      const description = (project.description || '').toLowerCase();
      const name = (project.name || '').toLowerCase();
      
      // 테스트 관련 키워드
      const testKeywords = [
        '테스트', 'test', 'sample', 'demo', 'example', 'prototype',
        'ai 개발 활용', '스마트폰 선택', '직원 채용', '투자 포트폴리오',
        'artificial', 'smartphone', 'employee', 'investment', '중요도 분석'
      ];
      
      // 빈 프로젝트 (criteria, alternatives, evaluators 모두 0인 경우)
      const isEmpty = project.criteria_count === 0 && 
                     project.alternatives_count === 0 && 
                     project.evaluators_count === 0;
      
      // 키워드 매칭
      const hasTestKeyword = testKeywords.some(keyword => 
        title.includes(keyword) || description.includes(keyword) || name.includes(keyword)
      );
      
      // 관리자가 test@ahp.com인 경우 (테스트 계정)
      const isTestAccount = project.admin_email === 'test@ahp.com';
      
      return hasTestKeyword || isEmpty || isTestAccount;
    });
    
    console.log(`🔍 발견된 허수/테스트 프로젝트: ${phantomProjects.length}개`);
    console.log('삭제 대상:', phantomProjects.map(p => `${p.id}: "${p.title}"`));
    
    if (phantomProjects.length === 0) {
      return res.json({
        success: true,
        message: '삭제할 허수 데이터가 없습니다.',
        deleted_count: 0,
        remaining_count: projectsResult.rows.length
      });
    }
    
    // 3. 허수 프로젝트 삭제 (CASCADE로 관련 데이터 자동 삭제)
    console.log('🗑️ 허수 프로젝트 삭제 중...');
    const phantomProjectIds = phantomProjects.map((p: any) => p.id);
    
    // 배치 삭제
    await query('DELETE FROM projects WHERE id = ANY($1)', [phantomProjectIds]);
    
    // 4. 정리 후 상태 확인
    const finalResult = await query('SELECT COUNT(*) as count FROM projects');
    const remainingCount = parseInt(finalResult.rows[0].count);
    
    console.log(`✅ ${phantomProjects.length}개 허수 프로젝트 삭제 완료`);
    console.log(`📊 정리 후 프로젝트 개수: ${remainingCount}개`);
    
    res.json({
      success: true,
      message: `${phantomProjects.length}개의 허수 프로젝트가 성공적으로 삭제되었습니다.`,
      deleted_count: phantomProjects.length,
      remaining_count: remainingCount,
      deleted_projects: phantomProjects.map((p: any) => ({ 
        id: p.id, 
        title: p.title,
        admin_email: p.admin_email,
        criteria_count: p.criteria_count,
        alternatives_count: p.alternatives_count,
        evaluators_count: p.evaluators_count
      }))
    });
    
  } catch (error: any) {
    console.error('❌ 긴급 허수 프로젝트 정리 중 오류:', error);
    res.status(500).json({
      success: false,
      message: '허수 프로젝트 정리 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// Quick phantom cleanup endpoint (temporary - no auth)
app.get('/api/quick-cleanup-phantoms', async (req, res) => {
  try {
    console.log('🧹 퀵 허수 프로젝트 정리 실행...');
    
    const { query } = await import('./database/connection');
    
    // 현재 프로젝트 개수 확인
    const countBefore = await query('SELECT COUNT(*) as count FROM projects');
    console.log(`📊 정리 전 프로젝트 개수: ${countBefore.rows[0].count}개`);
    
    // 허수 프로젝트 식별 및 삭제
    const deleteResult = await query(`
      DELETE FROM projects 
      WHERE 
        title ILIKE '%테스트%' OR 
        title ILIKE '%test%' OR 
        title ILIKE '%sample%' OR 
        title ILIKE '%demo%' OR
        title ILIKE '%AI 개발 활용%' OR
        title ILIKE '%스마트폰 선택%' OR
        title ILIKE '%직원 채용%' OR
        title ILIKE '%투자 포트폴리오%' OR
        title ILIKE '%중요도 분석%' OR
        admin_id IN (SELECT id FROM users WHERE email = 'test@ahp.com') OR
        (
          id NOT IN (SELECT DISTINCT project_id FROM criteria WHERE project_id IS NOT NULL) AND
          id NOT IN (SELECT DISTINCT project_id FROM alternatives WHERE project_id IS NOT NULL) AND
          id NOT IN (SELECT DISTINCT project_id FROM project_evaluators WHERE project_id IS NOT NULL)
        )
    `);
    
    // 정리 후 개수 확인
    const countAfter = await query('SELECT COUNT(*) as count FROM projects');
    const deletedCount = parseInt(countBefore.rows[0].count) - parseInt(countAfter.rows[0].count);
    
    console.log(`✅ ${deletedCount}개 허수 프로젝트 삭제 완료`);
    console.log(`📊 정리 후 프로젝트 개수: ${countAfter.rows[0].count}개`);
    
    res.json({
      success: true,
      message: `${deletedCount}개의 허수 프로젝트가 정리되었습니다.`,
      deleted_count: deletedCount,
      remaining_count: parseInt(countAfter.rows[0].count),
      before_count: parseInt(countBefore.rows[0].count)
    });
    
  } catch (error: any) {
    console.error('❌ 퀵 정리 중 오류:', error);
    res.status(500).json({
      success: false,
      message: '허수 프로젝트 정리 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// Reset project 104 to clean state (remove all phantom data)
app.post('/api/emergency/reset-project-104', async (req, res) => {
  try {
    const { confirm } = req.body;
    
    if (confirm !== 'RESET_PROJECT_104') {
      return res.status(400).json({
        success: false,
        message: 'To confirm reset, send { "confirm": "RESET_PROJECT_104" }'
      });
    }
    
    console.log('🔄 프로젝트 104 완전 초기화 시작...');
    
    const { query } = await import('./database/connection');
    
    // 프로젝트 104 존재 확인
    const projectCheck = await query('SELECT id, title FROM projects WHERE id = 104');
    if (projectCheck.rows.length === 0) {
      return res.json({
        success: false,
        message: '프로젝트 104가 존재하지 않습니다.'
      });
    }
    
    console.log(`🗑️ 프로젝트 104 "${projectCheck.rows[0].title}" 모든 데이터 삭제 중...`);
    
    // 순차적으로 모든 관련 데이터 삭제 (외래키 제약조건 고려)
    let resetSummary = {
      deleted_comparisons: 0,
      deleted_sessions: 0,
      deleted_evaluators: 0,
      deleted_alternatives: 0,
      deleted_criteria: 0
    };
    
    try {
      // 1. 비교 데이터 삭제
      const deletedComparisons = await query(
        'DELETE FROM pairwise_comparisons WHERE project_id = 104 RETURNING id'
      );
      resetSummary.deleted_comparisons = deletedComparisons.rows.length;
      console.log(`🗑️ 비교 데이터 ${resetSummary.deleted_comparisons}개 삭제`);
    } catch (e) { console.log('비교 데이터 테이블 없음 또는 이미 비어있음'); }
    
    try {
      // 2. 워크샵 세션 삭제
      const deletedSessions = await query(
        'DELETE FROM workshop_sessions WHERE project_id = 104 RETURNING id'
      );
      resetSummary.deleted_sessions = deletedSessions.rows.length;
      console.log(`🗑️ 워크샵 세션 ${resetSummary.deleted_sessions}개 삭제`);
    } catch (e) { console.log('워크샵 세션 테이블 없음 또는 이미 비어있음'); }
    
    try {
      // 3. 프로젝트 평가자 삭제
      const deletedEvaluators = await query(
        'DELETE FROM project_evaluators WHERE project_id = 104 RETURNING id'
      );
      resetSummary.deleted_evaluators = deletedEvaluators.rows.length;
      console.log(`🗑️ 평가자 ${resetSummary.deleted_evaluators}개 삭제`);
    } catch (e) { console.log('평가자 테이블 없음 또는 이미 비어있음'); }
    
    try {
      // 4. 대안 삭제
      const deletedAlternatives = await query(
        'DELETE FROM alternatives WHERE project_id = 104 RETURNING id'
      );
      resetSummary.deleted_alternatives = deletedAlternatives.rows.length;
      console.log(`🗑️ 대안 ${resetSummary.deleted_alternatives}개 삭제`);
    } catch (e) { console.log('대안 테이블 없음 또는 이미 비어있음'); }
    
    try {
      // 5. 기준 삭제 (계층적 삭제)
      const deletedCriteria = await query(
        'DELETE FROM criteria WHERE project_id = 104 RETURNING id'
      );
      resetSummary.deleted_criteria = deletedCriteria.rows.length;
      console.log(`🗑️ 기준 ${resetSummary.deleted_criteria}개 삭제`);
    } catch (e) { console.log('기준 테이블 없음 또는 이미 비어있음'); }
    
    console.log(`✅ 프로젝트 104 완전 초기화 완료:`, resetSummary);
    
    res.json({
      success: true,
      message: '프로젝트 104가 완전히 초기화되었습니다. 이제 처음부터 시작할 수 있습니다.',
      project_title: projectCheck.rows[0].title,
      reset_summary: resetSummary
    });
    
  } catch (error: any) {
    console.error('❌ 프로젝트 104 초기화 중 오류:', error);
    res.status(500).json({
      success: false,
      message: '프로젝트 104 초기화 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// Project 104 detailed inspection - show all data flow
app.get('/api/debug-project-104-flow', async (req, res) => {
  try {
    console.log('🔍 프로젝트 104 순차적 데이터 흐름 분석...');
    
    const { query } = await import('./database/connection');
    
    // 1. 프로젝트 기본 정보
    const projectResult = await query(`
      SELECT p.*, u.email as admin_email, u.first_name, u.last_name
      FROM projects p
      LEFT JOIN users u ON p.admin_id = u.id
      WHERE p.id = 104
    `);
    
    if (projectResult.rows.length === 0) {
      return res.json({
        success: false,
        message: '프로젝트 104가 존재하지 않습니다.'
      });
    }
    
    const project = projectResult.rows[0];
    console.log(`📋 프로젝트: "${project.title}" (관리자: ${project.admin_email})`);
    
    // 2. 1단계: 기준(criteria) 데이터
    const criteriaResult = await query(`
      SELECT id, name, description, parent_id, level, weight, order_index, created_at
      FROM criteria 
      WHERE project_id = 104 
      ORDER BY level ASC, order_index ASC, created_at ASC
    `);
    console.log(`📏 1단계 - 기준: ${criteriaResult.rows.length}개`);
    
    // 3. 2단계: 대안(alternatives) 데이터  
    const alternativesResult = await query(`
      SELECT id, name, description, order_index, created_at
      FROM alternatives 
      WHERE project_id = 104 
      ORDER BY order_index ASC, created_at ASC
    `);
    console.log(`🎯 2단계 - 대안: ${alternativesResult.rows.length}개`);
    
    // 4. 3단계: 평가자(evaluators) 데이터
    const evaluatorsResult = await query(`
      SELECT pe.id, pe.evaluator_id, pe.role, pe.created_at, u.email as evaluator_email, u.first_name, u.last_name
      FROM project_evaluators pe
      LEFT JOIN users u ON pe.evaluator_id = u.id
      WHERE pe.project_id = 104
      ORDER BY pe.created_at ASC
    `);
    console.log(`👥 3단계 - 평가자: ${evaluatorsResult.rows.length}개`);
    
    // 5. 4단계: 비교 데이터 (쌍대비교)
    const comparisonsResult = await query(`
      SELECT pc.*, c1.name as element1_name, c2.name as element2_name, crit.name as criterion_name
      FROM pairwise_comparisons pc
      LEFT JOIN criteria c1 ON pc.element1_id = c1.id
      LEFT JOIN criteria c2 ON pc.element2_id = c2.id  
      LEFT JOIN criteria crit ON pc.criterion_id = crit.id
      WHERE pc.project_id = 104
      ORDER BY pc.created_at ASC
    `);
    console.log(`⚖️ 4단계 - 쌍대비교: ${comparisonsResult.rows.length}개`);
    
    // 6. 워크샵/세션 데이터
    const sessionsResult = await query(`
      SELECT ws.*, u.email as participant_email
      FROM workshop_sessions ws
      LEFT JOIN users u ON ws.participant_id = u.id
      WHERE ws.project_id = 104
      ORDER BY ws.created_at ASC
    `);
    console.log(`🏢 워크샵 세션: ${sessionsResult.rows.length}개`);
    
    // 7. 데이터 생성 시간 패턴 분석
    const timelineAnalysis = {
      project_created: project.created_at,
      first_criterion: criteriaResult.rows.length > 0 ? criteriaResult.rows[0].created_at : null,
      first_alternative: alternativesResult.rows.length > 0 ? alternativesResult.rows[0].created_at : null,
      first_evaluator: evaluatorsResult.rows.length > 0 ? evaluatorsResult.rows[0].created_at : null,
      first_comparison: comparisonsResult.rows.length > 0 ? comparisonsResult.rows[0].created_at : null
    };
    
    res.json({
      success: true,
      project_info: {
        id: project.id,
        title: project.title,
        description: project.description,
        admin_email: project.admin_email,
        created_at: project.created_at,
        status: project.status
      },
      data_flow: {
        step1_criteria: {
          count: criteriaResult.rows.length,
          items: criteriaResult.rows
        },
        step2_alternatives: {
          count: alternativesResult.rows.length,
          items: alternativesResult.rows
        },
        step3_evaluators: {
          count: evaluatorsResult.rows.length,
          items: evaluatorsResult.rows
        },
        step4_comparisons: {
          count: comparisonsResult.rows.length,
          items: comparisonsResult.rows.slice(0, 10) // 처음 10개만
        },
        workshop_sessions: {
          count: sessionsResult.rows.length,
          items: sessionsResult.rows
        }
      },
      timeline_analysis: timelineAnalysis,
      is_clean_state: criteriaResult.rows.length === 0 && alternativesResult.rows.length === 0
    });
    
  } catch (error: any) {
    console.error('❌ 프로젝트 104 흐름 분석 중 오류:', error);
    res.status(500).json({
      success: false,
      message: '프로젝트 104 흐름 분석 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// Sample data creation endpoint for production
app.post('/api/admin/create-sample-data', async (req, res) => {
  try {
    console.log('🔧 Creating sample data...');
    const { query } = await import('./database/connection');
    
    // Create sample news posts
    await query(`
      INSERT INTO news_posts (title, content, summary, author_name, category, featured, published, views) VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8),
      ($9, $10, $11, $12, $13, $14, $15, $16),
      ($17, $18, $19, $20, $21, $22, $23, $24),
      ($25, $26, $27, $28, $29, $30, $31, $32),
      ($33, $34, $35, $36, $37, $38, $39, $40),
      ($41, $42, $43, $44, $45, $46, $47, $48)
      ON CONFLICT DO NOTHING
    `, [
      'AURI 스타일 UI/UX 개편 완료 - 더욱 직관적인 사용자 경험 제공',
      '사용자 피드백을 반영하여 전면적인 디자인 개선을 완료했습니다. 미니멀하고 깔끔한 인터페이스로 연구 효율성을 높였습니다.',
      '새로운 AURI 스타일 디자인으로 UI/UX 전면 개편',
      '개발팀',
      'platform',
      true,
      true,
      324,
      
      '국내 주요 대학 1,000+ 논문에서 AHP 분석 도구 활용 검증',
      '서울대, 연세대, 고려대 등 주요 대학의 논문 연구에서 우리 플랫폼을 활용한 AHP 분석 결과가 높은 신뢰도를 보였습니다.',
      '주요 대학 1,000+ 논문에서 AHP 도구 활용 성과 검증',
      '연구팀',
      'research',
      true,
      true,
      567,
      
      '한국직업능력개발센터와 AHP 연구 플랫폼 파트너십 체결',
      '교육 및 연구 분야의 의사결정 지원을 위한 전략적 파트너십을 체결했습니다.',
      '교육 연구 분야 의사결정 지원 파트너십 체결',
      '경영진',
      'news',
      false,
      true,
      445,
      
      '삼성전자 연구소 - AHP를 활용한 신제품 개발 우선순위 분석 사례',
      '삼성전자 연구소에서 신제품 개발 프로젝트의 우선순위를 결정하기 위해 우리 플랫폼을 활용했습니다.',
      '삼성전자 연구소 신제품 개발 우선순위 분석 성공 사례',
      '사례연구팀',
      'case',
      false,
      true,
      678,
      
      '2024년 하반기 AHP 연구 워크샵 개최 안내',
      '9월 15일부터 17일까지 3일간 AHP 방법론과 플랫폼 활용법을 배우는 워크샵을 개최합니다.',
      'AHP 방법론 및 플랫폼 활용 워크샵 개최',
      '교육팀',
      'event',
      false,
      true,
      234,
      
      'AI 기반 일관성 개선 기능 베타 출시',
      '인공지능을 활용하여 쌍대비교의 일관성을 자동으로 개선해주는 새로운 기능을 베타 버전으로 출시했습니다.',
      'AI 기반 쌍대비교 일관성 자동 개선 기능 베타 출시',
      'AI개발팀',
      'platform',
      false,
      true,
      512
    ]);

    // Create sample support posts
    await query(`
      INSERT INTO support_posts (title, content, author_name, author_email, category, status, views) VALUES
      ($1, $2, $3, $4, $5, $6, $7),
      ($8, $9, $10, $11, $12, $13, $14),
      ($15, $16, $17, $18, $19, $20, $21)
      ON CONFLICT DO NOTHING
    `, [
      'AHP 분석 결과의 일관성 비율이 0.1을 초과할 때 해결 방법',
      '쌍대비교를 진행했는데 일관성 비율이 0.15가 나왔습니다. 어떻게 개선할 수 있을까요?',
      '연구자김',
      'kim.researcher@university.ac.kr',
      'technical',
      'answered',
      127,
      
      '평가자 초대 메일이 발송되지 않는 문제',
      '프로젝트에 평가자를 초대했는데 메일이 발송되지 않고 있습니다.',
      '교수박',
      'park.professor@college.edu',
      'bug',
      'open',
      89,
      
      '기관 플랜 할인 문의',
      '대학교에서 단체로 이용할 예정인데 할인 혜택이 있나요?',
      '관리자이',
      'lee.admin@institution.org',
      'billing',
      'answered',
      156
    ]);

    console.log('✅ Sample data created successfully');
    res.json({ success: true, message: 'Sample data created successfully' });
  } catch (error) {
    console.error('❌ Sample data creation failed:', error);
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
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', surveyRoutes);

// API-only backend - no static file serving
app.get('/', (req, res) => {
  res.json({ 
    message: 'AHP Platform Backend API Server',
    version: '2.3.2',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      users: '/api/users/*',
      projects: '/api/projects/*'
    }
  });
});

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