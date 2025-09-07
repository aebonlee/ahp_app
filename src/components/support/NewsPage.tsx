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

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'platform', label: '플랫폼 소식' },
    { value: 'research', label: '연구 성과' },
    { value: 'case', label: '활용 사례' },
    { value: 'news', label: '업계 뉴스' },
    { value: 'update', label: '업데이트' }
  ];

  // 샘플 데이터 (실제 서비스에서는 API로 교체)
  const samplePosts: NewsPost[] = [
    {
      id: 1,
      title: 'AHP for Paper 3.0 출시 - 새로운 분석 기능 추가',
      content: 'AHP for Paper의 주요 업데이트가 완료되었습니다. 새로운 민감도 분석 기능과 향상된 시각화 도구를 만나보세요.',
      summary: 'AHP for Paper 3.0의 새로운 기능과 개선사항을 소개합니다.',
      author_name: 'AHP 개발팀',
      created_at: '2025-01-20T10:00:00Z',
      category: 'platform',
      featured: true,
      views: 1250,
      published: true
    },
    {
      id: 2,
      title: '서울대학교 경영대학원 AHP 논문 연구 성과 발표',
      content: 'AHP for Paper를 활용한 공급망 관리 의사결정 연구가 국제 학술지에 게재되었습니다.',
      summary: '학술 연구 성과와 AHP 방법론의 실무 적용 사례를 공유합니다.',
      author_name: '연구팀',
      created_at: '2025-01-18T14:30:00Z',
      category: 'research',
      featured: true,
      views: 892,
      published: true
    },
    {
      id: 3,
      title: '대기업 인사평가시스템 도입 사례 - LG전자',
      content: 'LG전자에서 AHP 방법론을 활용하여 공정하고 객관적인 인사평가시스템을 구축한 사례를 소개합니다.',
      summary: '대기업의 AHP 방법론 활용 사례와 도입 효과를 분석합니다.',
      author_name: '사례연구팀',
      created_at: '2025-01-15T09:15:00Z',
      category: 'case',
      featured: false,
      views: 687,
      published: true
    },
    {
      id: 4,
      title: '2025년 의사결정 분석 트렌드 - AHP 방법론 주목받아',
      content: '최근 복잡한 비즈니스 환경에서 체계적 의사결정 방법론으로 AHP가 각광받고 있습니다.',
      summary: '업계 전문가들이 전망하는 2025년 의사결정 분석 트렌드입니다.',
      author_name: '업계분석팀',
      created_at: '2025-01-12T16:45:00Z',
      category: 'news',
      featured: false,
      views: 543,
      published: true
    },
    {
      id: 5,
      title: '모바일 앱 베타 테스트 시작 - 언제 어디서나 AHP 분석',
      content: 'AHP for Paper 모바일 앱의 베타 테스트가 시작되었습니다. 테스터를 모집하고 있으니 많은 참여 부탁드립니다.',
      summary: '모바일 앱 베타 테스트 참여 방법과 주요 기능을 안내합니다.',
      author_name: '모바일팀',
      created_at: '2025-01-10T11:20:00Z',
      category: 'update',
      featured: true,
      views: 756,
      published: true
    }
  ];

  // API 함수들
  const fetchPosts = async () => {
    try {
      setLoading(true);
      // 실제 API 호출 대신 샘플 데이터 사용
      setTimeout(() => {
        setPosts(samplePosts);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching news posts:', error);
      setError('서버 연결에 실패했습니다.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const featuredPosts = posts.filter(post => post.featured);

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      platform: { label: '플랫폼 소식', color: '#0066cc', bg: '#e3f2fd' },
      research: { label: '연구 성과', color: '#22c55e', bg: '#e8f5e8' },
      case: { label: '활용 사례', color: '#f59e0b', bg: '#fef3e2' },
      news: { label: '업계 뉴스', color: '#8b5cf6', bg: '#f3e8ff' },
      update: { label: '업데이트', color: '#ef4444', bg: '#fee2e2' }
    };
    const config = categoryConfig[category as keyof typeof categoryConfig] || { label: category, color: '#6b7280', bg: '#f3f4f6' };
    
    return (
      <span 
        style={{ 
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          fontSize: '0.75rem',
          fontWeight: '500',
          borderRadius: '9999px',
          backgroundColor: config.bg,
          color: config.color
        }}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-subtle)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 헤더 */}
      <div style={{ 
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ 
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center'
        }}>
          <button
            onClick={onBackClick}
            style={{
              marginRight: '1rem',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-subtle)'}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'}
          >
            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 style={{ 
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              📰 소식 및 사례
            </h1>
            <p style={{ 
              marginTop: '0.5rem',
              color: 'var(--text-secondary)',
              margin: '0.5rem 0 0 0'
            }}>
              최신 연구 동향과 플랫폼 업데이트 소식을 만나보세요
            </p>
          </div>
        </div>
      </div>

      <div style={{ 
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'minmax(250px, 300px) 1fr',
          gap: '2rem'
        }}>
          
          {/* 사이드바 - 카테고리 */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* 카테고리 필터 */}
              <div style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                border: '1px solid var(--border-light)'
              }}>
                <h3 style={{ 
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: 'var(--text-primary)',
                  fontSize: '1.125rem'
                }}>카테고리</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {categories.map(category => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backgroundColor: selectedCategory === category.value ? 'var(--accent-light)' : 'transparent',
                        color: selectedCategory === category.value ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: selectedCategory === category.value ? '600' : '400'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCategory !== category.value) {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-subtle)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCategory !== category.value) {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 주요 소식 */}
              <div style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                border: '1px solid var(--border-light)'
              }}>
                <h3 style={{ 
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: 'var(--text-primary)',
                  fontSize: '1.125rem'
                }}>주요 소식</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {featuredPosts.map((post) => (
                    <div key={post.id} style={{ 
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid var(--border-light)'
                    }}>
                      <h4 style={{ 
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        lineHeight: '1.4'
                      }}>
                        {post.title}
                      </h4>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        gap: '0.5rem',
                        color: 'var(--text-muted)'
                      }}>
                        <span>{formatDate(post.created_at)}</span>
                        <span>•</span>
                        <span>조회 {post.views.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <div>
            
            {/* 에러 메시지 표시 */}
            {error && (
              <div style={{ 
                marginBottom: '1.5rem',
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg style={{ 
                    width: '1.25rem',
                    height: '1.25rem',
                    color: '#ef4444',
                    marginRight: '0.5rem'
                  }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: '#dc2626',
                    fontWeight: '500'
                  }}>{error}</p>
                </div>
              </div>
            )}

            {/* 게시글 목록 */}
            <div style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '0.75rem',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ 
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-light)'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <h2 style={{ 
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)'
                  }}>
                    전체 소식
                  </h2>
                  <span style={{ 
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    총 {filteredPosts.length}개의 게시글
                  </span>
                </div>
              </div>

              {loading ? (
                <div style={{ 
                  padding: '3rem',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      border: '3px solid var(--accent-light)',
                      borderTop: '3px solid var(--accent-primary)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                  <h3 style={{ 
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)'
                  }}>
                    소식을 불러오는 중...
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    잠시만 기다려주세요
                  </p>
                </div>
              ) : (
                <div>
                  {filteredPosts.length === 0 ? (
                    <div style={{ 
                      padding: '3rem',
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        width: '4rem',
                        height: '4rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem auto',
                        backgroundColor: 'var(--bg-subtle)'
                      }}>
                        <svg style={{ 
                          width: '2rem',
                          height: '2rem',
                          color: 'var(--text-muted)'
                        }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                      <h3 style={{ 
                        fontSize: '1.125rem',
                        fontWeight: '500',
                        marginBottom: '0.5rem',
                        color: 'var(--text-primary)'
                      }}>
                        해당 카테고리에 소식이 없습니다
                      </h3>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        다른 카테고리를 선택해보세요
                      </p>
                    </div>
                  ) : (
                    filteredPosts.map((post) => (
                      <div key={post.id} style={{ 
                        padding: '1.5rem',
                        borderBottom: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'}
                      >
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              marginBottom: '0.75rem'
                            }}>
                              {getCategoryBadge(post.category)}
                              {post.featured && (
                                <span style={{
                                  marginLeft: '0.5rem',
                                  display: 'inline-block',
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  borderRadius: '9999px',
                                  backgroundColor: '#fee2e2',
                                  color: '#ef4444'
                                }}>
                                  주요
                                </span>
                              )}
                            </div>
                            
                            <h3 style={{ 
                              fontSize: '1.125rem',
                              fontWeight: '600',
                              marginBottom: '0.5rem',
                              color: 'var(--text-primary)',
                              lineHeight: '1.5'
                            }}>
                              {post.title}
                            </h3>
                            
                            <p style={{ 
                              fontSize: '0.875rem',
                              color: 'var(--text-secondary)',
                              lineHeight: '1.5',
                              marginBottom: '0.75rem'
                            }}>
                              {post.summary || post.content.substring(0, 120) + '...'}
                            </p>
                            
                            <div style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '0.75rem',
                              gap: '0.75rem',
                              color: 'var(--text-muted)'
                            }}>
                              <span>{post.author_name}</span>
                              <span>•</span>
                              <span>{formatDate(post.created_at)}</span>
                              <span>•</span>
                              <span>조회 {post.views.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NewsPage;