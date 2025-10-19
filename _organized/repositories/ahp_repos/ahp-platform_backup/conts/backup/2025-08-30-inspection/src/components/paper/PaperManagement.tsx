import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

interface Reference {
  id: string;
  type: 'journal' | 'conference' | 'book' | 'website' | 'thesis';
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
  location?: string;
  notes?: string;
  tags: string[];
  citationStyle: 'APA' | 'MLA' | 'Chicago' | 'IEEE';
  createdAt: string;
}

interface AHPResultContent {
  id: string;
  projectId: string;
  projectTitle: string;
  resultType: 'criteria' | 'alternatives' | 'comparison' | 'final';
  content: string;
  description: string;
  methodology: string;
  figures: string[];
  tables: string[];
  createdAt: string;
}


const PaperManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'references' | 'results' | 'writing' | 'generator'>('references');
  const [references, setReferences] = useState<Reference[]>([]);
  const [ahpResults, setAhpResults] = useState<AHPResultContent[]>([]);
  const [showAddReference, setShowAddReference] = useState(false);
  const [newReference, setNewReference] = useState<Partial<Reference>>({
    type: 'journal',
    citationStyle: 'APA',
    authors: [],
    tags: []
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 데모 데이터 로드
  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    // 샘플 참고문헌 데이터
    const demoReferences: Reference[] = [
      {
        id: '1',
        type: 'journal',
        title: 'The Analytic Hierarchy Process: Planning, Priority Setting, Resource Allocation',
        authors: ['Saaty, T. L.'],
        year: 1980,
        journal: 'European Journal of Operational Research',
        volume: '9',
        issue: '1',
        pages: '90-93',
        doi: '10.1016/0377-2217(82)90022-4',
        tags: ['AHP', 'Decision Making', 'Multi-criteria'],
        citationStyle: 'APA',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'journal',
        title: 'Applications of the analytic hierarchy process in engineering',
        authors: ['Vargas, L. G.'],
        year: 1990,
        journal: 'Mathematical and Computer Modelling',
        volume: '13',
        issue: '7',
        pages: '1-9',
        doi: '10.1016/0895-7177(90)90002-9',
        tags: ['AHP', 'Engineering', 'Applications'],
        citationStyle: 'APA',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        type: 'conference',
        title: 'AI-Powered Decision Support Systems: A Comparative Analysis',
        authors: ['Kim, J. H.', 'Lee, S. M.'],
        year: 2023,
        journal: 'Proceedings of the International Conference on AI',
        pages: '123-135',
        tags: ['AI', 'Decision Support', 'Comparison'],
        citationStyle: 'APA',
        createdAt: new Date().toISOString()
      }
    ];

    // 샘플 AHP 결과 데이터
    const demoResults: AHPResultContent[] = [
      {
        id: '1',
        projectId: 'demo-project-1',
        projectTitle: 'AI 개발 활용 방안 분석',
        resultType: 'criteria',
        content: '본 연구에서는 AI 개발 도구 선택을 위한 평가 기준으로 성능(0.45), 비용(0.30), 사용성(0.25)을 설정하였다.',
        description: '평가 기준 계층구조 및 가중치',
        methodology: 'AHP 기법을 사용하여 전문가 10명의 쌍대비교를 통해 기준별 가중치를 도출하였다.',
        figures: ['criteria_hierarchy.png', 'weight_distribution.png'],
        tables: ['Table 1: 평가 기준별 가중치'],
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        projectId: 'demo-project-1',
        projectTitle: 'AI 개발 활용 방안 분석',
        resultType: 'final',
        content: '종합 분석 결과, GPT-4(0.42), Claude(0.37), Gemini(0.21) 순으로 평가되었다. 성능 기준에서 GPT-4가 가장 높은 점수를 받았으며, 비용 대비 효율성에서는 Claude가 우수한 것으로 나타났다.',
        description: '최종 대안 순위 및 종합 점수',
        methodology: '계층구조 분석을 통해 각 대안의 종합 점수를 계산하고 일관성 비율(CR < 0.1)을 확인하였다.',
        figures: ['final_ranking.png', 'sensitivity_analysis.png'],
        tables: ['Table 2: 대안별 종합 점수', 'Table 3: 민감도 분석 결과'],
        createdAt: new Date().toISOString()
      }
    ];

    setReferences(demoReferences);
    setAhpResults(demoResults);
  };

  const formatCitation = (ref: Reference): string => {
    const authors = ref.authors.join(', ');
    const year = ref.year;
    
    switch (ref.citationStyle) {
      case 'APA':
        if (ref.type === 'journal') {
          return `${authors} (${year}). ${ref.title}. *${ref.journal}*, ${ref.volume}${ref.issue ? `(${ref.issue})` : ''}, ${ref.pages}. ${ref.doi ? `https://doi.org/${ref.doi}` : ''}`;
        }
        break;
      case 'IEEE':
        if (ref.type === 'journal') {
          return `${authors}, "${ref.title}," *${ref.journal}*, vol. ${ref.volume}, no. ${ref.issue}, pp. ${ref.pages}, ${year}.`;
        }
        break;
      default:
        return `${authors} (${year}). ${ref.title}. ${ref.journal}.`;
    }
    return `${authors} (${year}). ${ref.title}.`;
  };

  const generateAIContent = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // OpenAI API 호출 시뮬레이션 (실제 구현 시 backend 필요)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 샘플 AI 응답
      const sampleResponse = `
## AHP 방법론 섹션 예시

### 3.1 연구 방법론

본 연구에서는 Saaty(1980)가 제안한 분석적 계층화 과정(Analytic Hierarchy Process, AHP)을 활용하여 AI 개발 도구 선택 문제를 해결하였다. AHP는 복잡한 의사결정 문제를 계층적으로 구조화하여 정량적 분석을 가능하게 하는 다기준 의사결정 기법이다.

### 3.2 계층구조 설계

전문가 10명의 의견을 수렴하여 다음과 같은 3단계 계층구조를 설계하였다:

**목표 계층**: AI 개발 도구 최적 선택
**기준 계층**: 성능(Performance), 비용(Cost), 사용성(Usability)
**대안 계층**: GPT-4, Claude, Gemini

### 3.3 쌍대비교 및 가중치 도출

각 계층에서 요소 간 쌍대비교를 수행하였으며, Saaty의 9점 척도를 사용하여 중요도를 평가하였다. 일관성 비율(Consistency Ratio, CR)이 0.1 미만인 응답만을 분석에 포함하였다.

**참고문헌 인용 예시**:
- Saaty, T. L. (1980). The Analytic Hierarchy Process: Planning, Priority Setting, Resource Allocation. *European Journal of Operational Research*, 9(1), 90-93.
- Vargas, L. G. (1990). Applications of the analytic hierarchy process in engineering. *Mathematical and Computer Modelling*, 13(7), 1-9.
      `;
      
      setAiResponse(sampleResponse);
    } catch (error) {
      console.error('AI 생성 오류:', error);
      setAiResponse('AI 컨텐츠 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addReference = () => {
    if (!newReference.title || !newReference.authors?.length) return;
    
    const reference: Reference = {
      id: Date.now().toString(),
      type: newReference.type || 'journal',
      title: newReference.title,
      authors: newReference.authors,
      year: newReference.year || new Date().getFullYear(),
      journal: newReference.journal,
      volume: newReference.volume,
      issue: newReference.issue,
      pages: newReference.pages,
      doi: newReference.doi,
      url: newReference.url,
      tags: newReference.tags || [],
      citationStyle: newReference.citationStyle || 'APA',
      createdAt: new Date().toISOString()
    };
    
    setReferences(prev => [...prev, reference]);
    setNewReference({ type: 'journal', citationStyle: 'APA', authors: [], tags: [] });
    setShowAddReference(false);
  };

  const deleteReference = (id: string) => {
    if (window.confirm('이 참고문헌을 삭제하시겠습니까?')) {
      setReferences(prev => prev.filter(ref => ref.id !== id));
    }
  };

  const renderReferenceForm = () => (
    <Card title="새 참고문헌 추가">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">문헌 유형</label>
            <select
              value={newReference.type}
              onChange={(e) => setNewReference(prev => ({ ...prev, type: e.target.value as Reference['type'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="journal">학술지 논문</option>
              <option value="conference">학회 발표</option>
              <option value="book">도서</option>
              <option value="website">웹사이트</option>
              <option value="thesis">학위논문</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">인용 스타일</label>
            <select
              value={newReference.citationStyle}
              onChange={(e) => setNewReference(prev => ({ ...prev, citationStyle: e.target.value as Reference['citationStyle'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="APA">APA</option>
              <option value="MLA">MLA</option>
              <option value="Chicago">Chicago</option>
              <option value="IEEE">IEEE</option>
            </select>
          </div>
        </div>

        <Input
          id="title"
          label="제목"
          placeholder="논문 또는 자료 제목"
          value={newReference.title || ''}
          onChange={(value) => setNewReference(prev => ({ ...prev, title: value }))}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">저자 (쉼표로 구분)</label>
          <input
            type="text"
            placeholder="홍길동, 김철수, Smith, J."
            value={newReference.authors?.join(', ') || ''}
            onChange={(e) => setNewReference(prev => ({ 
              ...prev, 
              authors: e.target.value.split(',').map(a => a.trim()).filter(a => a)
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            id="year"
            label="발행년도"
            type="number"
            placeholder="2023"
            value={newReference.year?.toString() || ''}
            onChange={(value) => setNewReference(prev => ({ ...prev, year: parseInt(value) || new Date().getFullYear() }))}
          />

          <Input
            id="journal"
            label="학술지명"
            placeholder="Journal of AI Research"
            value={newReference.journal || ''}
            onChange={(value) => setNewReference(prev => ({ ...prev, journal: value }))}
          />

          <Input
            id="doi"
            label="DOI"
            placeholder="10.1000/182"
            value={newReference.doi || ''}
            onChange={(value) => setNewReference(prev => ({ ...prev, doi: value }))}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowAddReference(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={addReference}>
            추가
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderReferencesTab = () => (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">📚 참고문헌 관리 ({references.length}개)</h3>
          <Button variant="primary" onClick={() => setShowAddReference(true)}>
            ➕ 참고문헌 추가
          </Button>
        </div>

        {showAddReference && renderReferenceForm()}

        <div className="space-y-4 mt-6">
          {references.map((ref) => (
            <div key={ref.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {ref.type}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {ref.citationStyle}
                    </span>
                    {ref.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{ref.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {ref.authors.join(', ')} ({ref.year})
                  </p>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    {formatCitation(ref)}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteReference(ref.id)}
                  className="text-red-600 border-red-300 hover:bg-red-50 ml-4"
                >
                  🗑️
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderResultsTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">📊 AHP 분석 결과 정리 ({ahpResults.length}개)</h3>
        
        <div className="space-y-4">
          {ahpResults.map((result) => (
            <div key={result.id} className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  {result.resultType}
                </span>
                <span className="text-sm text-gray-600">{result.projectTitle}</span>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-2">{result.description}</h4>
              
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                <p className="text-sm text-blue-900 font-medium mb-1">논문 인용 텍스트:</p>
                <p className="text-sm text-blue-800">{result.content}</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                <p className="text-sm text-green-900 font-medium mb-1">방법론 설명:</p>
                <p className="text-sm text-green-800">{result.methodology}</p>
              </div>
              
              {result.figures.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-600 font-medium">관련 그림:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.figures.map((figure, idx) => (
                      <span key={idx} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {figure}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {result.tables.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 font-medium">관련 표:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.tables.map((table, idx) => (
                      <span key={idx} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        {table}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAIGeneratorTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">🤖 AI 논문 작성 도우미</h3>
        <p className="text-gray-600 mb-4">
          AHP 분석 결과를 바탕으로 논문의 특정 섹션을 생성하거나 개선할 수 있습니다.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              요청사항 (예: "방법론 섹션 작성", "결과 해석 도움", "참고문헌 정리")
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="예: AHP 방법론을 사용한 AI 도구 선택 연구의 방법론 섹션을 작성해주세요. 계층구조 설계와 쌍대비교 과정을 포함해주세요."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
          </div>
          
          <Button 
            variant="primary" 
            onClick={generateAIContent}
            disabled={!aiPrompt.trim() || isGenerating}
          >
            {isGenerating ? '생성 중...' : '🚀 AI 컨텐츠 생성'}
          </Button>
          
          {aiResponse && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">생성된 컨텐츠</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(aiResponse)}
                >
                  📋 복사
                </Button>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                  {aiResponse}
                </pre>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold mb-4">💡 AI 활용 팁</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">효과적인 프롬프트 예시:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• "AHP 방법론 섹션을 학술적 톤으로 작성"</li>
              <li>• "결과 해석에 통계적 유의성 포함"</li>
              <li>• "참고문헌을 APA 스타일로 정리"</li>
              <li>• "제한사항 섹션에 AHP의 한계점 포함"</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">주의사항:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 생성된 내용은 반드시 검토 후 사용</li>
              <li>• 표절 검사 도구로 중복 확인 필요</li>
              <li>• 전문가 검토 및 사실 확인 권장</li>
              <li>• 학술지별 투고 규정 준수 확인</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'references', label: '📚 참고문헌', desc: '문헌 관리 및 인용' },
              { id: 'results', label: '📊 결과 정리', desc: 'AHP 분석 결과 인용' },
              { id: 'generator', label: '🤖 AI 도우미', desc: '논문 작성 지원' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div>{tab.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{tab.desc}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* 탭 컨텐츠 */}
      {activeTab === 'references' && renderReferencesTab()}
      {activeTab === 'results' && renderResultsTab()}
      {activeTab === 'generator' && renderAIGeneratorTab()}
    </div>
  );
};

export default PaperManagement;