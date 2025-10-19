import React, { useState, useEffect } from 'react';
import { Survey, SurveyResponse, SurveyAnalytics, CreateSurveyRequest } from '../../types/survey';
import SurveyFormBuilder from './SurveyFormBuilder';
import Button from '../common/Button';
import Card from '../common/Card';

interface SurveyManagementSystemProps {
  projectId: string;
  onBack?: () => void;
}

const SurveyManagementSystem: React.FC<SurveyManagementSystemProps> = ({ 
  projectId, 
  onBack 
}) => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'responses' | 'analytics'>('list');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 설문조사 목록 조회
  const fetchSurveys = async () => {
    setIsLoading(true);
    try {
      // TODO: API 호출로 교체
      const mockSurveys: Survey[] = [
        {
          id: 'survey-001',
          title: 'AHP 모델 평가를 위한 인구통계학적 설문조사',
          description: '본 연구의 AHP 모델 평가에 참여해주신 평가자분들의 배경 정보를 수집하기 위한 설문조사입니다.',
          questions: [],
          createdBy: 'researcher-001',
          projectId: projectId,
          createdAt: new Date('2025-08-28'),
          updatedAt: new Date('2025-08-28'),
          status: 'active',
          evaluatorLink: `${window.location.origin}/survey/eval/survey-001-token-abc123`,
          totalResponses: 45,
          completedResponses: 42,
          averageCompletionTime: 8.5
        }
      ];
      setSurveys(mockSurveys);
    } catch (error) {
      console.error('설문조사 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [projectId]);

  // 새 설문조사 생성
  const handleCreateSurvey = async (surveyData: CreateSurveyRequest) => {
    setIsLoading(true);
    try {
      // TODO: API 호출로 교체
      const newSurvey: Survey = {
        id: `survey-${Date.now()}`,
        title: surveyData.title,
        description: surveyData.description,
        questions: surveyData.questions.map((q, index) => ({ ...q, id: `q-${index + 1}`, order: index + 1 })),
        createdBy: 'current-user-id',
        projectId: surveyData.projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft',
        evaluatorLink: `${window.location.origin}/survey/eval/${`survey-${Date.now()}`}-token-${Math.random().toString(36).substr(2, 9)}`,
        totalResponses: 0,
        completedResponses: 0
      };

      setSurveys(prev => [newSurvey, ...prev]);
      setCurrentView('list');
      
      // 성공 알림
      alert(`설문조사가 생성되었습니다!\n평가자 링크: ${newSurvey.evaluatorLink}`);
    } catch (error) {
      console.error('설문조사 생성 실패:', error);
      alert('설문조사 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 설문조사 활성화/비활성화
  const toggleSurveyStatus = async (surveyId: string, newStatus: Survey['status']) => {
    try {
      setSurveys(prev => 
        prev.map(survey => 
          survey.id === surveyId 
            ? { ...survey, status: newStatus, updatedAt: new Date() }
            : survey
        )
      );
    } catch (error) {
      console.error('설문조사 상태 변경 실패:', error);
    }
  };

  // 평가자 링크 복사
  const copyEvaluatorLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('평가자 링크가 클립보드에 복사되었습니다!');
  };

  // QR 코드 생성
  const generateQRCode = (surveyId: string) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (survey) {
      // TODO: QR 코드 생성 라이브러리 사용
      alert(`QR 코드 생성 기능은 준비 중입니다.\n링크: ${survey.evaluatorLink}`);
    }
  };

  const renderSurveyList = () => (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
            <span className="text-3xl mr-3">📊</span>
            설문조사 관리
          </h2>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            평가자를 위한 인구통계학적 설문조사를 생성하고 관리합니다
          </p>
        </div>
        <div className="flex space-x-3">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              ← 뒤로가기
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={() => setCurrentView('create')}
          >
            📝 새 설문 만들기
          </Button>
        </div>
      </div>

      {/* 설문조사 목록 */}
      <div className="grid gap-4">
        {surveys.length === 0 ? (
          <Card variant="outlined" className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              아직 설문조사가 없습니다
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              첫 번째 설문조사를 만들어 평가자들의 정보를 수집해보세요
            </p>
            <Button variant="primary" onClick={() => setCurrentView('create')}>
              첫 설문조사 만들기
            </Button>
          </Card>
        ) : (
          surveys.map(survey => (
            <Card key={survey.id} variant="default" className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold mr-3" style={{ color: 'var(--text-primary)' }}>
                      {survey.title}
                    </h3>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        survey.status === 'active' ? 'bg-green-100 text-green-800' :
                        survey.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        survey.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {survey.status === 'active' ? '활성' :
                       survey.status === 'draft' ? '초안' :
                       survey.status === 'completed' ? '완료' : '보관'}
                    </span>
                  </div>
                  <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {survey.description}
                  </p>
                  
                  {/* 통계 정보 */}
                  <div className="flex items-center space-x-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center">
                      <span className="mr-1">📝</span>
                      질문 {survey.questions.length}개
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">👥</span>
                      응답 {survey.completedResponses}/{survey.totalResponses}
                    </div>
                    {survey.averageCompletionTime && (
                      <div className="flex items-center">
                        <span className="mr-1">⏱️</span>
                        평균 {survey.averageCompletionTime}분
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="mr-1">📅</span>
                      {new Date(survey.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* 액션 버튼들 */}
                <div className="flex items-center space-x-2 ml-4">
                  {survey.status === 'draft' && (
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => toggleSurveyStatus(survey.id, 'active')}
                    >
                      활성화
                    </Button>
                  )}
                  
                  {survey.status === 'active' && (
                    <Button 
                      variant="warning" 
                      size="sm"
                      onClick={() => toggleSurveyStatus(survey.id, 'completed')}
                    >
                      완료
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyEvaluatorLink(survey.evaluatorLink)}
                    title="평가자 링크 복사"
                  >
                    🔗
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateQRCode(survey.id)}
                    title="QR 코드 생성"
                  >
                    📱
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedSurvey(survey);
                      setCurrentView('responses');
                    }}
                  >
                    📊 응답보기
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedSurvey(survey);
                      setCurrentView('edit');
                    }}
                  >
                    ✏️ 편집
                  </Button>
                </div>
              </div>
              
              {/* 평가자 링크 섹션 */}
              {survey.status === 'active' && (
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        평가자 링크
                      </p>
                      <code className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {survey.evaluatorLink}
                      </code>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyEvaluatorLink(survey.evaluatorLink)}
                      >
                        복사
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(survey.evaluatorLink, '_blank')}
                      >
                        미리보기
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderCreateSurvey = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
          <span className="text-3xl mr-3">📝</span>
          새 설문조사 만들기
        </h2>
        <Button variant="outline" onClick={() => setCurrentView('list')}>
          ← 목록으로
        </Button>
      </div>
      
      <SurveyFormBuilder 
        onSave={(questions) => {
          const surveyData: CreateSurveyRequest = {
            title: '인구통계학적 설문조사', // 기본값
            description: '연구 참여자들의 배경 정보를 수집하기 위한 설문조사입니다.',
            questions: questions.map(({ id, ...q }, index) => ({ ...q, order: index + 1 })),
            projectId: projectId
          };
          handleCreateSurvey(surveyData);
        }}
        onCancel={() => setCurrentView('list')}
      />
    </div>
  );

  const renderResponses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
          <span className="text-3xl mr-3">📊</span>
          설문조사 응답 분석
        </h2>
        <Button variant="outline" onClick={() => setCurrentView('list')}>
          ← 목록으로
        </Button>
      </div>
      
      {selectedSurvey && (
        <Card variant="default" className="p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {selectedSurvey.title}
          </h3>
          
          {/* 응답 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                {selectedSurvey.totalResponses}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                총 응답 수
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--status-success-text)' }}>
                {selectedSurvey.completedResponses}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                완료된 응답
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                {selectedSurvey.totalResponses > 0 
                  ? Math.round((selectedSurvey.completedResponses / selectedSurvey.totalResponses) * 100)
                  : 0}%
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                완료율
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                {selectedSurvey.averageCompletionTime || 0}분
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                평균 소요시간
              </div>
            </div>
          </div>
          
          {/* 응답 데이터 테이블 placeholder */}
          <div className="text-center py-8">
            <p style={{ color: 'var(--text-secondary)' }}>
              응답 데이터 상세 분석 기능은 준비 중입니다.
            </p>
            <Button variant="primary" className="mt-4" onClick={() => {
              // TODO: CSV 내보내기 기능
              alert('CSV 내보내기 기능은 준비 중입니다.');
            }}>
              📊 CSV 내보내기
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  // 메인 렌더링
  switch (currentView) {
    case 'create':
      return renderCreateSurvey();
    case 'responses':
      return renderResponses();
    default:
      return renderSurveyList();
  }
};

export default SurveyManagementSystem;