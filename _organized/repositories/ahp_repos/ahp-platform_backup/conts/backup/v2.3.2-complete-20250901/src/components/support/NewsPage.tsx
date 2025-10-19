import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://ahp-platform.onrender.com' 
  : 'http://localhost:5000';

interface NewsPost {
  id: number;
  title: string;
  content: string;
  summary?: string;
  author_name: string;
  created_at: string;
  category: string;
  featured: boolean;
  views: number;
  image_url?: string;
  published: boolean;
}

interface NewsPageProps {
  onBackClick: () => void;
}

const NewsPage: React.FC<NewsPageProps> = ({ onBackClick }) => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<any>(null);

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'platform', label: '플랫폼 업데이트' },
    { value: 'research', label: '연구 성과' },
    { value: 'case', label: '활용 사례' },
    { value: 'news', label: '보도자료' },
    { value: 'event', label: '이벤트' }
  ];

  // API 함수들
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/api/news/posts?category=${selectedCategory}&limit=50`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
      } else {
        setError('소식을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching news posts:', error);
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/news/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching news stats:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [selectedCategory]);

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const featuredPosts = posts.filter(post => post.featured);

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      platform: { label: '플랫폼 업데이트', color: '#0066cc', bg: '#e3f2fd' },
      research: { label: '연구 성과', color: '#22c55e', bg: '#e8f5e8' },
      case: { label: '활용 사례', color: '#f59e0b', bg: '#fef3e2' },
      news: { label: '보도자료', color: '#8b5cf6', bg: '#f3e8ff' },
      event: { label: '이벤트', color: '#ef4444', bg: '#fee2e2' }
    };
    const config = categoryConfig[category as keyof typeof categoryConfig];
    
    return (
      <span 
        className="inline-block px-3 py-1 text-xs font-medium rounded-full"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-subtle)' }}>
      {/* 헤더 */}
      <div className="bg-white border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center">
            <button
              onClick={onBackClick}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                AHP NEWS
              </h1>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                최신 연구 동향과 플랫폼 업데이트 소식
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* 사이드바 - 카테고리 */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              
              {/* 카테고리 필터 */}
              <div className="bg-white rounded-lg p-6 border" style={{ borderColor: 'var(--border-light)' }}>
                <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>카테고리</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.value ? 'font-semibold' : ''
                      }`}
                      style={{
                        backgroundColor: selectedCategory === category.value ? 'var(--accent-light)' : 'transparent',
                        color: selectedCategory === category.value ? 'var(--accent-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 주요 소식 */}
              <div className="bg-white rounded-lg p-6 border" style={{ borderColor: 'var(--border-light)' }}>
                <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>주요 소식</h3>
                <div className="space-y-3">
                  {featuredPosts.map((post) => (
                    <div key={post.id} className="pb-3 border-b border-gray-100 last:border-0">
                      <h4 className="text-sm font-medium mb-1 line-clamp-2 hover:text-blue-600 cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                        {post.title}
                      </h4>
                      <div className="flex items-center text-xs space-x-2" style={{ color: 'var(--text-muted)' }}>
                        <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                        <span>조회 {post.views}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-3">
            
            {/* 에러 메시지 표시 */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* 게시글 목록 */}
            <div className="bg-white rounded-lg border" style={{ borderColor: 'var(--border-light)' }}>
              <div className="p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    전체 소식
                  </h2>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    총 {filteredPosts.length}개의 게시글
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--accent-primary)' }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    소식을 불러오는 중...
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    잠시만 기다려주세요
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                {filteredPosts.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                      backgroundColor: 'var(--bg-subtle)'
                    }}>
                      <svg className="w-8 h-8" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      해당 카테고리에 소식이 없습니다
                    </h3>
                  </div>
                ) : (
                  filteredPosts.map((post, index) => (
                    <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            {getCategoryBadge(post.category)}
                            {post.featured && (
                              <span className="ml-2 inline-block px-2 py-1 text-xs font-medium rounded-full" style={{
                                backgroundColor: '#fee2e2',
                                color: '#ef4444'
                              }}>
                                주요
                              </span>
                            )}
                            <span className="ml-auto text-sm" style={{ color: 'var(--text-muted)' }}>
                              {new Date(post.created_at).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-3 hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                            {post.title}
                          </h3>
                          <p className="text-sm mb-3 line-clamp-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {post.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs space-x-4" style={{ color: 'var(--text-muted)' }}>
                              <span>작성자: {post.author_name}</span>
                              <span>조회 {post.views}</span>
                            </div>
                            <button 
                              className="text-sm font-medium hover:underline"
                              style={{ color: 'var(--accent-primary)' }}
                            >
                              자세히 보기 →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 통계 정보 */}
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 border text-center" style={{ borderColor: 'var(--border-light)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{
                  backgroundColor: 'var(--accent-light)'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="var(--accent-primary)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {posts.length}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>전체 소식</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 border text-center" style={{ borderColor: 'var(--border-light)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{
                  backgroundColor: '#e8f5e8'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {featuredPosts.length}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>주요 소식</div>
              </div>
              
              <div className="bg-white rounded-lg p-6 border text-center" style={{ borderColor: 'var(--border-light)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{
                  backgroundColor: '#fef3e2'
                }}>
                  <svg className="w-6 h-6" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {stats?.total_views || 0}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>총 조회수</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;