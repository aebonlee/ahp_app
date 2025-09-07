import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://ahp-platform.onrender.com' 
  : 'http://localhost:5000';

interface SupportFAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  popular: boolean;
}

interface ContactInfo {
  type: string;
  title: string;
  content: string;
  icon: string;
  action?: string;
}

interface SupportPageProps {
  onBackClick: () => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ onBackClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [faqs, setFaqs] = useState<SupportFAQ[]>([]);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    content: '',
    category: 'general',
    user_name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'general', label: '일반 문의' },
    { value: 'technical', label: '기술 지원' },
    { value: 'billing', label: '결제/요금' },
    { value: 'guide', label: '사용법 문의' },
    { value: 'account', label: '계정 관리' }
  ];

  // API 함수들
  const fetchFAQs = async () => {
    try {
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/api/support/faqs`);
      if (!response.ok) {
        throw new Error('Failed to fetch FAQs');
      }
      
      const data = await response.json();
      setFaqs(data.faqs || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setError('FAQ를 불러오는데 실패했습니다.');
      setFaqs([]);
    }
  };

  // 새 문의 작성
  const createSupportTicket = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`${API_BASE_URL}/api/support/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTicket)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create support ticket');
      }
      
      // 성공 시 폼 초기화
      setShowNewTicketForm(false);
      setNewTicket({
        title: '',
        content: '',
        category: 'general',
        user_name: ''
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('문의 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchFAQs();
  }, []);

  const contactInfo: ContactInfo[] = [
    {
      type: 'email',
      title: '이메일 문의',
      content: 'support@ahp-platform.com',
      icon: '📧',
      action: 'mailto:support@ahp-platform.com'
    },
    {
      type: 'phone',
      title: '전화 문의',
      content: '02-1234-5678 (평일 9:00-18:00)',
      icon: '📞',
      action: 'tel:02-1234-5678'
    },
    {
      type: 'chat',
      title: '실시간 채팅',
      content: '평일 9:00-18:00 운영',
      icon: '💬'
    },
    {
      type: 'guide',
      title: '사용자 가이드',
      content: '단계별 사용법 안내',
      icon: '📖'
    }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs.filter(faq => 
        faq.category === selectedCategory && 
        (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const popularFAQs = faqs.filter(faq => faq.popular);

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      general: { label: '일반 문의', color: '#6b7280', bg: '#f3f4f6' },
      technical: { label: '기술 지원', color: '#0066cc', bg: '#e3f2fd' },
      billing: { label: '결제/요금', color: '#22c55e', bg: '#e8f5e8' },
      guide: { label: '사용법 문의', color: '#f59e0b', bg: '#fef3e2' },
      account: { label: '계정 관리', color: '#8b5cf6', bg: '#f3e8ff' }
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
                  🎧 고객 지원
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
        
        {/* 새 문의 작성 버튼 */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
          <button
            onClick={() => setShowNewTicketForm(!showNewTicketForm)}
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
            ✉️ 새 문의 작성
          </button>
        </div>

        {/* 새 문의 작성 폼 */}
        {showNewTicketForm && (
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
            }}>새 문의 작성</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="이름을 입력하세요"
                value={newTicket.user_name}
                onChange={(e) => setNewTicket({...newTicket, user_name: e.target.value})}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              />
              
              <input
                type="text"
                placeholder="문의 제목을 입력하세요"
                value={newTicket.title}
                onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
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
                value={newTicket.category}
                onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              >
                <option value="general">일반 문의</option>
                <option value="technical">기술 지원</option>
                <option value="billing">결제/요금</option>
                <option value="guide">사용법 문의</option>
                <option value="account">계정 관리</option>
              </select>
              
              <textarea
                placeholder="문의 내용을 입력하세요"
                value={newTicket.content}
                onChange={(e) => setNewTicket({...newTicket, content: e.target.value})}
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
                  onClick={() => setShowNewTicketForm(false)}
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
                  onClick={createSupportTicket}
                  disabled={!newTicket.title || !newTicket.content || !newTicket.user_name || isSubmitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: (!newTicket.title || !newTicket.content || !newTicket.user_name || isSubmitting) 
                      ? 'var(--bg-subtle)' 
                      : 'var(--accent-primary)',
                    color: (!newTicket.title || !newTicket.content || !newTicket.user_name || isSubmitting) 
                      ? 'var(--text-muted)' 
                      : 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: (!newTicket.title || !newTicket.content || !newTicket.user_name || isSubmitting) 
                      ? 'not-allowed' 
                      : 'pointer'
                  }}
                >
                  {isSubmitting ? '작성 중...' : '문의 작성'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 표시 */}
        {error && (
          <div style={{ 
            marginBottom: '1.5rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <p style={{ 
              fontSize: '0.875rem',
              color: '#ef4444',
              fontWeight: '500'
            }}>{error}</p>
          </div>
        )}

        {/* 검색 및 빠른 도움말 */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ 
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: 'var(--text-primary)'
            }}>
              무엇을 도와드릴까요?
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              자주 묻는 질문을 검색하거나 카테고리별로 찾아보세요
            </p>
          </div>

          {/* 검색창 */}
          <div style={{ 
            position: 'relative',
            maxWidth: '32rem',
            margin: '0 auto 2rem auto'
          }}>
            <input
              type="text"
              placeholder="궁금한 내용을 검색해보세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            />
            <svg style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1.25rem',
              height: '1.25rem',
              color: 'var(--text-muted)'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* 빠른 연락처 */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            maxWidth: '64rem',
            margin: '0 auto'
          }}>
            {contactInfo.map((contact, index) => (
              <div key={index} style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                border: '1px solid var(--border-light)',
                textAlign: 'center',
                cursor: contact.action ? 'pointer' : 'default',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (contact.action) {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (contact.action) {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }
              }}
              onClick={() => {
                if (contact.action) {
                  if (contact.action.startsWith('mailto:') || contact.action.startsWith('tel:')) {
                    window.location.href = contact.action;
                  }
                }
              }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
                  {contact.icon}
                </div>
                <h3 style={{ 
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  {contact.title}
                </h3>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}>
                  {contact.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'minmax(250px, 300px) 1fr',
          gap: '2rem'
        }}>
          
          {/* 사이드바 */}
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

              {/* 인기 질문 */}
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
                }}>인기 질문</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {popularFAQs.map((faq) => (
                    <div key={faq.id} style={{ 
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
                        {faq.question}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {getCategoryBadge(faq.category)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* 메인 컨텐츠 - FAQ 목록 */}
          <div>
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
                    자주 묻는 질문
                  </h2>
                  <span style={{ 
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    총 {filteredFAQs.length}개의 질문
                  </span>
                </div>
              </div>

              <div>
                {filteredFAQs.length === 0 ? (
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 style={{ 
                      fontSize: '1.125rem',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      color: 'var(--text-primary)'
                    }}>
                      검색 결과가 없습니다
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      다른 키워드로 검색해보시거나 직접 문의해주세요
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredFAQs.map((faq, index) => (
                      <details key={faq.id} style={{ 
                        borderBottom: '1px solid var(--border-light)'
                      }}>
                        <summary style={{
                          padding: '1.5rem',
                          cursor: 'pointer',
                          listStyle: 'none',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.parentElement as HTMLElement).style.backgroundColor = 'var(--bg-subtle)'}
                        onMouseLeave={(e) => (e.currentTarget.parentElement as HTMLElement).style.backgroundColor = 'transparent'}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              marginBottom: '0.5rem'
                            }}>
                              {getCategoryBadge(faq.category)}
                              {faq.popular && (
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
                                  인기
                                </span>
                              )}
                            </div>
                            <h3 style={{ 
                              fontSize: '1.125rem',
                              fontWeight: '600',
                              color: 'var(--text-primary)',
                              lineHeight: '1.5'
                            }}>
                              {faq.question}
                            </h3>
                          </div>
                          <svg style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            color: 'var(--text-muted)',
                            marginLeft: '1rem',
                            flexShrink: 0,
                            transition: 'transform 0.3s ease'
                          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div style={{ 
                          padding: '0 1.5rem 1.5rem 1.5rem'
                        }}>
                          <p style={{ 
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {faq.answer}
                          </p>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;