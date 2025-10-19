import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

let query: (sql: string, params?: any[]) => Promise<any>;
let initDatabase: () => Promise<void>;

// PostgreSQL 연결 설정
const databaseUrl = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl?.includes('render.com') ? { rejectUnauthorized: false } : false
});

console.log('Connecting to PostgreSQL:', databaseUrl ? 'Remote Render.com database' : 'Local database');

pool.on('error', (err: any) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

query = (text: string, params?: any[]) => pool.query(text, params);

initDatabase = async () => {
  try {
    console.log('Initializing PostgreSQL database...');
    
    // 기본 테이블 생성 (001_initial_schema.sql 내용)
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) CHECK(role IN ('admin', 'evaluator')) NOT NULL DEFAULT 'evaluator',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        description TEXT,
        objective TEXT,
        admin_id INTEGER NOT NULL REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'draft',
        evaluation_mode VARCHAR(20) DEFAULT 'practical' CHECK (evaluation_mode IN ('practical', 'theoretical', 'direct_input')),
        workflow_stage VARCHAR(20) DEFAULT 'creating' CHECK (workflow_stage IN ('creating', 'waiting', 'evaluating', 'completed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 기준(Criteria) 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS criteria (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        parent_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
        level INTEGER NOT NULL DEFAULT 1,
        weight DECIMAL(10,6) DEFAULT 0,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 대안(Alternatives) 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS alternatives (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        cost DECIMAL(12,2) DEFAULT 0,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 평가자 배정 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS project_evaluators (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, evaluator_id)
      )
    `);

    // 쌍대비교 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS pairwise_comparisons (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        evaluator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        criterion_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
        element1_id INTEGER NOT NULL,
        element2_id INTEGER NOT NULL,
        element1_type VARCHAR(20) NOT NULL CHECK (element1_type IN ('criterion', 'alternative')),
        element2_type VARCHAR(20) NOT NULL CHECK (element2_type IN ('criterion', 'alternative')),
        comparison_value DECIMAL(10,6) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, evaluator_id, criterion_id, element1_id, element2_id, element1_type, element2_type)
      )
    `);

    // 결과 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        evaluator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        criterion_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
        element_id INTEGER NOT NULL,
        element_type VARCHAR(20) NOT NULL CHECK (element_type IN ('criterion', 'alternative')),
        local_weight DECIMAL(10,6) NOT NULL,
        global_weight DECIMAL(10,6),
        consistency_ratio DECIMAL(10,6),
        calculation_type VARCHAR(20) NOT NULL CHECK (calculation_type IN ('individual', 'group')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 직접 입력 데이터 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS direct_input_data (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        criterion_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
        element_id INTEGER NOT NULL,
        element_type VARCHAR(20) NOT NULL CHECK (element_type IN ('criterion', 'alternative')),
        input_value DECIMAL(10,6) NOT NULL,
        input_method VARCHAR(20) NOT NULL DEFAULT 'weight' CHECK (input_method IN ('weight', 'score', 'rating')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, evaluator_id, criterion_id, element_id, element_type)
      )
    `);

    // 평가 방식 이력 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS evaluation_mode_history (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        previous_mode VARCHAR(20),
        new_mode VARCHAR(20) NOT NULL,
        changed_by INTEGER NOT NULL REFERENCES users(id),
        change_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 워크플로우 상태 이력 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS workflow_stage_history (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        previous_stage VARCHAR(20),
        new_stage VARCHAR(20) NOT NULL,
        changed_by INTEGER NOT NULL REFERENCES users(id),
        change_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 인덱스 생성
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_admin_id ON projects(admin_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_evaluation_mode ON projects(evaluation_mode)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_projects_workflow_stage ON projects(workflow_stage)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_criteria_project_id ON criteria(project_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_alternatives_project_id ON alternatives(project_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_evaluators_project_id ON project_evaluators(project_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_project_evaluators_evaluator_id ON project_evaluators(evaluator_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pairwise_comparisons_project_id ON pairwise_comparisons(project_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_pairwise_comparisons_evaluator_id ON pairwise_comparisons(evaluator_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_results_project_id ON results(project_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_direct_input_data_project_evaluator ON direct_input_data(project_id, evaluator_id)`);

    // 트리거 함수들 생성
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await query(`
      CREATE OR REPLACE FUNCTION record_evaluation_mode_change()
      RETURNS TRIGGER AS $$
      BEGIN
          IF OLD.evaluation_mode IS DISTINCT FROM NEW.evaluation_mode THEN
              INSERT INTO evaluation_mode_history (project_id, previous_mode, new_mode, changed_by)
              VALUES (NEW.id, OLD.evaluation_mode, NEW.evaluation_mode, NEW.admin_id);
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await query(`
      CREATE OR REPLACE FUNCTION record_workflow_stage_change()
      RETURNS TRIGGER AS $$
      BEGIN
          IF OLD.workflow_stage IS DISTINCT FROM NEW.workflow_stage THEN
              INSERT INTO workflow_stage_history (project_id, previous_stage, new_stage, changed_by)
              VALUES (NEW.id, OLD.workflow_stage, NEW.workflow_stage, NEW.admin_id);
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 트리거 생성
    await query(`
      DROP TRIGGER IF EXISTS trigger_projects_updated_at ON projects;
      CREATE TRIGGER trigger_projects_updated_at
          BEFORE UPDATE ON projects
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    await query(`
      DROP TRIGGER IF EXISTS trigger_evaluation_mode_change ON projects;
      CREATE TRIGGER trigger_evaluation_mode_change
          AFTER UPDATE ON projects
          FOR EACH ROW
          EXECUTE FUNCTION record_evaluation_mode_change();
    `);

    await query(`
      DROP TRIGGER IF EXISTS trigger_workflow_stage_change ON projects;
      CREATE TRIGGER trigger_workflow_stage_change
          AFTER UPDATE ON projects
          FOR EACH ROW
          EXECUTE FUNCTION record_workflow_stage_change();
    `);

    await query(`
      DROP TRIGGER IF EXISTS trigger_direct_input_data_updated_at ON direct_input_data;
      CREATE TRIGGER trigger_direct_input_data_updated_at
          BEFORE UPDATE ON direct_input_data
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);

    // 뷰 생성
    await query(`
      CREATE OR REPLACE VIEW project_status_summary AS
      SELECT 
          p.id,
          p.name,
          p.title,
          p.description,
          p.status,
          p.evaluation_mode,
          p.workflow_stage,
          p.created_at,
          p.updated_at,
          u.first_name || ' ' || u.last_name AS admin_name,
          COUNT(DISTINCT pe.evaluator_id) AS evaluator_count,
          COUNT(DISTINCT pc.id) AS comparison_count,
          COUNT(DISTINCT did.id) AS direct_input_count,
          CASE 
              WHEN p.workflow_stage = 'creating' THEN '모델 구축 중'
              WHEN p.workflow_stage = 'waiting' THEN '평가 대기 중'
              WHEN p.workflow_stage = 'evaluating' THEN '평가 진행 중'
              WHEN p.workflow_stage = 'completed' THEN '평가 완료'
              ELSE '알 수 없음'
          END AS stage_description,
          CASE 
              WHEN p.evaluation_mode = 'practical' THEN '쌍대비교 - 실용'
              WHEN p.evaluation_mode = 'theoretical' THEN '쌍대비교 - 이론'
              WHEN p.evaluation_mode = 'direct_input' THEN '직접 입력'
              ELSE '알 수 없음'
          END AS mode_description
      FROM projects p
      LEFT JOIN users u ON p.admin_id = u.id
      LEFT JOIN project_evaluators pe ON p.id = pe.project_id
      LEFT JOIN pairwise_comparisons pc ON p.id = pc.project_id
      LEFT JOIN direct_input_data did ON p.id = did.project_id
      GROUP BY p.id, u.first_name, u.last_name;
    `);

    await query(`
      CREATE OR REPLACE VIEW project_progress AS
      SELECT 
          p.id AS project_id,
          p.name AS project_name,
          p.title AS project_title,
          p.workflow_stage,
          COUNT(DISTINCT c.id) AS criteria_count,
          COUNT(DISTINCT a.id) AS alternative_count,
          COUNT(DISTINCT pe.evaluator_id) AS evaluator_count,
          COUNT(DISTINCT pc.evaluator_id) AS active_evaluator_count,
          CASE 
              WHEN COUNT(DISTINCT pe.evaluator_id) = 0 THEN 0
              ELSE ROUND(
                  (COUNT(DISTINCT pc.evaluator_id)::DECIMAL / COUNT(DISTINCT pe.evaluator_id) * 100), 2
              )
          END AS completion_percentage
      FROM projects p
      LEFT JOIN criteria c ON p.id = c.project_id
      LEFT JOIN alternatives a ON p.id = a.project_id
      LEFT JOIN project_evaluators pe ON p.id = pe.project_id
      LEFT JOIN pairwise_comparisons pc ON p.id = pc.project_id
      GROUP BY p.id, p.name, p.title, p.workflow_stage;
    `);

    // 기본 관리자 계정 생성
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    try {
      await query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) 
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
      `, ['admin@ahp-system.com', hashedPassword, 'Admin', 'User', 'admin', true]);
    } catch (error) {
      console.log('Admin user already exists, skipping...');
    }

    // 샘플 데이터 생성 (개발 환경에서만)
    if (process.env.NODE_ENV !== 'production') {
      await createSampleData();
    }

    console.log('PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('Error initializing PostgreSQL database:', error);
    throw error;
  }
};

async function createSampleData() {
  try {
    // 샘플 프로젝트 생성
    const projectResult = await query(`
      INSERT INTO projects (title, name, description, objective, admin_id, status, evaluation_mode, workflow_stage) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [
      'AI 개발 활용 방안 중요도 분석',
      'AI 개발 활용 방안 중요도 분석', 
      '소프트웨어 개발자의 AI 활용 방안에 대한 중요도 분석',
      '개발 생산성 향상을 위한 AI 도구들의 우선순위 결정',
      1,
      'active',
      'practical',
      'evaluating'
    ]);

    const projectId = projectResult.rows[0]?.id || 1;

    // 기준 데이터 생성
    await query(`
      INSERT INTO criteria (project_id, name, description, level, order_index) VALUES
      ($1, '개발 생산성 효율화', 'AI 도구를 통한 개발 속도 및 효율성 향상', 1, 1),
      ($2, '코딩 실무 품질 적합화', 'AI 지원을 통한 코드 품질 및 최적화 개선', 1, 2),
      ($3, '개발 프로세스 자동화', 'AI 기반 자동화를 통한 반복 작업 최소화', 1, 3)
      ON CONFLICT DO NOTHING
    `, [projectId, projectId, projectId]);

    // 대안 데이터 생성
    await query(`
      INSERT INTO alternatives (project_id, name, description, order_index) VALUES
      ($1, 'Claude Code', 'AI 페어 프로그래밍 및 코드 작성 지원', 1),
      ($2, 'GitHub Copilot', 'GitHub 통합 AI 코딩 어시스턴트', 2),
      ($3, 'Cursor AI', 'AI 기반 코드 에디터 및 개발 환경', 3),
      ($4, 'Tabnine', 'AI 코드 완성 및 제안 도구', 4),
      ($5, 'CodeT5', '오픈소스 AI 코딩 모델', 5),
      ($6, 'Amazon CodeWhisperer', 'AWS 통합 AI 개발 도구', 6),
      ($7, 'Replit Ghostwriter', '클라우드 기반 AI 코딩 도구', 7),
      ($8, 'Kite', 'Python 중심 AI 코드 어시스턴트', 8),
      ($9, 'DeepCode', 'AI 기반 코드 리뷰 및 버그 탐지', 9)
      ON CONFLICT DO NOTHING
    `, Array(9).fill(projectId));

    console.log('Sample data created successfully');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

export { query, initDatabase };
export default pool;