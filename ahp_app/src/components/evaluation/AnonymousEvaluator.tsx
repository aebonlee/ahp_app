import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon, 
  PlayIcon, 
  PauseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { 
  anonymousEvaluationService, 
  anonymousEvaluationUtils,
  AnonymousEvaluationSession,
  PairwiseComparisonResult,
  EvaluationProgress,
  SessionRecoveryData
} from '../../services/anonymousEvaluationService';
import { projectApi, criteriaApi, alternativeApi } from '../../services/api';

interface ComparisonPair {
  id: string;
  type: 'criteria' | 'alternative';
  left: any;
  right: any;
  parent?: any;
  completed?: boolean;
  value?: number;
}

const AnonymousEvaluator: React.FC = () => {
  const { projectId, sessionId } = useParams<{ projectId: string; sessionId: string }>();
  const navigate = useNavigate();
  
  // Core state
  const [session, setSession] = useState<AnonymousEvaluationSession | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Registration state
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    department: '',
    isAnonymous: true
  });
  
  // Project data
  const [project, setProject] = useState<any>(null);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  
  // Evaluation state
  const [comparisons, setComparisons] = useState<ComparisonPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<EvaluationProgress | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState<SessionRecoveryData | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Refs for cleanup
  const autoSaveCleanup = useRef<(() => void) | null>(null);
  const comparisonStartTime = useRef<number>(0);
  const activityTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize and load data
  useEffect(() => {
    initializeEvaluation();
    
    // Cleanup on unmount
    return () => {
      if (autoSaveCleanup.current) {
        autoSaveCleanup.current();
      }
      if (activityTimer.current) {
        clearTimeout(activityTimer.current);
      }
    };
  }, [projectId, sessionId]);

  // Auto-save setup
  useEffect(() => {
    if (session && autoSaveEnabled) {
      autoSaveCleanup.current = anonymousEvaluationUtils.setupAutoSave(session.id);
    }
    
    return () => {
      if (autoSaveCleanup.current) {
        autoSaveCleanup.current();
        autoSaveCleanup.current = null;
      }
    };
  }, [session, autoSaveEnabled]);

  // Activity tracking
  useEffect(() => {
    const updateActivity = () => {
      if (session && !isPaused) {
        anonymousEvaluationService.updateSessionActivity(session.id);
      }
    };
    
    // Update activity every 30 seconds
    if (session && !isPaused) {
      activityTimer.current = setInterval(updateActivity, 30000);
    }
    
    return () => {
      if (activityTimer.current) {
        clearInterval(activityTimer.current);
      }
    };
  }, [session, isPaused]);

  // 데이터 로딩 완료 후 비교 쌍 생성
  useEffect(() => {
    if (session && criteria.length > 0 && alternatives.length > 0 && comparisons.length === 0) {
      generateComparisons();
    }
  }, [session, criteria, alternatives]);

  const initializeEvaluation = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 익명 평가 초기화:', { projectId, sessionId });
      
      // Try to recover existing session first
      if (sessionId) {
        await attemptSessionRecovery();
      } else {
        await attemptAutoRecovery();
      }
      
      // Load project data
      await loadProjectData();
      
    } catch (err: any) {
      console.error('❌ 평가 초기화 오류:', err);
      setError(err.message || '평가를 초기화하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const attemptSessionRecovery = async () => {
    try {
      const response = await anonymousEvaluationService.getSession(sessionId!);
      
      if (response.success && response.data) {
        setSession(response.data);
        setIsRegistered(true);
        
        // Load progress and comparisons
        await loadSessionProgress(response.data.id);
        
        console.log('✅ 세션 복구 성공:', response.data.id);
      }
    } catch (error) {
      console.warn('⚠️ 세션 복구 실패, 새 세션으로 진행');
    }
  };

  const attemptAutoRecovery = async () => {
    try {
      const recoveredData = await anonymousEvaluationUtils.attemptRecovery();
      
      if (recoveredData) {
        setRecoveryData(recoveredData);
        setShowRecoveryModal(true);
        console.log('📂 자동 복구 데이터 발견');
      }
    } catch (error) {
      console.warn('⚠️ 자동 복구 실패');
    }
  };

  const loadProjectData = async () => {
    if (!projectId) return;
    
    try {
      // Load project details
      const projectResponse = await projectApi.getProject(projectId);
      if (projectResponse.success && projectResponse.data) {
        setProject(projectResponse.data);
      }
      
      // Load criteria
      const criteriaResponse = await criteriaApi.getCriteria(projectId);
      if (criteriaResponse.success && criteriaResponse.data) {
        setCriteria(criteriaResponse.data);
      }
      
      // Load alternatives
      const alternativesResponse = await alternativeApi.getAlternatives(projectId);
      if (alternativesResponse.success && alternativesResponse.data) {
        setAlternatives(alternativesResponse.data);
      }
      
      console.log('✅ 프로젝트 데이터 로딩 완료');
      
      // 데이터 로딩 완료 후 비교 쌍 생성 (세션이 있는 경우)
      if (session) {
        setTimeout(() => generateComparisons(), 100);
      }
    } catch (error) {
      console.error('❌ 프로젝트 데이터 로딩 실패:', error);
      throw new Error('프로젝트 데이터를 불러올 수 없습니다.');
    }
  };

  const loadSessionProgress = async (sessionId: string) => {
    try {
      const progressResponse = await anonymousEvaluationService.getProgress(sessionId);
      if (progressResponse.success && progressResponse.data) {
        setProgress(progressResponse.data);
        setCurrentIndex(progressResponse.data.current_comparison_index);
      }
      
      const comparisonsResponse = await anonymousEvaluationService.getSessionComparisons(sessionId);
      if (comparisonsResponse.success && comparisonsResponse.data) {
        // Mark completed comparisons
        const completedIds = new Set(comparisonsResponse.data.map(c => 
          `${c.left_element_id}_${c.right_element_id}_${c.parent_criteria_id || 'root'}`
        ));
        
        setComparisons(prev => prev.map(comp => ({
          ...comp,
          completed: completedIds.has(`${comp.left.id}_${comp.right.id}_${comp.parent?.id || 'root'}`)
        })));
      }
    } catch (error) {
      console.error('❌ 세션 진행상황 로딩 실패:', error);
    }
  };

  const handleRegistration = async () => {
    if (!registrationData.isAnonymous && !registrationData.name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    
    if (!projectId) {
      setError('프로젝트 ID가 필요합니다.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const evaluatorData = {
        name: registrationData.isAnonymous 
          ? `익명평가자_${Date.now()}` 
          : registrationData.name.trim(),
        email: registrationData.email.trim() || undefined,
        department: registrationData.department.trim() || undefined,
        isAnonymous: registrationData.isAnonymous
      };
      
      console.log('📝 세션 생성:', evaluatorData);
      
      const response = await anonymousEvaluationService.createSession(projectId, evaluatorData);
      
      if (response.success && response.data) {
        setSession(response.data);
        setIsRegistered(true);
        
        // Store session locally
        anonymousEvaluationUtils.storeSessionLocally(response.data);
        
        // Generate comparisons after session creation
        setTimeout(() => {
          if (criteria.length > 0 || alternatives.length > 0) {
            generateComparisons();
          }
        }, 100);
        
        setSuccess('평가 세션이 생성되었습니다!');
        console.log('✅ 세션 생성 성공:', response.data.id);
      } else {
        throw new Error(response.error || '세션 생성에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('❌ 등록 오류:', err);
      setError(err.message || '등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generateComparisons = () => {
    const allComparisons: ComparisonPair[] = [];
    
    // Criteria comparisons
    for (let i = 0; i < criteria.length; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        if (criteria[i].level === criteria[j].level && 
            criteria[i].parent_id === criteria[j].parent_id) {
          allComparisons.push({
            id: `criteria_${criteria[i].id}_${criteria[j].id}`,
            type: 'criteria',
            left: criteria[i],
            right: criteria[j],
            parent: criteria[i].parent_id ? criteria.find(c => c.id === criteria[i].parent_id) : null
          });
        }
      }
    }
    
    // Alternative comparisons for each leaf criterion
    const leafCriteria = criteria.filter(c => !criteria.some(child => child.parent_id === c.id));
    leafCriteria.forEach(criterion => {
      for (let i = 0; i < alternatives.length; i++) {
        for (let j = i + 1; j < alternatives.length; j++) {
          allComparisons.push({
            id: `alternative_${alternatives[i].id}_${alternatives[j].id}_${criterion.id}`,
            type: 'alternative',
            left: alternatives[i],
            right: alternatives[j],
            parent: criterion
          });
        }
      }
    });
    
    setComparisons(allComparisons);
    console.log('🔄 비교 쌍 생성 완료:', allComparisons.length, '개');
    
    // 첫 번째 비교의 시작 시간 설정
    if (allComparisons.length > 0) {
      comparisonStartTime.current = Date.now();
    }
  };

  const handleComparisonSelect = async (value: number) => {
    if (!session || currentIndex >= comparisons.length) return;
    
    const currentComparison = comparisons[currentIndex];
    const responseTime = Date.now() - comparisonStartTime.current;
    
    setLoading(true);
    setError('');
    
    try {
      // Validate comparison data
      const comparisonData: Omit<PairwiseComparisonResult, 'id' | 'created_at'> = {
        session_id: session.id,
        project_id: session.project_id,
        comparison_type: currentComparison.type,
        parent_criteria_id: currentComparison.parent?.id,
        left_element_id: currentComparison.left.id,
        left_element_name: currentComparison.left.name,
        right_element_id: currentComparison.right.id,
        right_element_name: currentComparison.right.name,
        comparison_value: value,
        response_time_ms: responseTime,
        is_skipped: value === 1 && responseTime < 1000 // Quick clicks on "1" might be skips
      };
      
      // Validate before saving
      const validation = anonymousEvaluationUtils.validateComparison(comparisonData);
      if (!validation.valid) {
        throw new Error(`데이터 검증 실패: ${validation.errors.join(', ')}`);
      }
      
      // Save comparison
      const response = await anonymousEvaluationService.saveComparison(comparisonData);
      
      if (response.success) {
        // Update local state
        const updatedComparisons = [...comparisons];
        updatedComparisons[currentIndex] = {
          ...currentComparison,
          completed: true,
          value: value
        };
        setComparisons(updatedComparisons);
        
        // Move to next comparison
        const nextIndex = currentIndex + 1;
        if (nextIndex < comparisons.length) {
          setCurrentIndex(nextIndex);
          comparisonStartTime.current = Date.now();
          (window as any).comparisonStartTime = Date.now();
          
          // Update progress
          const progressPercentage = Math.round((nextIndex / comparisons.length) * 100);
          await anonymousEvaluationService.updateProgress(session.id, {
            completed_comparisons: nextIndex,
            current_comparison_index: nextIndex,
            progress_percentage: progressPercentage,
            last_comparison_at: new Date().toISOString()
          });
          
        } else {
          // All comparisons completed
          await handleEvaluationComplete();
        }
        
        console.log('✅ 비교 저장 성공:', currentComparison.id);
      } else {
        throw new Error(response.error || '비교 저장에 실패했습니다.');
      }
      
    } catch (err: any) {
      console.error('❌ 비교 저장 오류:', err);
      setError(err.message || '비교를 저장하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationComplete = async () => {
    if (!session) return;
    
    setLoading(true);
    
    try {
      const response = await anonymousEvaluationService.completeSession(session.id, {
        completion_notes: 'All comparisons completed successfully'
      });
      
      if (response.success) {
        setSuccess('평가가 완료되었습니다! 참여해 주셔서 감사합니다.');
        
        // Validate data integrity before completion
        const validation = await anonymousEvaluationService.validateSessionIntegrity(session.id);
        if (validation.success && validation.data && !validation.data.is_valid) {
          console.warn('⚠️ 데이터 무결성 문제 발견:', validation.data.issues);
        }
        
        setTimeout(() => {
          navigate('/evaluation-complete');
        }, 3000);
        
        console.log('🎉 평가 완료:', session.id);
      } else {
        throw new Error(response.error || '평가 완료 처리에 실패했습니다.');
      }
      
    } catch (err: any) {
      console.error('❌ 평가 완료 오류:', err);
      setError(err.message || '평가 완료 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseResume = async () => {
    if (!session) return;
    
    try {
      if (isPaused) {
        await anonymousEvaluationService.resumeSession(session.id);
        setIsPaused(false);
        setSuccess('평가가 재개되었습니다.');
      } else {
        await anonymousEvaluationService.pauseSession(session.id);
        setIsPaused(true);
        setSuccess('평가가 일시정지되었습니다.');
      }
    } catch (err: any) {
      setError(err.message || '상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleRecoveryAccept = async () => {
    if (recoveryData) {
      setSession(recoveryData.session);
      setIsRegistered(true);
      setCurrentIndex(recoveryData.progress.current_comparison_index);
      setProgress(recoveryData.progress);
      
      // 데이터 로딩 후 비교 쌍 재생성
      await loadProjectData();
      
      // 비교 쌍 생성
      setTimeout(() => {
        if (criteria.length > 0 || alternatives.length > 0) {
          generateComparisons();
          
          // 복구된 진행상황 적용
          if (recoveryData.completed_comparisons) {
            const completedIds = new Set(recoveryData.completed_comparisons.map(c => 
              `${c.left_element_id}_${c.right_element_id}_${c.parent_criteria_id || 'root'}`
            ));
            
            setComparisons(prev => prev.map(comp => ({
              ...comp,
              completed: completedIds.has(`${comp.left.id}_${comp.right.id}_${comp.parent?.id || 'root'}`)
            })));
          }
        }
      }, 200);
      
      setShowRecoveryModal(false);
      setSuccess('이전 평가가 복구되었습니다!');
    }
  };

  const currentComparison = comparisons[currentIndex];
  const completedComparisons = comparisons.filter(c => c.completed).length;
  const progressPercentage = comparisons.length > 0 ? Math.round((completedComparisons / comparisons.length) * 100) : 0;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">평가를 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // Registration form
  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <ShieldCheckIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">평가 참여 등록</h1>
                <p className="text-gray-600 mt-2">안전하고 익명으로 평가에 참여할 수 있습니다</p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    <div className="ml-2">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <div className="ml-2">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {project && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">{project.title}</h3>
                  <p className="text-sm text-blue-700">{project.description}</p>
                  <div className="mt-2 text-xs text-blue-600">
                    기준 {criteria.length}개 • 대안 {alternatives.length}개
                    {criteria.length > 0 && alternatives.length > 0 && (
                      <span> • 예상 소요시간 {Math.ceil(((criteria.length * (criteria.length - 1)) / 2 + 
                        alternatives.length * (alternatives.length - 1) / 2 * criteria.filter(c => !criteria.some(child => child.parent_id === c.id)).length) * 0.5)}분</span>
                    )}
                  </div>
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
                    익명으로 평가 참여 (권장)
                  </label>
                </div>

                {!registrationData.isAnonymous && (
                  <div className="space-y-4 pl-7">
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
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  <div className="ml-2">
                    <h4 className="text-sm font-medium text-yellow-800">데이터 보호 안내</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      • 평가 데이터는 안전하게 암호화되어 저장됩니다<br/>
                      • 브라우저 종료 시에도 진행상황이 자동 저장됩니다<br/>
                      • 익명 평가 시 개인정보는 수집되지 않습니다
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleRegistration}
                disabled={loading}
                className="w-full"
              >
                {loading ? '등록 중...' : '평가 시작하기'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Evaluation interface
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header with session info */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{project?.title}</h1>
              <p className="text-sm text-gray-600">
                평가자: {session?.evaluator_name} • 
                세션 ID: {session?.session_key.substring(0, 8)}...
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePauseResume}
                disabled={loading}
                className="flex items-center"
              >
                {isPaused ? (
                  <>
                    <PlayIcon className="h-4 w-4 mr-1" />
                    재개
                  </>
                ) : (
                  <>
                    <PauseIcon className="h-4 w-4 mr-1" />
                    일시정지
                  </>
                )}
              </Button>
              
              {autoSaveEnabled && (
                <div className="flex items-center text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  자동저장
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error/Success Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-2">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-2">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <Card>
          <div className="p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>진행률: {completedComparisons} / {comparisons.length}</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            {session && (
              <div className="mt-2 text-xs text-gray-500">
                시작: {new Date(session.started_at).toLocaleString('ko-KR')} • 
                마지막 활동: {new Date(session.last_activity_at).toLocaleString('ko-KR')}
              </div>
            )}
          </div>
        </Card>

        {/* Evaluation Complete */}
        {currentIndex >= comparisons.length && comparisons.length > 0 && !loading && (
          <Card>
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">평가 완료!</h3>
              <p className="text-gray-600 mb-6">
                모든 비교를 완료했습니다. 소중한 시간을 내어 평가에 참여해 주셔서 감사합니다.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-4 text-sm text-green-800">
                  <span>완료된 비교: {comparisons.length}개</span>
                  <span>•</span>
                  <span>소요 시간: {session ? Math.round((Date.now() - new Date(session.started_at).getTime()) / 60000) : 0}분</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                결과는 연구자에게 전달되어 분석에 활용됩니다.
              </p>
            </div>
          </Card>
        )}

        {/* No comparisons available */}
        {!loading && comparisons.length === 0 && isRegistered && (
          <Card>
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">평가할 항목이 없습니다</h3>
              <p className="text-gray-600 mb-4">
                이 프로젝트에 기준이나 대안이 설정되지 않았거나, 모든 평가가 완료되었습니다.
              </p>
              <p className="text-sm text-gray-500">
                프로젝트 관리자에게 문의하시기 바랍니다.
              </p>
            </div>
          </Card>
        )}

        {/* Comparison interface */}
        {currentComparison && !isPaused && currentIndex < comparisons.length && (
          <Card>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentComparison.type === 'criteria' ? '기준 간 비교' : '대안 간 비교'}
                </h2>
                {currentComparison.parent && (
                  <p className="text-sm text-gray-600">
                    기준: {currentComparison.parent.name}
                  </p>
                )}
                <p className="text-gray-600 mt-2">
                  아래 두 항목 중 어느 것이 더 중요한지 선택해주세요.
                </p>
              </div>

              {/* Comparison items */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <h4 className="font-medium text-lg mb-2 text-blue-900">
                    {currentComparison.left.name}
                  </h4>
                  {currentComparison.left.description && (
                    <p className="text-sm text-blue-700">
                      {currentComparison.left.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-3xl font-bold text-gray-400">VS</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <h4 className="font-medium text-lg mb-2 text-green-900">
                    {currentComparison.right.name}
                  </h4>
                  {currentComparison.right.description && (
                    <p className="text-sm text-green-700">
                      {currentComparison.right.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Scale selection */}
              <div className="space-y-4">
                <h5 className="text-center font-medium text-gray-700">
                  중요도 선택
                </h5>
                <div className="grid grid-cols-9 gap-1">
                  {ahpScale.map((scale) => (
                    <button
                      key={scale.value}
                      onClick={() => handleComparisonSelect(scale.value)}
                      disabled={loading}
                      className={`p-3 rounded-lg border-2 transition-all hover:shadow-md disabled:opacity-50 ${
                        scale.value === 1
                          ? 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                          : scale.value < 1
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                          : 'bg-green-50 border-green-200 hover:bg-green-100'
                      }`}
                      title={scale.description}
                    >
                      <div className="text-sm font-bold">{scale.label}</div>
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

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentIndex > 0) {
                      setCurrentIndex(currentIndex - 1);
                    }
                  }}
                  disabled={currentIndex === 0 || loading}
                  className="flex items-center"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  이전
                </Button>
                
                <button
                  onClick={() => handleComparisonSelect(1)}
                  disabled={loading}
                  className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  건너뛰기 (동등으로 처리)
                </button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentIndex < comparisons.length - 1) {
                      setCurrentIndex(currentIndex + 1);
                    }
                  }}
                  disabled={currentIndex >= comparisons.length - 1 || loading}
                  className="flex items-center"
                >
                  다음
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Paused state */}
        {isPaused && (
          <Card>
            <div className="p-8 text-center">
              <PauseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">평가가 일시정지되었습니다</h3>
              <p className="text-gray-600 mb-4">
                평가를 재개하려면 위의 재개 버튼을 클릭하세요.
              </p>
              <p className="text-sm text-gray-500">
                진행상황은 자동으로 저장됩니다.
              </p>
            </div>
          </Card>
        )}

        {/* Recovery Modal */}
        <Modal
          isOpen={showRecoveryModal}
          onClose={() => setShowRecoveryModal(false)}
          title="이전 평가 복구"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              이전에 진행하던 평가가 발견되었습니다. 계속 진행하시겠습니까?
            </p>
            
            {recoveryData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm">
                  <div>프로젝트: {recoveryData.session.project_id}</div>
                  <div>진행률: {recoveryData.progress.completed_comparisons} / {recoveryData.progress.total_comparisons}</div>
                  <div>마지막 활동: {new Date(recoveryData.session.last_activity_at).toLocaleString('ko-KR')}</div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRecoveryModal(false)}
              >
                새로 시작
              </Button>
              <Button
                variant="primary"
                onClick={handleRecoveryAccept}
              >
                복구하여 계속
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AnonymousEvaluator;