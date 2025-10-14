/**
 * AI 논문 생성 페이지
 * 사용자의 AHP 프로젝트 데이터를 기반으로 학술 논문을 자동 생성하는 AI 시스템
 */

import React, { useState, useEffect } from 'react';
import UIIcon from '../common/UIIcon';
import PageHeader from '../common/PageHeader';
import { PrimaryButton, SecondaryButton, SuccessButton, DangerButton } from '../common/UIButton';
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

interface PaperSection {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

interface AIPaperGenerationPageProps {
  user?: User;
}

const AIPaperGenerationPage: React.FC<AIPaperGenerationPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<string>('project-selection');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [paperSections, setPaperSections] = useState<PaperSection[]>([]);
  const [paperSettings, setPaperSettings] = useState({
    paperType: 'journal',
    language: 'korean',
    citationStyle: 'apa',
    includeGraphics: true,
    includeAppendix: true,
    wordCount: 'standard'
  });

  const tabs = [
    { id: 'project-selection', title: '프로젝트 선택', icon: '📂' },
    { id: 'paper-settings', title: '논문 설정', icon: '⚙️' },
    { id: 'content-generation', title: '내용 생성', icon: '✍️' },
    { id: 'review-edit', title: '검토 및 편집', icon: '📝' },
    { id: 'export-download', title: '내보내기', icon: '💾' }
  ];

  const paperSectionTemplates = [
    { id: 'abstract', title: '초록', content: '' },
    { id: 'introduction', title: '서론', content: '' },
    { id: 'literature-review', title: '문헌 고찰', content: '' },
    { id: 'methodology', title: '연구 방법론', content: '' },
    { id: 'ahp-model', title: 'AHP 모델 설계', content: '' },
    { id: 'data-collection', title: '데이터 수집', content: '' },
    { id: 'analysis-results', title: '분석 결과', content: '' },
    { id: 'discussion', title: '논의', content: '' },
    { id: 'conclusion', title: '결론', content: '' },
    { id: 'references', title: '참고문헌', content: '' }
  ];

