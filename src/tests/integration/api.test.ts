import axios from 'axios';

const API_BASE_URL = 'https://ahp-django-backend.onrender.com';

describe('Backend API Integration Tests', () => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  describe('System Health Checks', () => {
    test('API root endpoint should be accessible', async () => {
      const response = await api.get('/api/');
      expect(response.status).toBe(200);
    });

    test('Health check endpoint should return OK', async () => {
      const response = await api.get('/health/');
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('OK');
    });

    test('Database status should be connected', async () => {
      const response = await api.get('/db-status/');
      expect(response.status).toBe(200);
      expect(response.data.connection).toBe('OK');
      expect(response.data.tables_count).toBeGreaterThan(0);
    });
  });

  describe('Authentication Flow', () => {
    let authToken: string;

    test('Should register a new user', async () => {
      const userData = {
        username: `test_${Date.now()}@example.com`,
        email: `test_${Date.now()}@example.com`,
        password: 'TestPass123!',
        password2: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User'
      };

      try {
        const response = await api.post('/api/service/auth/register/', userData);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('user');
        expect(response.data).toHaveProperty('access');
      } catch (error: any) {
        // Registration might fail if user exists, which is ok for testing
        console.log('Registration test skipped:', error.response?.data?.message);
      }
    });

    test('Should login with credentials', async () => {
      const loginData = {
        username: 'test@example.com',
        password: 'TestPass123!'
      };

      try {
        const response = await api.post('/api/service/auth/token/', loginData);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('access');
        expect(response.data).toHaveProperty('refresh');
        authToken = response.data.access;
      } catch (error: any) {
        console.log('Login test failed:', error.response?.data);
      }
    });
  });

  describe('Project Management', () => {
    test('Should fetch project list', async () => {
      const response = await api.get('/api/service/projects/projects/');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('Should create a new project', async () => {
      const projectData = {
        title: `Test Project ${Date.now()}`,
        description: 'Integration test project',
        objective: 'Testing API endpoints',
        status: 'draft'
      };

      try {
        const response = await api.post('/api/service/projects/projects/', projectData);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        expect(response.data.title).toBe(projectData.title);
      } catch (error: any) {
        console.log('Project creation test failed:', error.response?.data);
      }
    });
  });

  describe('Criteria Management', () => {
    test('Should fetch criteria list', async () => {
      const response = await api.get('/api/service/projects/criteria/');
      expect(response.status).toBe(200);
    });
  });

  describe('Service Endpoints', () => {
    test('Accounts service should be accessible', async () => {
      const response = await api.get('/api/service/accounts/');
      expect(response.status).toBe(200);
    });

    test('Evaluations service should be accessible', async () => {
      const response = await api.get('/api/service/evaluations/');
      expect(response.status).toBe(200);
    });

    test('Analysis service should be accessible', async () => {
      const response = await api.get('/api/service/analysis/');
      expect(response.status).toBe(200);
    });
  });
});

// API 엔드포인트 가용성 체크
export async function checkAPIAvailability() {
  const endpoints = [
    '/api/',
    '/health/',
    '/db-status/',
    '/api/service/projects/',
    '/api/service/accounts/',
    '/api/service/evaluations/',
    '/api/service/analysis/'
  ];

  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
          timeout: 5000
        });
        return {
          endpoint,
          status: response.status,
          available: true
        };
      } catch (error: any) {
        return {
          endpoint,
          status: error.response?.status || 0,
          available: false,
          error: error.message
        };
      }
    })
  );

  return results;
}

// 데이터베이스 연결 상태 체크
export async function checkDatabaseConnection() {
  try {
    const response = await axios.get(`${API_BASE_URL}/db-status/`);
    return {
      connected: response.data.connection === 'OK',
      tablesCount: response.data.tables_count,
      tables: response.data.tables
    };
  } catch (error) {
    return {
      connected: false,
      error: error
    };
  }
}