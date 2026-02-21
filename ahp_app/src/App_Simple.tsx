import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import PersonalServiceDashboard from './components/admin/PersonalServiceDashboard';
import { DEMO_USER } from './data/demoData';

function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('personal-service');
  const [isInitializing, setIsInitializing] = useState(true);

  // 간단한 초기화
  useEffect(() => {
    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    
    // 데모 사용자 설정
    const demoUser = {
      ...DEMO_USER,
      id: '1',
      email: 'admin@ahp-system.com',
      admin_type: 'personal'
    };
    
    setUser(demoUser);
    
    // URL 파라미터 기반 상태 설정
    if (tabFromUrl && tabFromUrl !== 'welcome') {
      setActiveTab(tabFromUrl);
    }

    setIsInitializing(false);
  }, []);

  // 초기화 로딩 화면
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">AHP for Paper</h2>
          <p className="text-blue-100">연구 논문을 위한 AHP 의사결정 분석 시스템</p>
        </div>
      </div>
    );
  }

  // 메인 렌더링
  return (
    <Layout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      <PersonalServiceDashboard 
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </Layout>
  );
}

export default App;