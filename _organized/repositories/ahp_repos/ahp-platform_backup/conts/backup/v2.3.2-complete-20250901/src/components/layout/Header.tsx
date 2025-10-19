import React, { useState, useEffect } from 'react';
import UnifiedButton from '../common/UnifiedButton';
import LayerPopup from '../common/LayerPopup';
import ColorThemeSelector from '../common/ColorThemeSelector';
import sessionService from '../../services/sessionService';
import { useTheme } from '../../hooks/useTheme';
// import { useColorTheme } from '../../hooks/useColorTheme';

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
  // const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  // const { currentTheme } = useColorTheme();

  useEffect(() => {
    // 세션 상태 확인 및 시간 업데이트
    const updateSessionStatus = async () => {
      const sessionValid = await sessionService.isSessionValid();
      setIsLoggedIn(sessionValid);
      
      if (sessionValid) {
        const remaining = await sessionService.getRemainingTime();
        setRemainingTime(remaining);
      }
    };

    if (user) {
      updateSessionStatus();
      const interval = setInterval(updateSessionStatus, 60000); // 1분마다 업데이트
      return () => clearInterval(interval);
    }
  }, [user]);

  // 즐겨찾기 로드
  useEffect(() => {
    if (user) {
      const savedFavorites = localStorage.getItem(`favorites_${user.first_name}_${user.last_name}`);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    }
  }, [user]);

  // 즐겨찾기 저장
  const saveFavorites = (newFavorites: FavoriteMenuItem[]) => {
    if (user) {
      localStorage.setItem(`favorites_${user.first_name}_${user.last_name}`, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    }
  };

  // 즐겨찾기 추가
  const addToFavorites = (item: Omit<FavoriteMenuItem, 'id'>) => {
    const newFavorite: FavoriteMenuItem = {
      ...item,
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const newFavorites = [...favorites, newFavorite];
    saveFavorites(newFavorites);
  };

  // 즐겨찾기 제거
  const removeFromFavorites = (id: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== id);
    saveFavorites(newFavorites);
  };

  // 현재 탭이 즐겨찾기에 있는지 확인
  const isCurrentTabFavorite = () => {
    return favorites.some(fav => fav.tab === activeTab);
  };

  const getTimeColor = () => {
    if (remainingTime > 10) return 'session-good';
    if (remainingTime > 5) return 'session-warning';
    return 'session-danger';
  };

  /*
  const getTimeStyle = () => {
    if (remainingTime > 10) {
      return {
        backgroundColor: 'var(--session-good-bg)',
        color: 'var(--session-good-text)',
        borderColor: 'var(--session-good-border)'
      };
    }
    if (remainingTime > 5) {
      return {
        backgroundColor: 'var(--session-warning-bg)',
        color: 'var(--session-warning-text)',
        borderColor: 'var(--session-warning-border)'
      };
    }
    return {
      backgroundColor: 'var(--session-danger-bg)',
      color: 'var(--session-danger-text)',
      borderColor: 'var(--session-danger-border)'
    };
  };
  */

  const getTimeIcon = () => {
    if (remainingTime > 10) return '🟢';
    if (remainingTime > 5) return '🟡';
    return '🔴';
  };
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else if (user) {
      // 로그인 상태에서는 적절한 대시보드로 이동
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
      // 비로그인 상태에서는 홈페이지로
      window.location.href = '/';
    }
  };
  
  const handleQuickNavigation = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  
  const getQuickNavItems = () => {
    const items = [];
    
    // 모든 사용자(비로그인 포함)에게 공통 메뉴
    items.push(
      { label: '사용자 가이드', tab: 'user-guide', icon: '📚' },
      { label: '평가자 체험', tab: 'evaluator-mode', icon: '👨‍💼' }
    );
    
    if (!user) return items;
    
    // 로그인된 사용자 전용 메뉴
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
              className="flex items-center space-x-4 hover:opacity-90 transition-luxury focus-luxury rounded-lg p-3 group"
              style={{ marginLeft: '50px', marginTop: '5px' }}
            >
              {/* AHP 로고 아이콘 */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                   style={{ 
                     background: `linear-gradient(135deg, var(--accent-gold), var(--accent-gold-2))`,
                     borderRadius: 'var(--radius-md)',
                     boxShadow: 'var(--shadow-md)'
                   }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="2" fill="white"/>
                  <circle cx="8" cy="14" r="1.5" fill="white"/>
                  <circle cx="16" cy="14" r="1.5" fill="white"/>
                  <circle cx="6" cy="18" r="1" fill="white"/>
                  <circle cx="10" cy="18" r="1" fill="white"/>
                  <circle cx="14" cy="18" r="1" fill="white"/>
                  <circle cx="18" cy="18" r="1" fill="white"/>
                  <line x1="12" y1="10" x2="8" y2="12.5" stroke="white" strokeWidth="1" opacity="0.8"/>
                  <line x1="12" y1="10" x2="16" y2="12.5" stroke="white" strokeWidth="1" opacity="0.8"/>
                  <line x1="8" y1="15.5" x2="6" y2="17" stroke="white" strokeWidth="0.8" opacity="0.8"/>
                  <line x1="8" y1="15.5" x2="10" y2="17" stroke="white" strokeWidth="0.8" opacity="0.8"/>
                  <line x1="16" y1="15.5" x2="14" y2="17" stroke="white" strokeWidth="0.8" opacity="0.8"/>
                  <line x1="16" y1="15.5" x2="18" y2="17" stroke="white" strokeWidth="0.8" opacity="0.8"/>
                </svg>
              </div>
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

          {/* 중앙 메뉴 영역 */}
          {user && (
            <div className="flex-1 flex items-center justify-center space-x-6">
              {/* 즐겨찾기 메뉴 */}
              <div className="flex items-center space-x-4">
                <LayerPopup
                  trigger={
                    <UnifiedButton
                      variant="secondary"
                      size="md"
                      icon="⭐"
                      className="relative shadow-md transition-all duration-300 hover:shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, var(--favorite-bg), var(--accent-light))',
                        borderColor: 'var(--favorite-border)',
                        color: 'var(--favorite-text)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--favorite-hover-bg)';
                        e.currentTarget.style.color = 'var(--favorite-hover-text)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, var(--favorite-bg), var(--accent-light))';
                        e.currentTarget.style.color = 'var(--favorite-text)';
                      }}
                    >
                      <span className="font-semibold">즐겨찾기</span>
                      {favorites.length > 0 && (
                        <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse"
                              style={{ background: 'linear-gradient(135deg, var(--status-danger-bg), var(--accent-secondary))' }}>
                          {favorites.length}
                        </span>
                      )}
                    </UnifiedButton>
                  }
                  title="⭐ 내 즐겨찾기 메뉴"
                  content={
                    <div className="space-y-5 w-96">
                      {favorites.length === 0 ? (
                        <div className="text-center py-12 rounded-xl border-2 border-dashed"
                             style={{
                               background: 'linear-gradient(135deg, var(--favorite-bg), transparent)',
                               borderColor: 'var(--favorite-border)'
                             }}>
                          <div className="text-6xl mb-4 animate-bounce">⭐</div>
                          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>즐겨찾기가 비어있습니다</h3>
                          <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>자주 사용하는 메뉴를 즐겨찾기에 추가하여<br/>빠르게 접근해보세요</p>
                          <div className="p-4 rounded-lg shadow-sm border inline-block"
                               style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--favorite-border)' }}>
                            <p className="text-xs flex items-center gap-2" style={{ color: 'var(--favorite-text)' }}>
                              <span>💡</span>
                              현재 페이지에서 <span className="px-1 rounded" style={{ backgroundColor: 'var(--favorite-bg)' }}>⭐</span> 버튼을 클릭하여 추가
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-4 rounded-xl border shadow-sm"
                               style={{
                                 background: 'linear-gradient(135deg, var(--status-info-light), var(--interactive-primary-light))',
                                 borderColor: 'var(--interactive-primary)'
                               }}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold flex items-center gap-2"
                                  style={{ color: 'var(--interactive-secondary)' }}>
                                <span className="text-xl">⭐</span>
                                내 즐겨찾기
                              </h4>
                              <span className="px-3 py-1 rounded-full text-sm font-bold"
                                    style={{ 
                                      backgroundColor: 'var(--interactive-primary-light)',
                                      color: 'var(--interactive-secondary)'
                                    }}>
                                {favorites.length}개
                              </span>
                            </div>
                            <p className="text-sm font-medium" style={{ color: 'var(--interactive-secondary)' }}>자주 사용하는 메뉴를 빠르게 접근하세요</p>
                          </div>
                          <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                            {favorites.map((fav, index) => (
                              <div 
                                key={fav.id} 
                                className="group flex items-center justify-between p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                                style={{
                                  background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-elevated))',
                                  borderColor: 'var(--border-light)',
                                  border: '1px solid',
                                  animationDelay: `${index * 0.1}s`
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--interactive-primary-light), var(--accent-light))';
                                  e.currentTarget.style.borderColor = 'var(--interactive-primary)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--bg-secondary), var(--bg-elevated))';
                                  e.currentTarget.style.borderColor = 'var(--border-light)';
                                }}
                              >
                                <button
                                  onClick={() => {
                                    if (onTabChange) onTabChange(fav.tab);
                                  }}
                                  className="flex items-center space-x-3 flex-1 text-left"
                                >
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300"
                                       style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                                    <span className="text-lg">{fav.icon}</span>
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-semibold transition-colors duration-300"
                                          style={{ 
                                            color: 'var(--text-primary)'
                                          } as React.CSSProperties}
                                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--interactive-secondary)'}
                                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}>
                                      {fav.label}
                                    </span>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                      즐겨찾기 #{index + 1}
                                    </p>
                                  </div>
                                </button>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <UnifiedButton
                                    variant="danger"
                                    size="sm"
                                    onClick={() => removeFromFavorites(fav.id)}
                                    icon="🗑️"
                                    className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                                  >
                                    
                                  </UnifiedButton>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700 flex items-center gap-2">
                              <span>✨</span>
                              즐겨찾기를 활용하여 업무 효율성을 높여보세요!
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  }
                  width="lg"
                />

                {/* 현재 페이지 즐겨찾기 토글 */}
                {activeTab && getQuickNavItems().some(item => item.tab === activeTab) && (
                  <UnifiedButton
                    variant={isCurrentTabFavorite() ? "warning" : "secondary"}
                    size="sm"
                    onClick={() => {
                      const currentItem = getQuickNavItems().find(item => item.tab === activeTab);
                      if (currentItem) {
                        if (isCurrentTabFavorite()) {
                          const favItem = favorites.find(fav => fav.tab === activeTab);
                          if (favItem) removeFromFavorites(favItem.id);
                        } else {
                          addToFavorites(currentItem);
                        }
                      }
                    }}
                    icon={isCurrentTabFavorite() ? "⭐" : "☆"}
                    className={`transition-all duration-300 transform hover:scale-110 ${
                      isCurrentTabFavorite() 
                        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300 text-yellow-700 shadow-md hover:shadow-lg animate-pulse' 
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-600'
                    }`}
                    title={isCurrentTabFavorite() ? "즐겨찾기에서 제거" : "즐겨찾기에 추가"}
                  >
                    
                  </UnifiedButton>
                )}
              </div>

              {/* 빠른 네비게이션 */}
              <div className="hidden lg:flex items-center space-x-2">
                {getQuickNavItems().slice(0, 4).map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => handleQuickNavigation(item.tab)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      activeTab === item.tab
                        ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                        : item.tab === 'personal-service' 
                          ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 underline hover:no-underline'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title={item.label}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* 컬러 템플릿 선택기 */}
              <div className="flex items-center">
                <ColorThemeSelector />
              </div>

              {/* 테마 토글 버튼 */}
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

              {/* 세션 상태 */}
              {isLoggedIn && (
                <div className="flex items-center space-x-3">
                  <div className={`px-4 py-2 rounded-xl text-sm font-medium border flex items-center space-x-2 ${getTimeColor()}`}>
                    <span className="text-base">{getTimeIcon()}</span>
                    <span className="hidden sm:inline">세션: </span>
                    <span className="font-bold">{remainingTime}분</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <UnifiedButton
                      variant="info"
                      size="sm"
                      onClick={() => {
                        sessionService.extendSession();
                        setRemainingTime(30);
                      }}
                      icon="⏰"
                    >
                      <span className="hidden sm:inline">연장</span>
                    </UnifiedButton>
                    
                    <LayerPopup
                      trigger={
                        <UnifiedButton
                          variant="secondary"
                          size="sm"
                          icon="ℹ️"
                        >
                          <span className="hidden sm:inline">세션확인</span>
                        </UnifiedButton>
                      }
                      title="세션 상세 정보"
                      content={
                        <div className="space-y-6">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-blue-900">현재 세션 상태</h4>
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTimeColor()}`}>
                                {getTimeIcon()} {remainingTime}분 남음
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  remainingTime > 10 ? 'bg-green-500' :
                                  remainingTime > 5 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.max(0, (remainingTime / 30) * 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-blue-700 mt-2">
                              {remainingTime > 10 ? '세션이 안정적으로 유지되고 있습니다.' :
                               remainingTime > 5 ? '세션이 곧 만료됩니다. 연장을 고려하세요.' :
                               '세션이 곧 만료됩니다! 즉시 연장하세요.'}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <div className="text-gray-600 text-sm mb-1">로그인 시간</div>
                              <div className="font-medium text-gray-900">
                                {localStorage.getItem('login_time') ? 
                                  new Date(parseInt(localStorage.getItem('login_time') || '0')).toLocaleString() : 
                                  '정보 없음'
                                }
                              </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                              <div className="text-gray-600 text-sm mb-1">마지막 활동</div>
                              <div className="font-medium text-gray-900">
                                {localStorage.getItem('last_activity') ? 
                                  new Date(parseInt(localStorage.getItem('last_activity') || '0')).toLocaleString() : 
                                  '정보 없음'
                                }
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-center">
                            <UnifiedButton
                              variant="info"
                              size="md"
                              onClick={() => {
                                sessionService.extendSession();
                                setRemainingTime(30);
                              }}
                              icon="⏰"
                            >
                              지금 30분 연장하기
                            </UnifiedButton>
                          </div>
                        </div>
                      }
                      width="lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 오른쪽 사용자 정보 및 로그아웃 영역 */}
          {user && (
            <div className="flex items-center space-x-4" style={{ marginRight: '50px' }}>
              {/* 사용자 정보 */}
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
              
              {/* 로그아웃 버튼 */}
              {onLogout && (
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
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;