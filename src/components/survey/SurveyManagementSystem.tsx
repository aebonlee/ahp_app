import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
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
  const [projects, setProjects] = useState<any[]>([]); // 프로젝트 개수 추적용

  // 설문 개수 제한 (프로젝트 개수와 동일)
  const MAX_SURVEYS_PER_PROJECT = 3; // 프로젝트당 최대 3개 설문

  // 설문조사 목록 조회
  const fetchSurveys = async () => {
    setIsLoading(true);
    try {
      const token = authService.getAccessToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/projects/${projectId}/surveys`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch surveys');
      }
      
      const surveysData = await response.json();
      setSurveys(surveysData.map((survey: any) => ({
        id: survey.id,
        title: survey.title,
        description: survey.description,
        questions: survey.questions || [],
        createdBy: survey.created_by,
        projectId: survey.project_id,
        createdAt: new Date(survey.created_at),
        updatedAt: new Date(survey.updated_at),
        status: survey.status,
        evaluatorLink: survey.evaluator_link,
        totalResponses: survey.total_responses || 0,
        completedResponses: survey.completed_responses || 0,
        averageCompletionTime: survey.average_completion_time
      })));
    } catch (error) {
      console.error('설문조사 목록 조회 실패:', error);
      setSurveys([]);
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
      const token = authService.getAccessToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/projects/${projectId}/surveys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(surveyData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create survey');
      }
      
      const newSurvey = await response.json();
      await fetchSurveys(); // 목록 새로고침
      setCurrentView('list');
      
      // 성공 알림
      alert(`설문조사가 생성되었습니다!\n평가자 링크: ${newSurvey.evaluator_link}`);
    } catch (error: any) {
      console.error('설문조사 생성 실패:', error);
      alert(error.message || '설문조사 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 설문조사 활성화/비활성화
  const toggleSurveyStatus = async (surveyId: string, newStatus: Survey['status']) => {
    try {
      const token = authService.getAccessToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/surveys/${surveyId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update survey status');
      }
      
      await fetchSurveys(); // 목록 새로고침
    } catch (error) {
      console.error('설문조사 상태 변경 실패:', error);
      alert('설문조사 상태 변경에 실패했습니다.');
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

  // 설문조사 삭제
  const deleteSurvey = async (surveyId: string) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return;

    const confirmDelete = window.confirm(
      `"${survey.title}" 설문조사를 삭제하시겠습니까?\n\n⚠️ 모든 응답 데이터도 함께 삭제되며 복구할 수 없습니다.`
    );
    
    if (!confirmDelete) return;

    try {
      setIsLoading(true);
      const token = authService.getAccessToken();
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/surveys/${surveyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete survey');
      }
      
      await fetchSurveys(); // 목록 새로고침
      alert('설문조사가 삭제되었습니다.');
    } catch (error) {
      console.error('설문조사 삭제 실패:', error);
      alert('설문조사 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
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
          
          {/* 설문 개수 제한 표시 */}
          <div className="mt-3 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                설문조사:
              </span>
              <span className={`text-sm font-bold ${
                surveys.length >= MAX_SURVEYS_PER_PROJECT ? 'text-red-600' : 'text-blue-600'
              }`}>
                {surveys.length}/{MAX_SURVEYS_PER_PROJECT}
              </span>
            </div>
            {surveys.length >= MAX_SURVEYS_PER_PROJECT && (
              <div className="text-xs text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                최대 설문 개수에 도달했습니다
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              ← 뒤로가기
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={() => {
              if (surveys.length >= MAX_SURVEYS_PER_PROJECT) {
                alert(`프로젝트당 최대 ${MAX_SURVEYS_PER_PROJECT}개의 설문조사만 생성할 수 있습니다.\n기존 설문을 삭제한 후 새로 만들어주세요.`);
                return;
              }
              setCurrentView('create');
            }}
            disabled={surveys.length >= MAX_SURVEYS_PER_PROJECT}
          >
            📝 새 설문 만들기
          </Button>
        </div>
      </div>

      {/* 기본 허수 가이드 */}
      <Card variant="outlined" className="p-6 border-blue-200 bg-blue-50">
        <div className="flex items-start space-x-4">
          <div className="text-4xl">📋</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">
              인구통계학적 설문조사 기본 허수 가이드
            </h3>
            <p className="text-blue-700 mb-4">
              연구의 신뢰성을 위해 다음 기본 허수를 참고하여 설문을 구성하시기 바랍니다.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-1">연령대</div>
                <div className="text-xs text-blue-600">
                  • 20-29세: 25%<br/>
                  • 30-39세: 30%<br/>
                  • 40-49세: 25%<br/>
                  • 50세 이상: 20%
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-1">성별</div>
                <div className="text-xs text-blue-600">
                  • 남성: 50%<br/>
                  • 여성: 50%
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-1">학력</div>
                <div className="text-xs text-blue-600">
                  • 고졸: 20%<br/>
                  • 대졸: 50%<br/>
                  • 대학원졸: 30%
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-1">경력</div>
                <div className="text-xs text-blue-600">
                  • 5년 미만: 30%<br/>
                  • 5-10년: 35%<br/>
                  • 10년 이상: 35%
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  if (surveys.length >= MAX_SURVEYS_PER_PROJECT) {
                    alert(`프로젝트당 최대 ${MAX_SURVEYS_PER_PROJECT}개의 설문조사만 생성할 수 있습니다.\n기존 설문을 삭제한 후 새로 만들어주세요.`);
                    return;
                  }
                  setCurrentView('create');
                }}
                disabled={surveys.length >= MAX_SURVEYS_PER_PROJECT}
              >
                🚀 가이드 기반 설문 만들기
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // TODO: 가이드 PDF 다운로드
                  alert('설문조사 가이드 PDF 다운로드 기능은 준비 중입니다.');
                }}
              >
                📄 가이드 다운로드
              </Button>
            </div>
          </div>
        </div>
      </Card>

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
            <Button 
              variant="primary" 
              onClick={() => {
                if (surveys.length >= MAX_SURVEYS_PER_PROJECT) {
                  alert(`프로젝트당 최대 ${MAX_SURVEYS_PER_PROJECT}개의 설문조사만 생성할 수 있습니다.`);
                  return;
                }
                setCurrentView('create');
              }}
              disabled={surveys.length >= MAX_SURVEYS_PER_PROJECT}
            >
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
                  
                  <Button 
                    variant="error" 
                    size="sm"
                    onClick={() => deleteSurvey(survey.id)}
                    title="설문조사 삭제"
                  >
                    🗑️
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
        onSave={(questions, metadata) => {
          const surveyData: CreateSurveyRequest = {
            title: metadata?.title || '인구통계학적 설문조사',
            description: metadata?.description || '연구 참여자들의 배경 정보를 수집하기 위한 설문조사입니다.',
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

  const renderEditSurvey = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
          <span className="text-3xl mr-3">✏️</span>
          설문조사 편집: {selectedSurvey?.title}
        </h2>
        <Button variant="outline" onClick={() => setCurrentView('list')}>
          ← 목록으로
        </Button>
      </div>
      
      {selectedSurvey && (
        <SurveyFormBuilder 
          initialSurvey={selectedSurvey}
          onSave={async (questions, metadata) => {
            try {
              setIsLoading(true);
              const token = authService.getAccessToken();
              const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/surveys/${selectedSurvey.id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  title: metadata?.title || selectedSurvey.title,
                  description: metadata?.description || selectedSurvey.description,
                  questions: questions
                })
              });
              
              if (!response.ok) {
                throw new Error('Failed to update survey');
              }
              
              await fetchSurveys(); // 목록 새로고침
              setCurrentView('list');
              alert('설문조사가 수정되었습니다!');
            } catch (error) {
              console.error('설문조사 수정 실패:', error);
              alert('설문조사 수정에 실패했습니다.');
            } finally {
              setIsLoading(false);
            }
          }}
          onCancel={() => setCurrentView('list')}
        />
      )}
    </div>
  );

  // 메인 렌더링
  switch (currentView) {
    case 'create':
      return renderCreateSurvey();
    case 'edit':
      return renderEditSurvey();
    case 'responses':
      return renderResponses();
    default:
      return renderSurveyList();
  }
};

export default SurveyManagementSystem;