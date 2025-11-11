/**
 * 인구통계 설문 데이터 관리를 위한 커스텀 훅
 */
import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

interface DemographicData {
  age: string;
  gender: string;
  education: string;
  occupation: string;
  experience: string;
  department: string;
  position: string;
  projectExperience: string;
  decisionRole: string;
  additionalInfo: string;
}

interface UseDemographicSurveyProps {
  projectId?: string;
  evaluatorId?: string;
  autoSave?: boolean;
}

interface DemographicStats {
  totalResponses: number;
  completionRate: number;
  averageAge?: string;
  genderDistribution?: Record<string, number>;
  educationDistribution?: Record<string, number>;
  experienceDistribution?: Record<string, number>;
}

export const useDemographicSurvey = ({ 
  projectId, 
  evaluatorId,
  autoSave = false 
}: UseDemographicSurveyProps) => {
  const [data, setData] = useState<DemographicData | null>(null);
  const [stats, setStats] = useState<DemographicStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // 데이터 로드
  const loadData = useCallback(async () => {
    if (!projectId || !evaluatorId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.demographicAPI.fetchByEvaluator(projectId, evaluatorId);
      
      if (response.data && typeof response.data === 'object') {
        setData(response.data as DemographicData);
        setIsDirty(false);
      }
    } catch (err) {
      // 데이터가 없는 경우 로컬 스토리지 확인
      const localKey = `demographic_${projectId}_${evaluatorId}`;
      const localData = localStorage.getItem(localKey);
      
      if (localData) {
        setData(JSON.parse(localData));
      } else {
        setError('저장된 데이터가 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, evaluatorId]);

  // 데이터 저장
  const saveData = useCallback(async (formData: DemographicData) => {
    if (!projectId) {
      // 프로젝트 ID가 없으면 로컬에만 저장
      localStorage.setItem('demographic_temp', JSON.stringify(formData));
      setData(formData);
      setIsDirty(false);
      return true;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        ...formData,
        project_id: projectId,
        evaluator_id: evaluatorId,
        submitted_at: new Date().toISOString()
      };
      
      const response = evaluatorId
        ? await apiService.demographicAPI.update(projectId, evaluatorId, payload)
        : await apiService.demographicAPI.createForProject(projectId, payload);
      
      if (response.data && typeof response.data === 'object') {
        setData(response.data as DemographicData);
        setIsDirty(false);
      }
      
      // 로컬 백업
      if (response.data) {
        const localKey = `demographic_${projectId}_${evaluatorId}`;
        localStorage.setItem(localKey, JSON.stringify(response.data));
      }
      
      return true;
    } catch (err) {
      setError('데이터 저장 실패');
      console.error('Save error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [projectId, evaluatorId]);

  // 프로젝트 통계 로드
  const loadStats = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const response = await apiService.demographicAPI.fetchStats(projectId);
      
      if (response.data && typeof response.data === 'object') {
        setStats(response.data as DemographicStats);
      }
    } catch (err) {
      console.error('통계 로드 실패:', err);
    }
  }, [projectId]);

  // 데이터 유효성 검증
  const validateData = useCallback((formData: DemographicData): string[] => {
    const errors: string[] = [];
    
    // 필수 필드 검사
    const requiredFields = ['age', 'gender', 'education', 'occupation'];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof DemographicData]) {
        errors.push(`${field} 필드는 필수입니다.`);
      }
    });
    
    return errors;
  }, []);

  // 완료율 계산
  const calculateCompletionRate = useCallback((formData: DemographicData): number => {
    const fields = Object.keys(formData) as (keyof DemographicData)[];
    const filledFields = fields.filter(field => formData[field] !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  }, []);

  // 자동 저장
  useEffect(() => {
    if (autoSave && isDirty && data) {
      const timer = setTimeout(() => {
        saveData(data);
      }, 2000); // 2초 후 자동 저장
      
      return () => clearTimeout(timer);
    }
  }, [data, isDirty, autoSave, saveData]);

  // 초기 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 통계 로드
  useEffect(() => {
    if (projectId) {
      loadStats();
    }
  }, [projectId, loadStats]);

  return {
    data,
    stats,
    loading,
    error,
    isDirty,
    setData: (newData: DemographicData) => {
      setData(newData);
      setIsDirty(true);
    },
    saveData,
    validateData,
    calculateCompletionRate,
    refreshData: loadData,
    refreshStats: loadStats
  };
};

// 인구통계 데이터 집계 유틸리티
export const aggregateDemographicData = (responses: DemographicData[]): DemographicStats => {
  if (responses.length === 0) {
    return {
      totalResponses: 0,
      completionRate: 0
    };
  }

  // 성별 분포
  const genderDistribution = responses.reduce((acc, curr) => {
    acc[curr.gender] = (acc[curr.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 학력 분포
  const educationDistribution = responses.reduce((acc, curr) => {
    acc[curr.education] = (acc[curr.education] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 경력 분포
  const experienceDistribution = responses.reduce((acc, curr) => {
    acc[curr.experience] = (acc[curr.experience] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 완료율 계산
  const completedResponses = responses.filter(r => 
    r.age && r.gender && r.education && r.occupation
  );
  const completionRate = (completedResponses.length / responses.length) * 100;

  return {
    totalResponses: responses.length,
    completionRate: Math.round(completionRate),
    genderDistribution,
    educationDistribution,
    experienceDistribution
  };
};

// 인구통계 데이터 내보내기 유틸리티
export const exportDemographicData = (data: DemographicData[], format: 'json' | 'csv' = 'json') => {
  if (format === 'json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demographic_data_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (format === 'csv') {
    // CSV 변환
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(row => 
      Object.values(row).map(v => `"${v || ''}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demographic_data_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};