-- 뉴스 및 고객지원 게시판 테이블 생성
-- 생성일: 2025-01-25

-- 1. 뉴스 게시글 테이블
CREATE TABLE IF NOT EXISTS news_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(500),
    author_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('platform', 'research', 'case', 'news', 'update')),
    featured BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT TRUE,
    views INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 고객지원 게시글 테이블  
CREATE TABLE IF NOT EXISTS support_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'technical', 'billing', 'guide', 'account')),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 고객지원 답변 테이블
CREATE TABLE IF NOT EXISTS support_replies (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES support_posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    content TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. FAQ 테이블
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'technical', 'billing', 'guide', 'account')),
    popular BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_news_posts_category ON news_posts(category);
CREATE INDEX IF NOT EXISTS idx_news_posts_featured ON news_posts(featured);
CREATE INDEX IF NOT EXISTS idx_news_posts_published ON news_posts(published);
CREATE INDEX IF NOT EXISTS idx_news_posts_created_at ON news_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_posts_category ON support_posts(category);
CREATE INDEX IF NOT EXISTS idx_support_posts_status ON support_posts(status);
CREATE INDEX IF NOT EXISTS idx_support_posts_user_id ON support_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_support_posts_created_at ON support_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_replies_post_id ON support_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_popular ON faqs(popular);

-- 6. 업데이트 트리거 적용
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_news_posts_modtime') THEN
        CREATE TRIGGER update_news_posts_modtime 
            BEFORE UPDATE ON news_posts 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_support_posts_modtime') THEN
        CREATE TRIGGER update_support_posts_modtime 
            BEFORE UPDATE ON support_posts 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_support_replies_modtime') THEN
        CREATE TRIGGER update_support_replies_modtime 
            BEFORE UPDATE ON support_replies 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_faqs_modtime') THEN
        CREATE TRIGGER update_faqs_modtime 
            BEFORE UPDATE ON faqs 
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
END $$;

-- 7. 샘플 데이터 삽입

-- 뉴스 샘플 데이터 (1개)
INSERT INTO news_posts (title, content, summary, author_name, category, featured, views) 
VALUES (
    'AHP for Paper 3.0 출시 - 새로운 분석 기능 추가',
    'AHP for Paper의 주요 업데이트가 완료되었습니다. 새로운 민감도 분석 기능과 향상된 시각화 도구를 만나보세요. 이번 업데이트에서는 사용자 요청사항을 반영하여 더욱 직관적인 인터페이스와 강력한 분석 기능을 제공합니다.',
    'AHP for Paper 3.0의 새로운 기능과 개선사항을 소개합니다.',
    'AHP 개발팀',
    'platform',
    true,
    1250
) ON CONFLICT DO NOTHING;

-- FAQ 샘플 데이터 (1개)
INSERT INTO faqs (question, answer, category, popular, order_index)
VALUES (
    'AHP for Paper는 어떤 서비스인가요?',
    'AHP for Paper는 AHP(Analytic Hierarchy Process) 방법론을 활용하여 복잡한 의사결정 문제를 체계적으로 분석할 수 있도록 도와주는 온라인 플랫폼입니다. 연구자, 기업, 교육기관에서 논문 작성, 정책 결정, 사업 평가 등에 활용하실 수 있습니다.',
    'general',
    true,
    1
) ON CONFLICT DO NOTHING;

COMMIT;