import React, { useState, useEffect } from 'react';
import UnifiedButton from '../common/UnifiedButton';
import LayerPopup from '../common/LayerPopup';
import ColorThemeSelector from '../common/ColorThemeSelector';
import sessionService from '../../services/sessionService';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  user?: {
    first_name: string;
    last_name: string;
    role: 'super_admin' | 'admin' | 'service_tester' | 'evaluator';
    admin_type?: 'super' | 'personal';
  } | null;
  onLogout?: () => void;
  onLogoClick?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

interface FavoriteMenuItem {
  id: string;
  label: string;
  tab: string;
  icon: string;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onLogoClick, activeTab, onTabChange }) => {
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteMenuItem[]>([]);
  
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const updateSessionStatus = async () => {
      if (user) {
        setIsLoggedIn(true);
        
        const loginTime = localStorage.getItem('login_time');
        if (loginTime) {
          const elapsed = Math.floor((Date.now() - parseInt(loginTime)) / 60000);
          const remaining = Math.max(0, 30 - elapsed);
          setRemainingTime(remaining);
        } else {
          localStorage.setItem('login_time', Date.now().toString());
          setRemainingTime(30);
          // 첫 로그인 시 세션 타이머 시작
          sessionService.startSession();
        }
        
        localStorage.setItem('last_activity', Date.now().toString());
      } else {
        setIsLoggedIn(false);
        setRemainingTime(0);
      }
    };

    if (user) {
      updateSessionStatus();
      const interval = setInterval(updateSessionStatus, 60000);
      return () => clearInterval(interval);
    } else {
      setIsLoggedIn(false);
      setRemainingTime(0);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const savedFavorites = localStorage.getItem(`favorites_${user.first_name}_${user.last_name}`);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    }
  }, [user]);

  const saveFavorites = (newFavorites: FavoriteMenuItem[]) => {
    if (user) {
      localStorage.setItem(`favorites_${user.first_name}_${user.last_name}`, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    }
  };

  const addToFavorites = (item: Omit<FavoriteMenuItem, 'id'>) => {
    const newFavorite: FavoriteMenuItem = {
      ...item,
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const newFavorites = [...favorites, newFavorite];
    saveFavorites(newFavorites);
  };

  const removeFromFavorites = (id: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== id);
    saveFavorites(newFavorites);
  };

  const isCurrentTabFavorite = () => {
    return favorites.some(fav => fav.tab === activeTab);
  };

  const getTimeColor = () => {
    if (remainingTime > 10) return 'session-good';
    if (remainingTime > 5) return 'session-warning';
    return 'session-danger';
  };

  const getTimeIcon = () => {
    if (remainingTime > 10) return '🟢';
    if (remainingTime > 5) return '🟡';
    return '🔴';
  };

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else if (user) {
      if (onTabChange) {
        if (user.role === 'super_admin' && user.admin_type === 'super') {
          onTabChange('super-admin');
        } else if (user.admin_type === 'personal') {
          onTabChange('personal-service');
        } else {
          onTabChange('welcome');
        }
      }
    } else {
      window.location.href = '/';
    }
  };

  const getQuickNavItems = () => {
    const items = [];
    
    items.push(
      { label: '사용자 가이드', tab: 'user-guide', icon: '📚' },
      { label: '평가자 체험', tab: 'evaluator-mode', icon: '👨‍💼' }
    );
    
    if (!user) return items;
    
    if (user.role === 'super_admin' && user.admin_type === 'super') {
      items.push(
        { label: '관리 대시보드', tab: 'super-admin', icon: '📊' },
        { label: '사용자 관리', tab: 'users', icon: '👥' },
        { label: '시스템 모니터링', tab: 'monitoring', icon: '📈' }
      );
    } else if (user.admin_type === 'personal') {
      items.push(
        { label: '연구 대시보드', tab: 'personal-service', icon: '🏗️' },
        { label: '내 프로젝트', tab: 'my-projects', icon: '📋' },
        { label: '프로젝트 생성', tab: 'project-creation', icon: '➕' },
        { label: '결과 분석', tab: 'results-analysis', icon: '📊' }
      );
    } else if (user.role === 'evaluator') {
      items.push(
        { label: '평가 대시보드', tab: 'evaluator-mode', icon: '⚖️' },
        { label: '내 평가 현황', tab: 'evaluator-status', icon: '📝' }
      );
    }
    
    return items;
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'system': return '💻';
      default: return '💻';
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return '라이트 모드';
      case 'dark': return '다크 모드';  
      case 'system': return '시스템 설정';
      default: return '시스템 설정';
    }
  };

  return (
    <header className="sticky top-0 z-50 transition-luxury backdrop-blur-sm" 
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-md)',
              height: 'var(--header-height)',
              fontFamily: 'Inter, Pretendard, system-ui, sans-serif'
            }}>
      <div className="container-luxury w-full max-w-none">
        <div className="flex items-center justify-between h-full" style={{ height: 'var(--header-height)' }}>
          {/* 왼쪽 로고 영역 */}
          <div className="flex-shrink-0">
            <button
              onClick={handleLogoClick}
              className="flex items-center hover:opacity-90 transition-luxury focus-luxury rounded-lg p-3 group"
              style={{ marginLeft: '20px', marginTop: '5px' }}
            >
              <div className="flex flex-col items-start">
                <h1 className="text-2xl font-black leading-tight"
                    style={{ 
                      background: `linear-gradient(135deg, var(--accent-gold), var(--accent-gold-2))`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                  AHP for Paper
                </h1>
                <p className="text-sm font-medium leading-tight theme-text-muted">
                  연구 논문을 위한 AHP 분석
                </p>
              </div>
            </button>
          </div>

          {/* 좌측 핵심 기능 그룹 */}
          {user && (
            <div className="flex-1 flex items-center space-x-4 ml-8">
              <UnifiedButton
                variant={activeTab === 'personal-service' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onTabChange && onTabChange('personal-service')}
                icon="🏠"
                className="font-medium"
              >
                대시보드
              </UnifiedButton>
              
              <UnifiedButton
                variant={activeTab === 'my-projects' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onTabChange && onTabChange('my-projects')}
                icon="📂"
                className="font-medium"
              >
                내 프로젝트
              </UnifiedButton>
              
              <UnifiedButton
                variant={activeTab === 'project-creation' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onTabChange && onTabChange('project-creation')}
                icon="➕"
                className="font-medium"
              >
                새 프로젝트
              </UnifiedButton>
              
              <UnifiedButton
                variant={activeTab === 'model-builder' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onTabChange && onTabChange('model-builder')}
                icon="🏗️"
                className="font-medium"
              >
                모델 구축
              </UnifiedButton>

              {/* 즐겨찾기 메뉴 (축소형) */}
              <LayerPopup
                trigger={
                  <UnifiedButton
                    variant="secondary"
                    size="sm"
                    icon="⭐"
                    className="relative"
                  >
                    즐겨찾기
                    {favorites.length > 0 && (
                      <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                            style={{ background: 'var(--status-danger-bg)' }}>
                        {favorites.length}
                      </span>
                    )}
                  </UnifiedButton>
                }
                title="⭐ 내 즐겨찾기 메뉴"
                content={
                  <div className="space-y-4 w-80">
                    {favorites.length === 0 ? (
                      <div className="text-center py-8 rounded-xl border-2 border-dashed"
                           style={{
                             background: 'linear-gradient(135deg, var(--favorite-bg), transparent)',
                             borderColor: 'var(--favorite-border)'
                           }}>
                        <div className="text-4xl mb-3">⭐</div>
                        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>즐겨찾기가 비어있습니다</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>자주 사용하는 메뉴를 추가해보세요</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {favorites.map((fav) => (
                          <div key={fav.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                            <button
                              onClick={() => onTabChange && onTabChange(fav.tab)}
                              className="flex items-center space-x-2 flex-1 text-left"
                            >
                              <span className="text-lg">{fav.icon}</span>
                              <span className="font-medium">{fav.label}</span>
                            </button>
                            <UnifiedButton
                              variant="danger"
                              size="sm"
                              onClick={() => removeFromFavorites(fav.id)}
                              icon="🗑️"
                            >
                              삭제
                            </UnifiedButton>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {activeTab && (
                      <div className="pt-3 border-t border-gray-200">
                        <UnifiedButton
                          variant={isCurrentTabFavorite() ? "danger" : "success"}
                          size="sm"
                          onClick={() => {
                            if (isCurrentTabFavorite()) {
                              const currentFav = favorites.find(fav => fav.tab === activeTab);
                              if (currentFav) removeFromFavorites(currentFav.id);
                            } else {
                              const quickNav = getQuickNavItems().find(item => item.tab === activeTab);
                              if (quickNav) {
                                addToFavorites({
                                  label: quickNav.label,
                                  tab: quickNav.tab,
                                  icon: quickNav.icon
                                });
                              }
                            }
                          }}
                          icon={isCurrentTabFavorite() ? "🗑️" : "⭐"}
                          className="w-full"
                        >
                          {isCurrentTabFavorite() ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}
                        </UnifiedButton>
                      </div>
                    )}
                  </div>
                }
                width="lg"
              />
            </div>
          )}

          {/* 오른쪽 부가 기능 및 사용자 정보 영역 */}
          <div className="flex items-center space-x-4" style={{ marginRight: '20px' }}>
            {/* 부가 기능 메뉴 */}
            {user && (
              <div className="flex items-center space-x-3">
                <UnifiedButton
                  variant={activeTab === 'user-guide' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onTabChange && onTabChange('user-guide')}
                  icon="📚"
                  className="font-medium"
                >
                  가이드
                </UnifiedButton>
                
                <UnifiedButton
                  variant={activeTab === 'results-analysis' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onTabChange && onTabChange('results-analysis')}
                  icon="📊"
                  className="font-medium"
                >
                  결과 분석
                </UnifiedButton>
                
                <UnifiedButton
                  variant={activeTab === 'personal-settings' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onTabChange && onTabChange('personal-settings')}
                  icon="⚙️"
                  className="font-medium"
                >
                  설정
                </UnifiedButton>
              </div>
            )}

            {/* 컬러 테마 선택기 */}
            {user && (
              <div className="flex items-center">
                <ColorThemeSelector />
              </div>
            )}

            {/* 테마 토글 버튼 */}
            {user && (
              <div className="flex items-center">
                <UnifiedButton
                  variant="secondary"
                  size="sm"
                  onClick={toggleTheme}
                  icon={getThemeIcon()}
                  className="transition-all duration-300"
                  title={getThemeLabel()}
                >
                  <span className="hidden sm:inline">{getThemeLabel()}</span>
                </UnifiedButton>
              </div>
            )}
            
            {/* 세션 상태 */}
            {user && isLoggedIn && (
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-xl text-sm font-medium border flex items-center space-x-1 ${getTimeColor()}`}>
                  <span className="text-base">{getTimeIcon()}</span>
                  <span className="font-bold">{remainingTime}분</span>
                </div>
                
                <UnifiedButton
                  variant="info"
                  size="sm"
                  onClick={() => {
                    sessionService.extendSession();
                    setRemainingTime(30);
                  }}
                  icon="⏰"
                  title="세션 30분 연장"
                >
                  연장
                </UnifiedButton>
              </div>
            )}
            
            {/* 사용자 정보 */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </span>
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-base font-bold"
                        style={{ 
                          fontFamily: 'Inter, system-ui, sans-serif',
                          color: 'var(--text-primary)',
                          fontSize: 'var(--font-size-base)',
                          fontWeight: 'var(--font-weight-bold)'
                        }}>
                    {user.first_name} {user.last_name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium"
                          style={{ color: 'var(--text-secondary)' }}>
                      {user.role === 'super_admin' ? '시스템 관리자' : 
                       user.role === 'admin' ? '관리자' : '평가자'}
                    </span>
                    {user.admin_type && (
                      <span className="text-xs px-3 py-1 rounded-full font-semibold transition-luxury"
                            style={{
                              backgroundColor: 'var(--accent-light)',
                              color: 'var(--accent-secondary)',
                              border: '1px solid var(--accent-primary)',
                              borderRadius: 'var(--radius-md)'
                            }}>
                        {user.admin_type === 'super' ? '시스템' : '개인서비스'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
              
            {/* 로그아웃 버튼 */}
            {user && onLogout && (
              <UnifiedButton
                variant="danger"
                size="md"
                onClick={() => {
                  if (window.confirm('로그아웃 하시겠습니까?')) {
                    sessionService.logout();
                    onLogout();
                  }
                }}
                icon="🚪"
              >
                <span className="hidden sm:inline font-medium">로그아웃</span>
              </UnifiedButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;