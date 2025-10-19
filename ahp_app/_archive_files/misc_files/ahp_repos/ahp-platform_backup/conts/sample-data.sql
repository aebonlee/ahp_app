-- Sample data for AHP Research Platform
-- Run this SQL script directly in PostgreSQL database to populate boards

-- Insert sample news posts
INSERT INTO news_posts (title, content, summary, author_name, category, featured, published, views) VALUES
('AURI 스타일 UI/UX 개편 완료 - 더욱 직관적인 사용자 경험 제공',
'사용자 피드백을 반영하여 전면적인 디자인 개선을 완료했습니다. 미니멀하고 깔끔한 인터페이스로 연구 효율성을 높였습니다. 새로운 디자인은 AURI 웹사이트의 모던한 디자인 트렌드를 적용하여 사용자 경험을 크게 향상시켰습니다.',
'새로운 AURI 스타일 디자인으로 UI/UX 전면 개편',
'개발팀',
'platform',
true,
true,
324),

('국내 주요 대학 1,000+ 논문에서 AHP 분석 도구 활용 검증',
'서울대, 연세대, 고려대 등 주요 대학의 논문 연구에서 우리 플랫폼을 활용한 AHP 분석 결과가 높은 신뢰도를 보였습니다. 특히 일관성 비율과 분석 정확도에서 기존 도구 대비 우수한 성능을 입증했습니다.',
'주요 대학 1,000+ 논문에서 AHP 도구 활용 성과 검증',
'연구팀',
'research',
true,
true,
567),

('한국직업능력개발센터와 AHP 연구 플랫폼 파트너십 체결',
'교육 및 연구 분야의 의사결정 지원을 위한 전략적 파트너십을 체결했습니다. 이를 통해 더 많은 연구자들이 고품질의 AHP 분석 서비스를 이용할 수 있게 되었습니다.',
'교육 연구 분야 의사결정 지원 파트너십 체결',
'경영진',
'news',
false,
true,
445),

('삼성전자 연구소 - AHP를 활용한 신제품 개발 우선순위 분석 사례',
'삼성전자 연구소에서 신제품 개발 프로젝트의 우선순위를 결정하기 위해 우리 플랫폼을 활용했습니다. 50명의 전문가가 참여한 대규모 평가를 통해 성공적인 의사결정을 이끌어냈습니다.',
'삼성전자 연구소 신제품 개발 우선순위 분석 성공 사례',
'사례연구팀',
'case',
false,
true,
678),

('2024년 하반기 AHP 연구 워크샵 개최 안내',
'9월 15일부터 17일까지 3일간 AHP 방법론과 플랫폼 활용법을 배우는 워크샵을 개최합니다. 초급자부터 고급 사용자까지 수준별 프로그램을 제공합니다.',
'AHP 방법론 및 플랫폼 활용 워크샵 개최',
'교육팀',
'event',
false,
true,
234),

('AI 기반 일관성 개선 기능 베타 출시',
'인공지능을 활용하여 쌍대비교의 일관성을 자동으로 개선해주는 새로운 기능을 베타 버전으로 출시했습니다. 평가자의 판단 패턴을 학습하여 더 나은 결과를 제안합니다.',
'AI 기반 쌍대비교 일관성 자동 개선 기능 베타 출시',
'AI개발팀',
'platform',
false,
true,
512)
ON CONFLICT DO NOTHING;

-- Insert sample support posts  
INSERT INTO support_posts (title, content, author_name, author_email, category, status, views) VALUES
('AHP 분석 결과의 일관성 비율이 0.1을 초과할 때 해결 방법',
'쌍대비교를 진행했는데 일관성 비율이 0.15가 나왔습니다. 어떻게 개선할 수 있을까요?',
'연구자김',
'kim.researcher@university.ac.kr',
'technical',
'answered',
127),

('평가자 초대 메일이 발송되지 않는 문제',
'프로젝트에 평가자를 초대했는데 메일이 발송되지 않고 있습니다.',
'교수박',
'park.professor@college.edu',
'bug',
'open',
89),

('기관 플랜 할인 문의',
'대학교에서 단체로 이용할 예정인데 할인 혜택이 있나요?',
'관리자이',
'lee.admin@institution.org',
'billing',
'answered',
156)
ON CONFLICT DO NOTHING;