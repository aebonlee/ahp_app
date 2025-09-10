import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { UserType } from '../../types/userTypes';

interface UserTypeSelectorProps {
  onUserTypeSelect: (userType: UserType) => void;
  selectedType?: UserType;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  onUserTypeSelect,
  selectedType
}) => {
  const [hoveredType, setHoveredType] = useState<UserType | null>(null);

  const userTypes = [
    {
      type: 'admin' as UserType,
      title: '관리자',
      subtitle: 'System Administrator',
      description: 'AHP 시스템 전반의 운영 및 관리를 담당합니다.',
      features: [
        '시스템 설정 및 구성 관리',
        '사용자 계정 및 권한 관리', 
        '프로젝트 감독 및 지원',
        '시스템 분석 및 리포트',
        '데이터 백업 및 보안 관리'
      ],
      icon: '🛡️',
      color: '#dc2626',
      bgColor: '#fef2f2',
      access: '시스템 전체 접근 권한',
      responsibility: '시스템 운영 및 사용자 지원'
    },
    {
      type: 'personal_service_user' as UserType,
      title: '개인서비스 이용자',
      subtitle: 'Personal Service User',
      description: '유료 구독을 통해 AHP 분석 서비스를 이용하는 고객입니다.',
      features: [
        'AHP 프로젝트 생성 및 관리',
        '평가자 초대 및 설문 운영',
        '분석 결과 및 리포트 생성',
        '데이터 내보내기 및 공유',
        '프리미엄 기능 이용 가능'
      ],
      icon: '💼',
      color: '#2563eb',
      bgColor: '#eff6ff',
      access: '개인 프로젝트 및 데이터',
      responsibility: 'AHP 의사결정 프로젝트 운영'
    },
    {
      type: 'evaluator' as UserType,
      title: '평가자',
      subtitle: 'Survey Evaluator',
      description: '초대받은 AHP 프로젝트에 참여하여 평가를 수행합니다.',
      features: [
        '쌍대비교 평가 참여',
        '의사결정 설문 응답',
        '평가 결과 확인',
        '개인 평가 이력 관리',
        '모바일 친화적 평가 환경'
      ],
      icon: '📝',
      color: '#059669',
      bgColor: '#ecfdf5',
      access: '할당된 평가 프로젝트만',
      responsibility: '정확하고 일관된 평가 수행'
    }
  ];

  const handleTypeSelect = (type: UserType) => {
    onUserTypeSelect(type);
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem' 
    }}>
      {/* 헤더 */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '3rem' 
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: 'var(--text-primary)',
          marginBottom: '1rem'
        }}>
          회원 유형 선택
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          AHP 시스템에서 제공하는 3가지 회원 유형 중 귀하에게 적합한 유형을 선택해 주세요.
        </p>
      </div>

      {/* 회원 유형 카드들 */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {userTypes.map((userType) => (
          <Card
            key={userType.type}
            variant={selectedType === userType.type ? 'bordered' : 'elevated'}
            hoverable={true}
            style={{
              border: selectedType === userType.type 
                ? `2px solid ${userType.color}` 
                : hoveredType === userType.type 
                ? `2px solid ${userType.color}40` 
                : '1px solid var(--border-subtle)',
              backgroundColor: selectedType === userType.type 
                ? userType.bgColor 
                : 'var(--card-bg)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              transform: hoveredType === userType.type ? 'translateY(-4px)' : 'translateY(0)',
              minHeight: '500px'
            }}
            onMouseEnter={() => setHoveredType(userType.type)}
            onMouseLeave={() => setHoveredType(null)}
            onClick={() => handleTypeSelect(userType.type)}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              padding: '0.5rem 0'
            }}>
              {/* 아이콘 및 제목 */}
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '1.5rem' 
              }}>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem' 
                }}>
                  {userType.icon}
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  color: userType.color,
                  marginBottom: '0.5rem'
                }}>
                  {userType.title}
                </h3>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-muted)',
                  fontStyle: 'italic'
                }}>
                  {userType.subtitle}
                </p>
              </div>

              {/* 설명 */}
              <p style={{ 
                fontSize: '0.95rem', 
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                {userType.description}
              </p>

              {/* 주요 기능 */}
              <div style={{ 
                flex: 1,
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.75rem'
                }}>
                  주요 기능:
                </h4>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0 
                }}>
                  {userType.features.map((feature, index) => (
                    <li key={index} style={{ 
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.5rem',
                      paddingLeft: '1rem',
                      position: 'relative'
                    }}>
                      <span style={{ 
                        position: 'absolute', 
                        left: '0', 
                        color: userType.color 
                      }}>
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 접근 권한 정보 */}
              <div style={{ 
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ 
                  fontSize: '0.875rem', 
                  marginBottom: '0.5rem' 
                }}>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    접근 범위:
                  </strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {userType.access}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    주요 책임:
                  </strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {userType.responsibility}
                  </span>
                </div>
              </div>

              {/* 선택 버튼 */}
              <Button
                variant={selectedType === userType.type ? 'primary' : 'secondary'}
                size="lg"
                style={{ 
                  width: '100%',
                  backgroundColor: selectedType === userType.type 
                    ? userType.color 
                    : 'var(--bg-elevated)',
                  borderColor: userType.color,
                  color: selectedType === userType.type 
                    ? 'white' 
                    : userType.color
                }}
                onClick={() => handleTypeSelect(userType.type)}
              >
                {selectedType === userType.type ? '선택됨 ✓' : '이 유형으로 가입'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* 선택된 유형 정보 */}
      {selectedType && (
        <div style={{ 
          textAlign: 'center',
          marginTop: '2rem'
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: 'var(--accent-light)',
            border: '1px solid var(--accent-primary)',
            borderRadius: '0.5rem',
            padding: '1rem 2rem'
          }}>
            <p style={{ 
              fontSize: '1rem',
              color: 'var(--accent-primary)',
              margin: 0,
              fontWeight: '600'
            }}>
              선택된 회원 유형: <strong>
                {userTypes.find(ut => ut.type === selectedType)?.title}
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* 안내 사항 */}
      <div style={{ 
        marginTop: '3rem',
        padding: '1.5rem',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: '0.5rem',
        border: '1px solid var(--border-subtle)'
      }}>
        <h4 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '1rem'
        }}>
          💡 회원 유형 선택 안내
        </h4>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <p style={{ 
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              margin: 0
            }}>
              <strong>관리자</strong>는 시스템 운영진만 가입 가능하며, 별도의 승인 과정이 필요합니다.
            </p>
          </div>
          <div>
            <p style={{ 
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              margin: 0
            }}>
              <strong>개인서비스 이용자</strong>는 구독 결제 후 즉시 모든 기능을 이용할 수 있습니다.
            </p>
          </div>
          <div>
            <p style={{ 
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
              margin: 0
            }}>
              <strong>평가자</strong>는 초대코드나 링크를 통해 간편하게 가입하여 평가에 참여합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelector;