import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    projectUpdates: true,
    evaluationReminders: true,
    weeklyReport: false,
    marketing: false
  });

  const [profile, setProfile] = useState({
    name: '홍길동',
    email: 'hong@example.com',
    company: '한국직업능력개발센터',
    position: '연구원',
    phone: '010-1234-5678'
  });

  return (
    <div style={{ padding: '2rem' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--text-primary)',
          margin: 0
        }}>
          설정
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          marginTop: '0.5rem'
        }}>
          계정 및 시스템 설정을 관리하세요
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '2rem'
      }}>
        {/* 사이드 메뉴 */}
        <div>
          <Card variant="elevated">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'profile', label: '프로필', icon: '👤' },
                { id: 'subscription', label: '구독 관리', icon: '💳' },
                { id: 'notifications', label: '알림 설정', icon: '🔔' },
                { id: 'security', label: '보안', icon: '🔒' },
                { id: 'api', label: 'API 키', icon: '🔑' },
                { id: 'billing', label: '결제 정보', icon: '💰' }
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: activeSection === section.id ? 'var(--bg-secondary)' : 'transparent',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: activeSection === section.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: activeSection === section.id ? '600' : '400',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ marginRight: '0.5rem' }}>{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* 콘텐츠 영역 */}
        <div>
          {activeSection === 'profile' && (
            <Card title="프로필 설정" variant="elevated">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    이름
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    이메일
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    회사/조직
                  </label>
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile({...profile, company: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    직책
                  </label>
                  <input
                    type="text"
                    value={profile.position}
                    onChange={(e) => setProfile({...profile, position: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    연락처
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid var(--border-default)',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button variant="primary">
                    변경사항 저장
                  </Button>
                  <Button variant="secondary">
                    취소
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card title="알림 설정" variant="elevated">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '0.5rem'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                      이메일 알림
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      중요한 업데이트를 이메일로 받습니다
                    </div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: notifications.email ? '#3b82f6' : '#ccc',
                      transition: '0.4s',
                      borderRadius: '24px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        height: '16px',
                        width: '16px',
                        left: notifications.email ? '28px' : '4px',
                        bottom: '4px',
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '0.5rem'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                      프로젝트 업데이트
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      프로젝트 상태 변경 시 알림
                    </div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                    <input
                      type="checkbox"
                      checked={notifications.projectUpdates}
                      onChange={(e) => setNotifications({...notifications, projectUpdates: e.target.checked})}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: notifications.projectUpdates ? '#3b82f6' : '#ccc',
                      transition: '0.4s',
                      borderRadius: '24px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        height: '16px',
                        width: '16px',
                        left: notifications.projectUpdates ? '28px' : '4px',
                        bottom: '4px',
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '0.5rem'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                      평가 리마인더
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      미완료 평가에 대한 리마인더
                    </div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                    <input
                      type="checkbox"
                      checked={notifications.evaluationReminders}
                      onChange={(e) => setNotifications({...notifications, evaluationReminders: e.target.checked})}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: notifications.evaluationReminders ? '#3b82f6' : '#ccc',
                      transition: '0.4s',
                      borderRadius: '24px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        height: '16px',
                        width: '16px',
                        left: notifications.evaluationReminders ? '28px' : '4px',
                        bottom: '4px',
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>

                <Button variant="primary">
                  설정 저장
                </Button>
              </div>
            </Card>
          )}

          {activeSection === 'subscription' && (
            <Card title="구독 관리" variant="elevated">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: '#dbeafe',
                  borderRadius: '0.5rem',
                  border: '1px solid #3b82f6'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        현재 플랜: 무료 체험
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '1rem' }}>
                        체험 종료일: 2024년 2월 15일 (14일 남음)
                      </p>
                      <ul style={{ fontSize: '0.875rem', color: '#1e40af', paddingLeft: '1.5rem' }}>
                        <li>프로젝트 5개까지</li>
                        <li>평가자 10명까지</li>
                        <li>기본 분석 기능</li>
                      </ul>
                    </div>
                    <Button variant="primary">
                      플랜 업그레이드
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                    사용량
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem' }}>프로젝트</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>3 / 5</span>
                      </div>
                      <div style={{
                        height: '8px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: '60%',
                          height: '100%',
                          backgroundColor: '#3b82f6'
                        }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem' }}>평가자</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>7 / 10</span>
                      </div>
                      <div style={{
                        height: '8px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: '70%',
                          height: '100%',
                          backgroundColor: '#f59e0b'
                        }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem' }}>저장공간</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>2.3GB / 5GB</span>
                      </div>
                      <div style={{
                        height: '8px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: '46%',
                          height: '100%',
                          backgroundColor: '#10b981'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;