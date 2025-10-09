import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import cleanDataService from '../../services/dataService_clean';

interface EvaluationSession {
  sessionId: string;
  projectId: string;
  evaluatorName?: string;
  email?: string;
  department?: string;
  startTime: string;
  currentStep: number;
  totalSteps: number;
  progress: number;
}

const AnonymousEvaluator: React.FC = () => {
  const { projectId, sessionId } = useParams<{ projectId: string; sessionId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    department: '',
    isAnonymous: true
  });
  const [project, setProject] = useState<any>(null);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [currentComparison, setCurrentComparison] = useState<any>(null);
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [comparisonIndex, setComparisonIndex] = useState(0);

  // Load project data
  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) return;

      try {
        // Load project details
        const projectData = await cleanDataService.getProject(projectId);
        if (projectData) {
          setProject(projectData);
        }

        // Load criteria
        const criteriaData = await cleanDataService.getCriteria(projectId);
        setCriteria(criteriaData);

        // Load alternatives
        const alternativesData = await cleanDataService.getAlternatives(projectId);
        setAlternatives(alternativesData);

        // Generate pairwise comparisons
        generateComparisons(criteriaData, alternativesData);
      } catch (error) {
        console.error('Failed to load project data:', error);
      }
    };

    loadProjectData();
  }, [projectId]);

  // Generate all pairwise comparisons
  const generateComparisons = (criteriaList: any[], alternativesList: any[]) => {
    const allComparisons: any[] = [];

    // Criteria vs Criteria comparisons
    for (let i = 0; i < criteriaList.length; i++) {
      for (let j = i + 1; j < criteriaList.length; j++) {
        if (criteriaList[i].level === criteriaList[j].level && 
            criteriaList[i].parent_id === criteriaList[j].parent_id) {
          allComparisons.push({
            type: 'criteria',
            left: criteriaList[i],
            right: criteriaList[j],
            parent: criteriaList[i].parent_id
          });
        }
      }
    }

    // Alternative vs Alternative comparisons for each criterion
    criteriaList.forEach(criterion => {
      if (!criterion.children || criterion.children.length === 0) {
        for (let i = 0; i < alternativesList.length; i++) {
          for (let j = i + 1; j < alternativesList.length; j++) {
            allComparisons.push({
              type: 'alternative',
              criterion: criterion,
              left: alternativesList[i],
              right: alternativesList[j]
            });
          }
        }
      }
    });

    setComparisons(allComparisons);
    if (allComparisons.length > 0) {
      setCurrentComparison(allComparisons[0]);
    }
  };

  // Handle registration
  const handleRegistration = async () => {
    if (!registrationData.isAnonymous && !registrationData.name) {
      alert('이름을 입력해주세요.');
      return;
    }

    // Create session
    const newSession: EvaluationSession = {
      sessionId: sessionId || `session_${Date.now()}`,
      projectId: projectId || '',
      evaluatorName: registrationData.isAnonymous ? `익명평가자_${Date.now()}` : registrationData.name,
      email: registrationData.email,
      department: registrationData.department,
      startTime: new Date().toISOString(),
      currentStep: 1,
      totalSteps: comparisons.length,
      progress: 0
    };

    setSession(newSession);
    setIsRegistered(true);

    // Save to database (in production)
    try {
      // This would save to the actual database
      console.log('Session created:', newSession);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  // Handle comparison selection
  const handleComparisonSelect = async (value: number) => {
    if (!currentComparison || !session) return;

    // Save comparison result
    const comparisonData = {
      sessionId: session.sessionId,
      projectId: session.projectId,
      evaluatorName: session.evaluatorName,
      comparisonType: currentComparison.type,
      leftItem: currentComparison.left,
      rightItem: currentComparison.right,
      value: value,
      timestamp: new Date().toISOString()
    };

    try {
      // Save to database (in production)
      console.log('Saving comparison:', comparisonData);
      
      // Move to next comparison
      const nextIndex = comparisonIndex + 1;
      if (nextIndex < comparisons.length) {
        setComparisonIndex(nextIndex);
        setCurrentComparison(comparisons[nextIndex]);
        
        // Update progress
        const progress = Math.round((nextIndex / comparisons.length) * 100);
        setSession({
          ...session,
          currentStep: nextIndex + 1,
          progress: progress
        });
      } else {
        // Evaluation complete
        handleEvaluationComplete();
      }
    } catch (error) {
      console.error('Failed to save comparison:', error);
    }
  };

  // Handle evaluation completion
  const handleEvaluationComplete = async () => {
    if (!session) return;

    const completedSession = {
      ...session,
      progress: 100,
      completedTime: new Date().toISOString()
    };

    try {
      // Save completion status (in production)
      console.log('Evaluation completed:', completedSession);
      
      // Show completion message
      alert('평가가 완료되었습니다. 감사합니다!');
      
      // Redirect or show results
      navigate('/evaluation-complete');
    } catch (error) {
      console.error('Failed to complete evaluation:', error);
    }
  };

  // AHP scale options
  const ahpScale = [
    { value: 1/9, label: '1/9', description: '절대적으로 덜 중요' },
    { value: 1/7, label: '1/7', description: '매우 덜 중요' },
    { value: 1/5, label: '1/5', description: '덜 중요' },
    { value: 1/3, label: '1/3', description: '약간 덜 중요' },
    { value: 1, label: '1', description: '동등' },
    { value: 3, label: '3', description: '약간 더 중요' },
    { value: 5, label: '5', description: '더 중요' },
    { value: 7, label: '7', description: '매우 더 중요' },
    { value: 9, label: '9', description: '절대적으로 더 중요' }
  ];

  // Registration form
  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card title="평가 참여 등록">
            <div className="space-y-6">
              {project && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">{project.title}</h3>
                  <p className="text-sm text-blue-700">{project.description}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={registrationData.isAnonymous}
                    onChange={(e) => setRegistrationData({
                      ...registrationData,
                      isAnonymous: e.target.checked
                    })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
                    익명으로 평가 참여
                  </label>
                </div>

                {!registrationData.isAnonymous && (
                  <>
                    <Input
                      id="name"
                      label="이름"
                      placeholder="평가자 이름"
                      value={registrationData.name}
                      onChange={(value) => setRegistrationData({
                        ...registrationData,
                        name: value
                      })}
                      required
                    />
                    <Input
                      id="email"
                      label="이메일 (선택)"
                      placeholder="email@example.com"
                      value={registrationData.email}
                      onChange={(value) => setRegistrationData({
                        ...registrationData,
                        email: value
                      })}
                    />
                    <Input
                      id="department"
                      label="소속 (선택)"
                      placeholder="부서 또는 조직"
                      value={registrationData.department}
                      onChange={(value) => setRegistrationData({
                        ...registrationData,
                        department: value
                      })}
                    />
                  </>
                )}
              </div>

              <div className="pt-4">
                <Button
                  variant="primary"
                  onClick={handleRegistration}
                  className="w-full"
                >
                  평가 시작하기
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Evaluation interface
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>진행률: {session?.currentStep} / {session?.totalSteps}</span>
            <span>{session?.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${session?.progress}%` }}
            />
          </div>
        </div>

        {/* Comparison card */}
        {currentComparison && (
          <Card title="쌍대비교 평가">
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  아래 두 항목 중 어느 것이 더 중요한지 선택해주세요.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Left item */}
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-lg mb-2">
                    {currentComparison.left.name}
                  </h4>
                  {currentComparison.left.description && (
                    <p className="text-sm text-gray-600">
                      {currentComparison.left.description}
                    </p>
                  )}
                </div>

                {/* VS */}
                <div className="flex items-center justify-center">
                  <div className="text-2xl font-bold text-gray-400">VS</div>
                </div>

                {/* Right item */}
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-lg mb-2">
                    {currentComparison.right.name}
                  </h4>
                  {currentComparison.right.description && (
                    <p className="text-sm text-gray-600">
                      {currentComparison.right.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Scale selection */}
              <div className="space-y-3">
                <h5 className="text-center font-medium text-gray-700">
                  중요도 선택
                </h5>
                <div className="grid grid-cols-9 gap-1">
                  {ahpScale.map((scale) => (
                    <button
                      key={scale.value}
                      onClick={() => handleComparisonSelect(scale.value)}
                      className={`p-3 rounded-lg border transition-all hover:bg-blue-50 hover:border-blue-300 ${
                        scale.value === 1
                          ? 'bg-gray-100 border-gray-300'
                          : scale.value < 1
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-green-50 border-green-200'
                      }`}
                      title={scale.description}
                    >
                      <div className="text-sm font-medium">{scale.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {scale.value < 1 ? '←' : scale.value > 1 ? '→' : '='}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>← {currentComparison.left.name} 더 중요</span>
                  <span>동등</span>
                  <span>{currentComparison.right.name} 더 중요 →</span>
                </div>
              </div>

              {/* Skip button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => handleComparisonSelect(1)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  이 비교 건너뛰기 (동등으로 처리)
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnonymousEvaluator;