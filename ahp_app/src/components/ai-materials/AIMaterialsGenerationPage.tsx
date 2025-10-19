/**
 * AI 학술 자료 생성 페이지
 * AHP 프로젝트 결과를 기반으로 다양한 학술 자료(논문 초안, 발표 자료, 포스터 등)를 AI가 자동 생성하는 시스템
 */

import React, { useState, useEffect } from 'react';
import PageHeader from '../common/PageHeader';
import cleanDataService from '../../services/dataService_clean';
import type { User } from '../../types';

interface Project {
  id?: string;
  title: string;
  description: string;
  objective?: string;
  status: string;
  created_at?: string;
  criteria_count?: number;
  alternatives_count?: number;
  evaluator_count?: number;
}

interface MaterialTemplate {
  id: string;
  type: 'paper-draft' | 'presentation' | 'poster' | 'abstract' | 'proposal' | 'report';
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  features: string[];
}

interface GeneratedMaterial {
  id: string;
  type: string;
  title: string;
  content: string;
  metadata: {
    wordCount: number;
    pageCount: number;
    sections: string[];
    generatedAt: string;
    projectTitle: string;
  };
}

interface AIMaterialsGenerationPageProps {
  user?: User;
}

const AIMaterialsGenerationPage: React.FC<AIMaterialsGenerationPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<string>('selection');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MaterialTemplate | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedMaterial, setGeneratedMaterial] = useState<GeneratedMaterial | null>(null);
  const [generationSettings, setGenerationSettings] = useState({
    includeMethodology: true,
    includeResults: true,
    includeGraphics: true,
    includeReferences: true,
    academicLevel: 'academic' as 'undergraduate' | 'graduate' | 'academic' | 'professional',
    language: 'korean' as 'korean' | 'english' | 'bilingual',
    citationStyle: 'apa' as 'apa' | 'mla' | 'chicago' | 'ieee'
  });

  const tabs = [
    { id: 'selection', title: '프로젝트 선택', icon: '📋' },
    { id: 'template', title: '자료 유형 선택', icon: '🎨' },
    { id: 'settings', title: '생성 설정', icon: '⚙️' },
    { id: 'generation', title: 'AI 생성 중', icon: '🤖' },
    { id: 'result', title: '생성 결과', icon: '📄' }
  ];

  const materialTemplates: MaterialTemplate[] = [
    {
      id: 'paper-draft',
      type: 'paper-draft',
      title: '학술논문 초안',
      description: 'AHP 연구를 위한 완전한 학술논문 초안을 생성합니다',
      icon: '📝',
      estimatedTime: '10-15분',
      features: ['서론-방법론-결과-결론 구조', '참고문헌 자동 생성', 'AHP 방법론 상세 설명', '데이터 분석 결과 포함']
    },
    {
      id: 'presentation',
      type: 'presentation',
      title: '학회 발표 자료',
      description: '학회나 세미나용 발표 슬라이드를 생성합니다',
      icon: '📊',
      estimatedTime: '5-8분',
      features: ['15-20 슬라이드 구성', '시각적 차트 제안', '핵심 포인트 정리', '발표 스크립트 포함']
    },
    {
      id: 'poster',
      type: 'poster',
      title: '학술 포스터',
      description: '학회 포스터 세션용 포스터 내용을 생성합니다',
      icon: '🎯',
      estimatedTime: '3-5분',
      features: ['A1 크기 최적화', '핵심 내용 요약', '시각적 레이아웃 제안', 'QR코드 연결 정보']
    },
    {
      id: 'abstract',
      type: 'abstract',
      title: '연구 초록',
      description: '학회 투고용 연구 초록을 생성합니다',
      icon: '📋',
      estimatedTime: '2-3분',
      features: ['250-300단어 구성', '배경-방법-결과-결론', 'Keywords 자동 생성', '다국어 지원']
    },
    {
      id: 'proposal',
      type: 'proposal',
      title: '연구제안서',
      description: '연구비 신청용 연구제안서를 생성합니다',
      icon: '💡',
      estimatedTime: '8-12분',
      features: ['연구 배경 및 필요성', '연구 계획 및 방법', '기대효과 분석', '예산 계획 제안']
    },
    {
      id: 'report',
      type: 'report',
      title: '분석 보고서',
      description: '의사결정을 위한 AHP 분석 보고서를 생성합니다',
      icon: '📈',
      estimatedTime: '6-10분',
      features: ['경영진 요약', '상세 분석 결과', '실행 방안 제안', '리스크 분석 포함']
    }
  ];

  // 프로젝트 로드
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projects = await cleanDataService.getProjects();
      setProjects(projects || []);
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    }
  };

  // AI 자료 생성 시작
  const startGeneration = async () => {
    if (!selectedProject || !selectedTemplate) {
      alert('프로젝트와 자료 유형을 선택해주세요.');
      return;
    }

    setGenerating(true);
    setActiveTab('generation');

    try {
      // AI 생성 시뮬레이션 (실제로는 API 호출)
      await new Promise(resolve => setTimeout(resolve, 8000));

      const mockMaterial: GeneratedMaterial = {
        id: `material_${Date.now()}`,
        type: selectedTemplate.type,
        title: `${selectedProject.title} - ${selectedTemplate.title}`,
        content: generateMockContent(selectedTemplate.type),
        metadata: {
          wordCount: selectedTemplate.type === 'abstract' ? 280 : 
                    selectedTemplate.type === 'poster' ? 800 : 
                    selectedTemplate.type === 'presentation' ? 1500 : 4500,
          pageCount: selectedTemplate.type === 'abstract' ? 1 : 
                    selectedTemplate.type === 'poster' ? 1 : 
                    selectedTemplate.type === 'presentation' ? 18 : 12,
          sections: getSectionsByType(selectedTemplate.type),
          generatedAt: new Date().toISOString(),
          projectTitle: selectedProject.title
        }
      };

      setGeneratedMaterial(mockMaterial);
      setActiveTab('result');
    } catch (error) {
      console.error('자료 생성 실패:', error);
      alert('자료 생성 중 오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  // 자료 유형별 모크 컨텐츠 생성
  const generateMockContent = (type: string): string => {
    const baseContent = `# ${selectedProject?.title} - AHP 분석 연구

## 1. 연구 개요
본 연구는 AHP(Analytic Hierarchy Process) 방법론을 활용하여 ${selectedProject?.description || '의사결정 문제'}에 대한 체계적 분석을 수행하였습니다.

## 2. 연구 목적
${selectedProject?.objective || '다기준 의사결정 지원을 통한 최적 대안 도출'}

## 3. AHP 방법론
- 계층구조 설계: ${selectedProject?.criteria_count || 5}개 평가기준
- 대안 분석: ${selectedProject?.alternatives_count || 3}개 대안 비교
- 전문가 평가: ${selectedProject?.evaluator_count || 10}명 참여

## 4. 분석 결과
AHP 분석 결과, 다음과 같은 우선순위가 도출되었습니다:
1. 첫 번째 대안 (가중치: 0.45)
2. 두 번째 대안 (가중치: 0.32)  
3. 세 번째 대안 (가중치: 0.23)

일관성 비율(CR): 0.08 (< 0.1, 일관성 확보)

## 5. 결론 및 시사점
본 AHP 분석을 통해 도출된 결과는 의사결정자에게 객관적이고 체계적인 판단 근거를 제공합니다.`;

    switch (type) {
      case 'abstract':
        return `배경: ${selectedProject?.description}에 대한 의사결정 지원을 위해 AHP 방법론을 적용하였습니다. 방법: ${selectedProject?.criteria_count}개 평가기준과 ${selectedProject?.alternatives_count}개 대안으로 계층구조를 설계하고 ${selectedProject?.evaluator_count}명의 전문가가 쌍대비교를 수행했습니다. 결과: 일관성 비율 0.08로 신뢰성 있는 결과를 도출했으며, 최적 대안이 0.45의 가중치로 선정되었습니다. 결론: AHP 방법론이 복잡한 의사결정 상황에서 효과적인 도구임을 확인했습니다.

Keywords: AHP, 다기준 의사결정, 쌍대비교, 가중치, 일관성 분석`;
      
      case 'poster':
        return `${baseContent}

## 연구 프로세스
[시각적 플로우차트]
문제정의 → 계층구조설계 → 쌍대비교 → 가중치계산 → 결과분석

## 핵심 성과
✓ 일관성 있는 평가 결과 도출 (CR < 0.1)
✓ 전문가 합의 기반 객관적 분석
✓ 실무 적용 가능한 의사결정 도구 제공

## QR코드
[상세 연구결과 보기]`;

      case 'presentation':
        return `슬라이드 1: 제목
${selectedProject?.title} AHP 분석 연구

슬라이드 2: 연구 배경
- 문제 상황: ${selectedProject?.description}
- 연구 필요성: 객관적 의사결정 도구 요구

슬라이드 3-5: AHP 방법론 소개
- 계층적 분석과정의 원리
- 쌍대비교의 장점
- 일관성 검증 방법

슬라이드 6-8: 연구 설계
- 계층구조: ${selectedProject?.criteria_count}개 기준, ${selectedProject?.alternatives_count}개 대안
- 평가자: ${selectedProject?.evaluator_count}명 전문가
- 평가 방법: 9점 척도 쌍대비교

슬라이드 9-12: 분석 결과
- 가중치 결과
- 일관성 분석 (CR = 0.08)
- 대안별 종합점수

슬라이드 13-15: 결론 및 시사점
- 최적 대안 도출
- 실무 적용 방안
- 연구의 한계점

슬라이드 16-18: 질의응답
- 추가 분석 계획
- 실무진 피드백 반영 방안
- 후속 연구 제안`;

      default:
        return baseContent + `

## 6. 상세 분석
### 6.1 계층구조 설계
본 연구에서는 ${selectedProject?.criteria_count}개의 주요 평가기준을 도출하고, 각 기준 하위에 세부 지표를 설정하였습니다.

### 6.2 쌍대비교 매트릭스
전문가 ${selectedProject?.evaluator_count}명이 참여하여 총 ${Math.pow(selectedProject?.criteria_count || 5, 2)}개의 쌍대비교를 수행했습니다.

### 6.3 가중치 계산
고유벡터 방법을 사용하여 각 평가기준의 상대적 중요도를 도출했습니다.

### 6.4 일관성 검증
모든 평가자의 일관성 비율(CR)이 0.1 미만으로 나타나 분석 결과의 신뢰성을 확보했습니다.

## 7. 향후 연구 방향
- 퍼지 AHP 방법론 적용 검토
- 더 많은 전문가 참여를 통한 신뢰도 향상
- 실제 적용 후 효과성 검증 연구

## 8. 참고문헌
1. Saaty, T.L. (1980). The Analytic Hierarchy Process. McGraw-Hill.
2. Wind, Y. & Saaty, T.L. (1980). Marketing Applications of the Analytic Hierarchy Process. Management Science, 26(7), 641-658.
3. [추가 참고문헌은 자동 생성됩니다]`;
    }
  };

  // 자료 유형별 섹션 구성
  const getSectionsByType = (type: string): string[] => {
    switch (type) {
      case 'abstract':
        return ['배경', '방법', '결과', '결론'];
      case 'poster':
        return ['제목', '연구개요', '방법론', '결과', '결론'];
      case 'presentation':
        return ['제목슬라이드', '연구배경', 'AHP방법론', '연구설계', '분석결과', '결론', 'Q&A'];
      case 'proposal':
        return ['연구배경', '연구목적', '연구방법', '연구계획', '기대효과', '예산'];
      case 'report':
        return ['개요', '분석결과', '핵심발견', '권고사항', '부록'];
      default:
        return ['서론', '방법론', '결과', '결론', '참고문헌'];
    }
  };

  const renderProjectSelection = () => (
    <div className="space-y-6">
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          📋 프로젝트 선택
        </h2>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          학술 자료를 생성할 AHP 프로젝트를 선택하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedProject?.id === project.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            style={{ 
              backgroundColor: selectedProject?.id === project.id 
                ? 'var(--accent-pastel)' 
                : 'var(--bg-primary)',
              borderColor: selectedProject?.id === project.id 
                ? 'var(--accent-primary)' 
                : 'var(--border-light)'
            }}
          >
            <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              {project.title}
            </h3>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              {project.description}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center" style={{ color: 'var(--text-muted)' }}>
                <span className="mr-1">📊</span>
                평가기준: {project.criteria_count || 0}개
              </div>
              <div className="flex items-center" style={{ color: 'var(--text-muted)' }}>
                <span className="mr-1">🎯</span>
                대안: {project.alternatives_count || 0}개
              </div>
              <div className="flex items-center" style={{ color: 'var(--text-muted)' }}>
                <span className="mr-1">👥</span>
                평가자: {project.evaluator_count || 0}명
              </div>
              <div className="flex items-center" style={{ color: 'var(--text-muted)' }}>
                <span className="mr-1">📅</span>
                {project.created_at ? new Date(project.created_at).toLocaleDateString() : '날짜 미상'}
              </div>
            </div>
            {selectedProject?.id === project.id && (
              <div className="mt-3 text-center text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                ✓ 선택됨
              </div>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            사용 가능한 프로젝트가 없습니다.
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            먼저 AHP 프로젝트를 생성해주세요.
          </p>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => setActiveTab('template')}
          disabled={!selectedProject}
          className="px-8 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent-primary)' }}
        >
          다음: 자료 유형 선택 →
        </button>
      </div>
    </div>
  );

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          🎨 자료 유형 선택
        </h2>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          생성할 학술 자료의 유형을 선택하세요.
        </p>
        {selectedProject && (
          <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'var(--accent-pastel)' }}>
            <p className="text-sm" style={{ color: 'var(--accent-dark)' }}>
              선택된 프로젝트: <strong>{selectedProject.title}</strong>
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materialTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => setSelectedTemplate(template)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTemplate?.id === template.id ? 'border-blue-500' : 'border-gray-200'
            }`}
            style={{ 
              backgroundColor: selectedTemplate?.id === template.id 
                ? 'var(--success-pastel)' 
                : 'var(--bg-primary)',
              borderColor: selectedTemplate?.id === template.id 
                ? 'var(--success-primary)' 
                : 'var(--border-light)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{template.icon}</div>
              <div className="text-sm px-2 py-1 rounded" 
                   style={{ backgroundColor: 'var(--accent-pastel)', color: 'var(--accent-dark)' }}>
                {template.estimatedTime}
              </div>
            </div>
            
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              {template.title}
            </h3>
            
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {template.description}
            </p>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                포함 기능:
              </h4>
              <ul className="text-xs space-y-1">
                {template.features.map((feature, index) => (
                  <li key={index} className="flex items-center" style={{ color: 'var(--text-muted)' }}>
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            {selectedTemplate?.id === template.id && (
              <div className="mt-4 text-center text-sm font-medium" style={{ color: 'var(--success-primary)' }}>
                ✓ 선택됨
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => setActiveTab('settings')}
          disabled={!selectedTemplate}
          className="px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--success-primary)', color: 'var(--text-primary)' }}
        >
          다음: 생성 설정 →
        </button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          ⚙️ 생성 설정
        </h2>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          AI 자료 생성을 위한 세부 설정을 조정하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 포함 내용 설정 */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            📝 포함할 내용
          </h3>
          <div className="space-y-3">
            {[
              { key: 'includeMethodology', label: 'AHP 방법론 설명', icon: '⚖️' },
              { key: 'includeResults', label: '분석 결과 포함', icon: '📊' },
              { key: 'includeGraphics', label: '그래프 및 차트', icon: '📈' },
              { key: 'includeReferences', label: '참고문헌 자동생성', icon: '📚' }
            ].map(item => (
              <label key={item.key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generationSettings[item.key as keyof typeof generationSettings] as boolean}
                  onChange={(e) => setGenerationSettings(prev => ({
                    ...prev,
                    [item.key]: e.target.checked
                  }))}
                  className="w-5 h-5"
                />
                <span className="text-xl">{item.icon}</span>
                <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 품질 및 스타일 설정 */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            🎯 품질 및 스타일
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                학술 수준
              </label>
              <select
                value={generationSettings.academicLevel}
                onChange={(e) => setGenerationSettings(prev => ({
                  ...prev,
                  academicLevel: e.target.value as any
                }))}
                className="w-full p-2 border rounded"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
              >
                <option value="undergraduate">학부생 수준</option>
                <option value="graduate">대학원생 수준</option>
                <option value="academic">학술 연구자 수준</option>
                <option value="professional">전문가 수준</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                언어 설정
              </label>
              <select
                value={generationSettings.language}
                onChange={(e) => setGenerationSettings(prev => ({
                  ...prev,
                  language: e.target.value as any
                }))}
                className="w-full p-2 border rounded"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
              >
                <option value="korean">한국어</option>
                <option value="english">영어</option>
                <option value="bilingual">한영 혼용</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                인용 스타일
              </label>
              <select
                value={generationSettings.citationStyle}
                onChange={(e) => setGenerationSettings(prev => ({
                  ...prev,
                  citationStyle: e.target.value as any
                }))}
                className="w-full p-2 border rounded"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
              >
                <option value="apa">APA Style</option>
                <option value="mla">MLA Style</option>
                <option value="chicago">Chicago Style</option>
                <option value="ieee">IEEE Style</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 요약 정보 */}
      <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--accent-pastel)' }}>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--accent-dark)' }}>
          📋 생성 요약
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>프로젝트:</strong> {selectedProject?.title}
          </div>
          <div>
            <strong>자료 유형:</strong> {selectedTemplate?.title}
          </div>
          <div>
            <strong>예상 소요시간:</strong> {selectedTemplate?.estimatedTime}
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={startGeneration}
          className="px-8 py-3 rounded-lg font-semibold transition-colors"
          style={{ backgroundColor: 'var(--success-primary)', color: 'var(--text-primary)' }}
        >
          🤖 AI 자료 생성 시작
        </button>
      </div>
    </div>
  );

  const renderGeneration = () => (
    <div className="space-y-6">
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          🤖 AI 자료 생성 중
        </h2>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          AI가 {selectedTemplate?.title}을(를) 생성하고 있습니다...
        </p>
      </div>

      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-6" 
             style={{ borderColor: 'var(--success-primary)' }}></div>
        
        <div className="space-y-4">
          <div className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            생성 중... ({selectedTemplate?.estimatedTime})
          </div>
          
          <div className="max-w-md mx-auto space-y-2">
            {[
              '📚 프로젝트 데이터 분석 중...',
              '🔍 AHP 결과 해석 중...',
              '✍️ 학술 내용 작성 중...',
              '📊 차트 및 그래프 생성 중...',
              '📝 참고문헌 수집 중...',
              '🎨 포맷팅 및 최적화 중...'
            ].map((text, index) => (
              <div 
                key={index}
                className="text-sm p-2 rounded"
                style={{ 
                  backgroundColor: generating ? 'var(--success-pastel)' : 'var(--bg-primary)',
                  color: 'var(--success-dark)'
                }}
              >
                {text}
              </div>
            ))}
          </div>
          
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            생성에는 몇 분이 소요될 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!generatedMaterial) return null;

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            📄 생성 완료
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            AI가 고품질 학술 자료를 성공적으로 생성했습니다!
          </p>
        </div>

        {/* 생성 결과 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--success-pastel)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--success-primary)' }}>
              {generatedMaterial.metadata.wordCount.toLocaleString()}
            </div>
            <div className="text-sm" style={{ color: 'var(--success-dark)' }}>단어 수</div>
          </div>
          
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--accent-pastel)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              {generatedMaterial.metadata.pageCount}
            </div>
            <div className="text-sm" style={{ color: 'var(--accent-dark)' }}>페이지 수</div>
          </div>
          
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--warning-pastel)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--warning-primary)' }}>
              {generatedMaterial.metadata.sections.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--warning-dark)' }}>섹션 수</div>
          </div>
          
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="text-2xl" style={{ color: 'var(--text-primary)' }}>✅</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>완료</div>
          </div>
        </div>

        {/* 미리보기 */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            📖 내용 미리보기
          </h3>
          <div 
            className="bg-white p-6 rounded border text-sm leading-relaxed max-h-96 overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            <pre className="whitespace-pre-wrap font-sans">
              {generatedMaterial.content}
            </pre>
          </div>
        </div>

        {/* 구성 섹션 */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            📑 구성 섹션
          </h3>
          <div className="flex flex-wrap gap-2">
            {generatedMaterial.metadata.sections.map((section, index) => (
              <span 
                key={index}
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: 'var(--accent-pastel)', color: 'var(--accent-dark)' }}
              >
                {section}
              </span>
            ))}
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => {
              console.log('Word 다운로드');
              alert('Word 파일이 다운로드됩니다. (구현 예정)');
            }}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            📄 Word로 다운로드
          </button>
          
          <button
            onClick={() => {
              console.log('PDF 다운로드');
              alert('PDF 파일이 다운로드됩니다. (구현 예정)');
            }}
            className="px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: 'var(--success-primary)', color: 'var(--text-primary)' }}
          >
            📕 PDF로 다운로드
          </button>
          
          <button
            onClick={() => {
              console.log('이메일 전송');
              alert('이메일로 전송됩니다. (구현 예정)');
            }}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--warning-primary)' }}
          >
            📧 이메일로 전송
          </button>
          
          <button
            onClick={() => {
              setSelectedProject(null);
              setSelectedTemplate(null);
              setGeneratedMaterial(null);
              setActiveTab('selection');
            }}
            className="px-6 py-3 rounded-lg font-semibold"
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)'
            }}
          >
            🔄 새 자료 생성
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'selection':
        return renderProjectSelection();
      case 'template':
        return renderTemplateSelection();
      case 'settings':
        return renderSettings();
      case 'generation':
        return renderGeneration();
      case 'result':
        return renderResult();
      default:
        return renderProjectSelection();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <PageHeader
        title="AI 학술 자료 생성"
        description="AHP 프로젝트 결과를 기반으로 다양한 학술 자료를 AI가 자동 생성합니다"
        icon="📚"
        onBack={() => window.history.back()}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={
                  (tab.id === 'template' && !selectedProject) ||
                  (tab.id === 'settings' && !selectedTemplate) ||
                  (tab.id === 'generation' && !generating && !generatedMaterial) ||
                  (tab.id === 'result' && !generatedMaterial)
                }
                className={`flex items-center space-x-2 px-4 py-2 rounded font-medium transition-all ${
                  activeTab === tab.id ? 'shadow-lg' : ''
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--success-primary)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  opacity: (
                    (tab.id === 'template' && !selectedProject) ||
                    (tab.id === 'settings' && !selectedTemplate) ||
                    (tab.id === 'generation' && !generating && !generatedMaterial) ||
                    (tab.id === 'result' && !generatedMaterial)
                  ) ? 0.5 : 1
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AIMaterialsGenerationPage;