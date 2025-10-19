import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

import type { User } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  user?: User | null;
  viewMode?: 'service' | 'evaluator';
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
  onModeSwitch?: (mode: 'service' | 'evaluator') => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  viewMode,
  activeTab, 
  onTabChange, 
  onLogout,
  onModeSwitch 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  console.log('🔥 Layout - user:', user);
  console.log('🔥 Layout - user role:', user?.role);
  console.log('🔥 Layout - user email:', user?.email);

  const handleLogoClick = () => {
    if (user) {
      if (user.role === 'super_admin') {
        onTabChange('super-admin');
      } else if (user.role === 'service_admin' || user.role === 'service_user') {
        onTabChange('personal-service');
      } else if (user.role === 'evaluator') {
        onTabChange('evaluator-dashboard');
      } else {
        onTabChange('landing');
      }
    } else {
      onTabChange('landing');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', fontFamily: 'Pretendard, Inter, system-ui, sans-serif' }}>
      <Header 
        user={user} 
        onLogout={onLogout} 
        onLogoClick={handleLogoClick}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      
      <div className="flex">
        {user ? (
          <>
            <Sidebar
              isCollapsed={sidebarCollapsed}
              userRole={user.role}
              viewMode={viewMode}
              activeTab={activeTab}
              onTabChange={onTabChange}
              canSwitchModes={user.role === 'service_admin' || user.role === 'service_user'}
              onModeSwitch={onModeSwitch}
            />
            
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="fixed z-10 p-3 rounded-lg transition-luxury focus-luxury hover:scale-105"
              style={{
                top: 'calc(var(--header-height) + 1rem)',
                left: sidebarCollapsed ? '5rem' : 'calc(var(--sidebar-width) + 1rem)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-md)',
                borderRadius: 'var(--radius-md)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--gold-primary)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'var(--gold-primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <span className="text-base font-medium">
                {sidebarCollapsed ? '→' : '←'}
              </span>
            </button>
          </>
        ) : (
          <div style={{
            width: 'var(--sidebar-width)',
            backgroundColor: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-light)',
            padding: '20px'
          }}>
            <h3>로그인이 필요합니다</h3>
            <p>user: {JSON.stringify(user)}</p>
          </div>
        )}
        
        <main className="flex-1 transition-luxury" 
              style={{
                marginLeft: user ? (sidebarCollapsed ? '4rem' : 'var(--sidebar-width)') : '0',
                minHeight: 'calc(100vh - var(--header-height))',
                backgroundColor: 'var(--bg-primary)',
                transition: 'margin-left 0.3s ease, background-color 0.3s var(--transition-luxury)'
              }}>
          <div className="container-adaptive section-padding">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;