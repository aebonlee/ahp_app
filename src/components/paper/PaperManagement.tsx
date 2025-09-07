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
  const [activeTab, setActiveTab] = useState<'references' | 'results' | 'surveys' | 'writing' | 'generator'>('references');
  const [references, setReferences] = useState<Reference[]>([]);
  const [ahpResults, setAhpResults] = useState<AHPResultContent[]>([]);
  const [surveyData, setSurveyData] = useState<any[]>([]);
  const [surveyAnalytics, setSurveyAnalytics] = useState<any>({});
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
      
      setAiResponse('AI 문서 생성 기능은 준비 중입니다. 백엔드 API 연동을 완료한 후 사용 가능합니다.');
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

        {references.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📚</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">참고문헌이 없습니다</h4>
            <p className="text-gray-500 mb-6">논문 작성에 필요한 참고문헌을 추가해주세요</p>
            <Button variant="primary" onClick={() => setShowAddReference(true)}>
              첫 번째 참고문헌 추가하기
            </Button>
          </div>
        ) : (
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
        )}
      </Card>
    </div>
  );

  const renderResultsTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">📊 AHP 분석 결과 정리 ({ahpResults.length}개)</h3>
        
        {ahpResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">분석 결과가 없습니다</h4>
            <p className="text-gray-500 mb-6">완료된 AHP 프로젝트의 분석 결과를 논문에 활용할 수 있습니다</p>
            <Button variant="outline" onClick={() => alert('AHP 프로젝트를 먼저 완료해주세요')}>
              프로젝트 관리로 이동
            </Button>
          </div>
        ) : (
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
        )}
      </Card>
    </div>
  );

  const renderSurveyResultsTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">📋 설문조사 결과 분석</h3>
        <p className="text-gray-600 mb-6">
          인구통계학적 설문조사 응답 결과를 테이블, 차트, 그래프 형태로 분석하여 논문 작성에 활용할 수 있습니다.
        </p>

        {/* 빈 상태 메시지 */}
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">설문조사 결과가 없습니다</h4>
          <p className="text-gray-500 mb-6">인구통계학적 설문조사를 먼저 실시하고 응답을 수집해주세요</p>
          <Button variant="outline" onClick={() => alert('인구통계 설문조사 기능을 먼저 이용해주세요')}>
            설문조사 관리로 이동
          </Button>
        </div>

      </Card>
    </div>
  );

  const loadSurveyResults = (surveyType: string) => {
    // TODO: 실제 API에서 설문조사 응답 데이터 로드
    const mockData = Array.from({ length: 42 }, (_, i) => ({
      id: i + 1,
      age: ['20-29', '30-39', '40-49', '50+'][Math.floor(Math.random() * 4)],
      gender: Math.random() > 0.5 ? '남성' : '여성',
      education: ['고졸', '대졸', '대학원졸'][Math.floor(Math.random() * 3)],
      experience: ['5년미만', '5-10년', '10년이상'][Math.floor(Math.random() * 3)]
    }));
    setSurveyData(mockData);
  };

  const exportSurveyData = (format: string) => {
    alert(`${format.toUpperCase()} 형식 다운로드 기능은 준비 중입니다.`);
  };

  const generateReportPDF = () => {
    alert('분석 보고서 PDF 생성 기능은 준비 중입니다.');
  };

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
          <nav className="-mb-px flex flex-wrap gap-4">
            {[
              { id: 'references', label: '📚 참고문헌', desc: '문헌 관리 및 인용' },
              { id: 'results', label: '📊 결과 정리', desc: 'AHP 분석 결과 인용' },
              { id: 'surveys', label: '📋 설문조사 결과', desc: '인구통계학적 분석' },
              { id: 'generator', label: '🤖 AI 도우미', desc: '논문 작성 지원' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-0 py-6 px-6 border-b-3 font-semibold text-base rounded-t-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-700 bg-blue-50 shadow-sm'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg">{tab.label}</div>
                  <div className="text-sm text-gray-500 mt-2 font-normal">{tab.desc}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* 탭 컨텐츠 */}
      {activeTab === 'references' && renderReferencesTab()}
      {activeTab === 'results' && renderResultsTab()}
      {activeTab === 'surveys' && renderSurveyResultsTab()}
      {activeTab === 'generator' && renderAIGeneratorTab()}
    </div>
  );
};

export default PaperManagement;