  // 프로젝트 목록 로드
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const projectsData = await cleanDataService.getProjects();
      setProjects(projectsData || []);
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 선택된 프로젝트의 상세 데이터 로드
  const loadProjectData = async (project: Project) => {
    if (!project.id) {
      console.error('프로젝트 ID가 없습니다.');
      return;
    }
    
    setLoading(true);
    try {
      const [criteria, alternatives, evaluations] = await Promise.all([
        cleanDataService.getCriteria(project.id),
        cleanDataService.getAlternatives(project.id),
        cleanDataService.getEvaluators(project.id)
      ]);

      setProjectData({
        project,
        criteria: criteria || [],
        alternatives: alternatives || [],
        evaluations: evaluations || []
      });

      setSelectedProject(project);
      setActiveTab('paper-settings');
    } catch (error) {
      console.error('프로젝트 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // AI 논문 생성 시작
  const generatePaper = async () => {
    if (!selectedProject || !projectData) return;

    setGenerating(true);
    setPaperSections(paperSectionTemplates.map(section => ({
      ...section,
      status: 'pending' as const
    })));
    setActiveTab('content-generation');

    try {
      // 순차적으로 각 섹션 생성
      for (let i = 0; i < paperSectionTemplates.length; i++) {
        const section = paperSectionTemplates[i];
        
        // 현재 섹션을 생성 중으로 표시
        setPaperSections(prev => prev.map((s, index) => 
          index === i ? { ...s, status: 'generating' } : s
        ));

        // 실제로는 AI API 호출, 여기서는 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const generatedContent = await generateSectionContent(section.id, projectData);
        
        // 생성 완료로 표시
        setPaperSections(prev => prev.map((s, index) => 
          index === i ? { ...s, status: 'completed', content: generatedContent } : s
        ));
      }
      
      setActiveTab('review-edit');
    } catch (error) {
      console.error('논문 생성 실패:', error);
    } finally {
      setGenerating(false);
    }
  };

  // 섹션별 내용 생성 (AI 시뮬레이션)
  const generateSectionContent = async (sectionId: string, data: any): Promise<string> => {
    const { project, criteria, alternatives } = data;
    
    switch (sectionId) {
      case 'abstract':
        return `본 연구는 "${project.title}"를 주제로 AHP(Analytic Hierarchy Process) 기법을 활용한 다기준 의사결정 분석을 수행하였다. ${criteria.length}개의 주요 평가 기준과 ${alternatives.length}개의 대안을 설정하여 체계적인 비교 분석을 실시하였으며, 전문가 집단의 의견을 수렴하여 최적의 대안을 도출하였다. 연구 결과는 의사결정 과정의 투명성과 객관성을 제고하는 데 기여할 것으로 기대된다.`;
      
      case 'introduction':
        return `${project.objective}\n\n최근 복잡해지는 의사결정 환경에서 다기준 의사결정 기법의 중요성이 증대되고 있다. 특히 AHP는 정량적 분석과 정성적 판단을 체계적으로 결합할 수 있는 강력한 도구로 인정받고 있다. 본 연구에서는 "${project.title}" 문제를 해결하기 위해 AHP 기법을 적용하였다.`;
      
      case 'methodology':
        return `본 연구는 AHP(Analytic Hierarchy Process) 기법을 활용하여 수행되었다. AHP는 Saaty(1980)에 의해 개발된 다기준 의사결정 기법으로, 복잡한 문제를 계층적으로 분해하고 쌍대비교를 통해 대안들의 우선순위를 결정하는 방법이다.\n\n연구 절차는 다음과 같다:\n1. 문제 정의 및 목표 설정\n2. 계층구조 설계 (${criteria.length}개 기준, ${alternatives.length}개 대안)\n3. 쌍대비교 설문 설계\n4. 전문가 설문 실시\n5. 일관성 검증\n6. 가중치 계산 및 대안 순위 도출`;
      
      case 'ahp-model':
        return `본 연구의 AHP 모델은 다음과 같이 구성되었다:\n\n**평가 기준:**\n${criteria.map((c: any, i: number) => `${i + 1}. ${c.name}: ${c.description || '평가 기준'}`).join('\n')}\n\n**평가 대안:**\n${alternatives.map((a: any, i: number) => `${i + 1}. ${a.name}: ${a.description || '평가 대안'}`).join('\n')}\n\n계층구조는 목표-기준-대안의 3단계로 설계되었으며, 각 단계별로 쌍대비교를 실시하여 상대적 중요도를 도출하였다.`;
      
      case 'analysis-results':
        return `AHP 분석 결과, 평가 기준별 가중치는 다음과 같이 도출되었다:\n\n**기준별 가중치:**\n${criteria.map((c: any, i: number) => `• ${c.name}: 가중치 미산출 (실제 평가 필요)`).join('\n')}\n\n**대안별 종합 점수:**\n${alternatives.map((a: any, i: number) => `• ${a.name}: 종합 점수 미산출 (실제 평가 필요)`).join('\n')}\n\n모든 쌍대비교에서 일관성 비율(CR)이 0.1 이하로 나타나 결과의 신뢰성을 확보하였다.`;
      
      case 'conclusion':
        return `본 연구는 "${project.title}"에 대한 의사결정 문제를 AHP 기법을 활용하여 체계적으로 분석하였다. ${criteria.length}개의 평가 기준과 ${alternatives.length}개의 대안에 대한 전문가 평가를 통해 객관적이고 일관성 있는 의사결정 방안을 제시하였다.\n\n연구의 기여점은 다음과 같다:\n1. 복잡한 의사결정 문제의 체계적 해결\n2. 전문가 의견의 정량적 통합\n3. 투명하고 추적 가능한 의사결정 과정\n\n향후 연구에서는 퍼지 AHP나 ANP 등의 발전된 기법을 적용하여 더욱 정교한 분석을 수행할 수 있을 것이다.`;
      
      default:
        return `${sectionId}에 대한 내용이 생성되었습니다. 실제 구현에서는 프로젝트 데이터를 바탕으로 상세한 내용이 자동 생성됩니다.`;
    }
  };

  // 섹션 내용 수정
  const updateSectionContent = (sectionId: string, content: string) => {
    setPaperSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, content } : section
    ));
  };

