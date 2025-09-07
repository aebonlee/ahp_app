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

  const [newPostForm, setNewPostForm] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'platform',
    author_name: 'AHP 개발팀'
  });
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API 함수들
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/news/posts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching news posts:', error);
      setError('게시글을 불러오는데 실패했습니다.');
      // 오류 시 빈 배열로 설정
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 게시글 작성
  const createPost = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`${API_BASE_URL}/api/news/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newPostForm,
          featured: false,
          published: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      // 성공 시 목록 새로고침
      await fetchPosts();
      setShowNewPostForm(false);
      setNewPostForm({
        title: '',
        content: '',
        summary: '',
        category: 'platform',
        author_name: 'AHP 개발팀'
      });
    } catch (error) {
      console.error('Error creating post:', error);
      setError('게시글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

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
      backgroundColor: 'var(--bg-primary)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 헤더 */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <div style={{ 
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '4rem'
          }}>
            <div style={{
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  margin: 0
                }}>
                  📰 소식 및 사례
                </h1>
              </div>
            </div>
            <button
              onClick={onBackClick}
              style={{
                padding: '0.625rem 1.5rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '0.5rem',
                fontWeight: '500',
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-subtle)';
              }}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </header>

      <div style={{ 
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* 새 게시글 작성 버튼 */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
          <button
            onClick={() => setShowNewPostForm(!showNewPostForm)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            ✍️ 새 게시글 작성
          </button>
        </div>

        {/* 새 게시글 작성 폼 */}
        {showNewPostForm && (
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '0.75rem',
            border: '1px solid var(--border-light)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: 'var(--text-primary)'
            }}>새 게시글 작성</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={newPostForm.title}
                onChange={(e) => setNewPostForm({...newPostForm, title: e.target.value})}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
              
              <select
                value={newPostForm.category}
                onChange={(e) => setNewPostForm({...newPostForm, category: e.target.value})}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              >
                <option value="platform">플랫폼 소식</option>
                <option value="research">연구 성과</option>
                <option value="case">활용 사례</option>
                <option value="news">업계 뉴스</option>
                <option value="update">업데이트</option>
              </select>
              
              <input
                type="text"
                placeholder="요약 (선택사항)"
                value={newPostForm.summary}
                onChange={(e) => setNewPostForm({...newPostForm, summary: e.target.value})}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
              
              <textarea
                placeholder="내용을 입력하세요"
                value={newPostForm.content}
                onChange={(e) => setNewPostForm({...newPostForm, content: e.target.value})}
                rows={6}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowNewPostForm(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
                <button
                  onClick={createPost}
                  disabled={!newPostForm.title || !newPostForm.content || isSubmitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: (!newPostForm.title || !newPostForm.content || isSubmitting) 
                      ? 'var(--bg-subtle)' 
                      : 'var(--accent-primary)',
                    color: (!newPostForm.title || !newPostForm.content || isSubmitting) 
                      ? 'var(--text-muted)' 
                      : 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: (!newPostForm.title || !newPostForm.content || isSubmitting) 
                      ? 'not-allowed' 
                      : 'pointer'
                  }}
                >
                  {isSubmitting ? '작성 중...' : '게시글 작성'}
                </button>
              </div>
            </div>
          </div>
        )}
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