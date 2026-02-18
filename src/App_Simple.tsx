import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import PersonalServiceDashboard from './components/admin/PersonalServiceDashboard';
import { DEMO_USER, DEMO_PROJECTS } from './data/demoData';

function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('personal-service');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [projects, setProjects] = useState<any[]>(DEMO_PROJECTS);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(DEMO_PROJECTS[0].id);
  const [isInitializing, setIsInitializing] = useState(true);

  // 간단한 초기화
  useEffect(() => {
    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    const projectFromUrl = urlParams.get('project');
    
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
    
    if (projectFromUrl && DEMO_PROJECTS.find(p => p.id === projectFromUrl)) {
      setSelectedProjectId(projectFromUrl);
    }
    
    // 초기화 완료
    setTimeout(() => {
      setIsInitializing(false);
    }, 100);
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