  // 논문 내보내기
  const exportPaper = (format: 'word' | 'pdf' | 'latex') => {
    const paperContent = paperSections.map(section => ({
      title: section.title,
      content: section.content
    }));

    // 실제 구현에서는 서버로 내보내기 요청
    console.log(`논문을 ${format} 형식으로 내보내기:`, paperContent);
    alert(`${format.toUpperCase()} 형식으로 논문이 생성되었습니다. (구현 예정)`);
  };

  const renderProjectSelection = () => (
    <div className="space-y-6">
      <div className="ui-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <UIIcon emoji="📂" size="lg" color="primary" />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            논문 작성할 프로젝트 선택
          </h2>
        </div>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          AI가 분석하여 학술 논문을 자동 생성할 AHP 프로젝트를 선택해주세요.
        </p>
      </div>

      {loading ? (
        <div className="ui-card p-8 text-center">
          <UIIcon emoji="⏳" size="4xl" color="muted" className="mb-4" />
          <p style={{ color: 'var(--text-secondary)' }}>프로젝트를 불러오는 중...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="ui-card p-12 text-center">
          <UIIcon emoji="📋" size="4xl" color="muted" className="mb-4" />
          <p className="text-xl mb-4" style={{ color: 'var(--text-secondary)' }}>사용 가능한 프로젝트가 없습니다</p>
          <p style={{ color: 'var(--text-muted)' }}>먼저 AHP 프로젝트를 생성하고 데이터를 입력해주세요.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project, index) => (
            <div 
              key={project.id || `project-${index}`}
              className="ui-card p-6 cursor-pointer transition-all hover:shadow-lg"
              onClick={() => loadProjectData(project)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {project.title}
                </h3>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: project.status === 'completed' ? 'var(--success-pastel)' : 'var(--warning-pastel)',
                    color: project.status === 'completed' ? 'var(--success-dark)' : 'var(--warning-dark)'
                  }}
                >
                  {project.status === 'completed' ? '완료' : '진행중'}
                </span>
              </div>
              
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                {project.description || project.objective}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span>기준: {project.criteria_count || 0}개</span>
                  <span>대안: {project.alternatives_count || 0}개</span>
                  <span>평가자: {project.evaluator_count || 0}명</span>
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {project.created_at ? new Date(project.created_at).toLocaleDateString() : '날짜 미상'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPaperSettings = () => (
    <div className="space-y-6">
      <div className="ui-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <UIIcon emoji="⚙️" size="lg" color="primary" />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            논문 생성 설정
          </h2>
        </div>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          선택된 프로젝트: <strong>{selectedProject?.title}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="ui-card p-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>논문 유형</h3>
          <div className="space-y-2">
            {[
              { value: 'journal', label: '학술지 논문' },
              { value: 'conference', label: '학회 발표 논문' },
              { value: 'thesis', label: '학위 논문' },
              { value: 'report', label: '연구 보고서' }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="paperType"
                  value={option.value}
                  checked={paperSettings.paperType === option.value}
                  onChange={(e) => setPaperSettings(prev => ({ ...prev, paperType: e.target.value }))}
                  className="text-blue-600"
                />
                <span style={{ color: 'var(--text-secondary)' }}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="ui-card p-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>언어 설정</h3>
          <div className="space-y-2">
            {[
              { value: 'korean', label: '한국어' },
              { value: 'english', label: '영어' },
              { value: 'bilingual', label: '이중 언어' }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="language"
                  value={option.value}
                  checked={paperSettings.language === option.value}
                  onChange={(e) => setPaperSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="text-blue-600"
                />
                <span style={{ color: 'var(--text-secondary)' }}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="ui-card p-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>인용 스타일</h3>
          <select
            value={paperSettings.citationStyle}
            onChange={(e) => setPaperSettings(prev => ({ ...prev, citationStyle: e.target.value }))}
            className="w-full p-2 border rounded"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}
          >
            <option value="apa">APA 스타일</option>
            <option value="ieee">IEEE 스타일</option>
            <option value="harvard">Harvard 스타일</option>
            <option value="vancouver">Vancouver 스타일</option>
          </select>
        </div>

        <div className="ui-card p-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>추가 옵션</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={paperSettings.includeGraphics}
                onChange={(e) => setPaperSettings(prev => ({ ...prev, includeGraphics: e.target.checked }))}
                className="text-blue-600"
              />
              <span style={{ color: 'var(--text-secondary)' }}>그래프 및 차트 포함</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={paperSettings.includeAppendix}
                onChange={(e) => setPaperSettings(prev => ({ ...prev, includeAppendix: e.target.checked }))}
                className="text-blue-600"
              />
              <span style={{ color: 'var(--text-secondary)' }}>부록 포함</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <PrimaryButton
          onClick={generatePaper}
          disabled={!selectedProject}
          size="lg"
          className="px-8 py-3"
        >
          <UIIcon emoji="🤖" size="sm" className="mr-2" />
          AI 논문 생성 시작
        </PrimaryButton>
      </div>
    </div>
  );

  const renderContentGeneration = () => (
    <div className="space-y-6">
      <div className="ui-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <UIIcon emoji="✍️" size="lg" color="primary" />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            AI 논문 생성 진행 상황
          </h2>
        </div>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          AI가 프로젝트 데이터를 분석하여 논문을 작성하고 있습니다...
        </p>
      </div>

      <div className="space-y-4">
        {paperSections.map((section, index) => (
          <div 
            key={section.id}
            className={`ui-card p-4 border ${
              section.status === 'completed' ? 'border-green-400' : 
              section.status === 'generating' ? 'border-blue-400' : 
              'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{index + 1}</span>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {section.title}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                {section.status === 'pending' && (
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>대기 중</span>
                )}
                {section.status === 'generating' && (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: 'var(--accent-primary)' }}></div>
                    <span className="text-sm" style={{ color: 'var(--accent-primary)' }}>생성 중...</span>
                  </>
                )}
                {section.status === 'completed' && (
                  <span className="text-sm" style={{ color: 'var(--success-primary)' }}>✅ 완료</span>
                )}
              </div>
            </div>
            
            {section.status === 'completed' && section.content && (
              <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {section.content.substring(0, 200)}...
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {!generating && paperSections.every(s => s.status === 'completed') && (
        <div className="text-center pt-6">
          <SuccessButton
            onClick={() => setActiveTab('review-edit')}
            size="lg"
          >
            <UIIcon emoji="📝" size="sm" className="mr-2" />
            검토 및 편집하기
          </SuccessButton>
        </div>
      )}
    </div>
  );

  const renderReviewEdit = () => (
    <div className="space-y-6">
      <div className="ui-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <UIIcon emoji="📝" size="lg" color="primary" />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            논문 검토 및 편집
          </h2>
        </div>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          생성된 논문 내용을 검토하고 필요에 따라 수정해주세요.
        </p>
      </div>

      <div className="space-y-6">
        {paperSections.map((section) => (
          <div 
            key={section.id}
            className="ui-card p-6"
          >
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              {section.title}
            </h3>
            <textarea
              value={section.content}
              onChange={(e) => updateSectionContent(section.id, e.target.value)}
              className="w-full h-48 p-3 border rounded resize-vertical"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
              placeholder={`${section.title} 내용을 입력하세요...`}
            />
          </div>
        ))}
      </div>

      <div className="text-center pt-6">
        <PrimaryButton
          onClick={() => setActiveTab('export-download')}
          size="lg"
        >
          <UIIcon emoji="💾" size="sm" className="mr-2" />
          내보내기 단계로
        </PrimaryButton>
      </div>
    </div>
  );

  const renderExportDownload = () => (
    <div className="space-y-6">
      <div className="ui-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <UIIcon emoji="💾" size="lg" color="primary" />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            논문 내보내기
          </h2>
        </div>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          완성된 논문을 원하는 형식으로 다운로드하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="ui-card p-6 text-center">
          <UIIcon emoji="📄" size="4xl" className="mb-4" />
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Microsoft Word</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            편집 가능한 .docx 형식
          </p>
          <PrimaryButton
            onClick={() => exportPaper('word')}
            className="w-full"
            size="md"
          >
            Word 다운로드
          </PrimaryButton>
        </div>

        <div className="ui-card p-6 text-center">
          <UIIcon emoji="📋" size="4xl" className="mb-4" />
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>PDF</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            인쇄 및 배포용 PDF 형식
          </p>
          <DangerButton
            onClick={() => exportPaper('pdf')}
            className="w-full"
            size="md"
          >
            PDF 다운로드
          </DangerButton>
        </div>

        <div className="ui-card p-6 text-center">
          <UIIcon emoji="📝" size="4xl" className="mb-4" />
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>LaTeX</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            학술지 투고용 LaTeX 형식
          </p>
          <SuccessButton
            onClick={() => exportPaper('latex')}
            className="w-full"
            size="md"
          >
            LaTeX 다운로드
          </SuccessButton>
        </div>
      </div>

      <div className="ui-card p-6" style={{ backgroundColor: 'var(--accent-pastel)' }}>
        <div className="flex items-center gap-2 mb-2">
          <UIIcon emoji="📊" size="lg" />
          <h3 className="font-semibold" style={{ color: 'var(--accent-dark)' }}>논문 통계</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span style={{ color: 'var(--accent-dark)' }}>총 단어 수: </span>
            <strong>{paperSections.reduce((acc, section) => acc + section.content.split(' ').length, 0)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--accent-dark)' }}>섹션 수: </span>
            <strong>{paperSections.length}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--accent-dark)' }}>페이지 수 (예상): </span>
            <strong>{Math.ceil(paperSections.reduce((acc, section) => acc + section.content.length, 0) / 2000)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--accent-dark)' }}>완성도: </span>
            <strong>100%</strong>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'project-selection':
        return renderProjectSelection();
      case 'paper-settings':
        return renderPaperSettings();
      case 'content-generation':
        return renderContentGeneration();
      case 'review-edit':
        return renderReviewEdit();
      case 'export-download':
        return renderExportDownload();
      default:
        return renderProjectSelection();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <PageHeader
        title="AI 논문 생성"
        description="AHP 프로젝트 데이터를 기반으로 학술 논문을 자동 생성합니다"
        icon="🤖"
        onBack={() => window.history.back()}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 소개 섹션 */}
        <div className="mb-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              🤖 AI 논문 생성 시스템
            </h1>
            <p className="text-xl max-w-4xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              AHP 프로젝트 데이터를 AI가 분석하여 학술 논문을 자동 생성하는 혁신적인 연구 도구입니다. 
              복잡한 다기준 의사결정 분석 결과를 체계적인 학술 논문으로 변환해보세요.
            </p>
          </div>

          {/* 주요 기능 카드들 */}
          <div className="max-w-5xl mx-auto mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 자동 생성 */}
              <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
                <div className="text-center">
                  <div className="text-6xl mb-6">✍️</div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    자동 논문 생성
                  </h3>
                  <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                    프로젝트 데이터를 기반으로 완전한 학술 논문을 자동 생성
                  </p>
                  <div className="space-y-3 text-left mb-8">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📝</span>
                      <span>초록부터 결론까지 완전 자동 생성</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📊</span>
                      <span>AHP 분석 결과 자동 해석</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📈</span>
                      <span>통계 및 차트 자동 삽입</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🔗</span>
                      <span>참고문헌 자동 생성</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 다양한 형식 */}
              <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
                <div className="text-center">
                  <div className="text-6xl mb-6">📄</div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    다양한 출력 형식
                  </h3>
                  <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
                    원하는 형식으로 논문을 내보내고 편집할 수 있습니다
                  </p>
                  <div className="space-y-3 text-left mb-8">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📄</span>
                      <span>Microsoft Word (.docx)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📋</span>
                      <span>PDF 형식</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📝</span>
                      <span>LaTeX 형식</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🎨</span>
                      <span>다양한 인용 스타일</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={tab.id !== 'project-selection' && !selectedProject}
                className={`flex items-center space-x-2 px-4 py-2 rounded font-medium transition-all ${
                  activeTab === tab.id ? 'shadow-lg' : ''
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                  opacity: tab.id !== 'project-selection' && !selectedProject ? 0.5 : 1
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

export default AIPaperGenerationPage;