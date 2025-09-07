import React from 'react';

interface HelpModalProps {
  isVisible: boolean;
  onClose: () => void;
  helpType: 'getting-started' | 'project-status' | 'model-building' | 'evaluation-methods';
}

const HelpModal: React.FC<HelpModalProps> = ({ isVisible, onClose, helpType }) => {
  if (!isVisible) return null;

  const getHelpContent = () => {
    switch (helpType) {
      case 'getting-started':
        return {
          title: '시작하기',
          content: (
            <div className="space-y-4">
              <p>'시작하기'를 활용하여 새로운 프로젝트를 추가하거나, 기존 프로젝트를 선택하여 관리/수정/삭제를 할 수 있습니다.</p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">프로젝트 관리 과정</h4>
                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                  <li><strong>프로젝트 생성:</strong> 의사결정 목표와 평가 방법을 설정합니다.</li>
                  <li><strong>모델 구축:</strong> 기준과 대안을 정의하고 계층구조를 만듭니다.</li>
                  <li><strong>평가자 배정:</strong> 평가에 참여할 사람들을 초대합니다.</li>
                  <li><strong>평가 진행:</strong> 쌍대비교 또는 직접입력 방식으로 평가를 수행합니다.</li>
                  <li><strong>결과 분석:</strong> 최종 우선순위와 일관성을 확인합니다.</li>
                </ol>
              </div>
            </div>
          )
        };

      case 'project-status':
        return {
          title: '프로젝트의 상태',
          content: (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="border-l-4 border-gray-400 bg-gray-50 p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">🔨 생성중</h4>
                  <p className="text-gray-700">의사결정 모델 구성요소(기준, 대안) 및 평가자를 구성 중인 상태입니다.</p>
                  <p className="text-sm text-gray-600 mt-1">이 단계에서는 프로젝트 정보, 기준, 대안을 자유롭게 수정할 수 있습니다.</p>
                </div>

                <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">⏳ 대기중</h4>
                  <p className="text-yellow-700">의사결정 모델을 완료한 상태로 평가자 배정을 할 수 있습니다. 평가가 시작되기 전 단계입니다.</p>
                  <p className="text-sm text-yellow-600 mt-1">모델이 완성되었고, 평가자를 배정하여 평가를 시작할 준비가 된 상태입니다.</p>
                </div>

                <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">⚡ 평가중</h4>
                  <p className="text-blue-700">의사결정 모델이 완료된 후 평가가 진행 중인 상태입니다. 모델을 수정할 수도 있는데 이 경우 현재까지 평가된 데이터는 삭제됩니다.</p>
                  <p className="text-sm text-blue-600 mt-1">평가자들이 실제 평가를 수행하고 있는 단계입니다.</p>
                </div>

                <div className="border-l-4 border-green-400 bg-green-50 p-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ 평가종료</h4>
                  <p className="text-green-700">평가자들의 평가를 종료시킨 상태로 더이상 평가를 진행 할 수 없으며 결과 확인만 할 수 있습니다.</p>
                  <p className="text-sm text-green-600 mt-1">모든 평가가 완료되어 최종 결과를 확인하고 분석할 수 있는 단계입니다.</p>
                </div>
              </div>
            </div>
          )
        };

      case 'model-building':
        return {
          title: '모델 구축',
          content: (
            <div className="space-y-4">
              <p>AHP 분석을 위한 계층구조 모델을 구축하는 단계입니다.</p>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">🏗️ 모델 구축 단계</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <div>
                      <strong>목표 설정:</strong> 의사결정의 최종 목표를 명확히 정의합니다.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <div>
                      <strong>기준 설정:</strong> 대안을 평가할 기준들을 정의하고 계층구조를 만듭니다.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <div>
                      <strong>대안 정의:</strong> 비교하고 선택할 대안들을 등록합니다.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <div>
                      <strong>모델 검증:</strong> 계층구조가 올바르게 구성되었는지 확인합니다.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-2">⚠️ 주의사항</h4>
                <ul className="list-disc list-inside space-y-1 text-amber-800 text-sm">
                  <li>기준은 3~7개 정도가 적당합니다 (인간의 인지 한계 고려)</li>
                  <li>대안은 2~9개 범위에서 설정하는 것이 좋습니다</li>
                  <li>기준과 대안은 서로 독립적이어야 합니다</li>
                  <li>평가 시작 후 모델 수정 시 기존 평가 데이터가 삭제됩니다</li>
                </ul>
              </div>
            </div>
          )
        };

      case 'evaluation-methods':
        return {
          title: '평가 방법 설정',
          content: (
            <div className="space-y-4">
              <p>1차 기준들에 대한 평가 방법을 설정합니다. <strong className="text-red-600">기본 설정은 쌍대비교-실용</strong>입니다.</p>
              
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">🎯 쌍대비교-실용 (권장)</h4>
                  <p className="text-green-700 mb-2">필요한 <strong className="text-red-600">최소한의 쌍대비교를 실시</strong>하여 상대적 중요도(Priority)를 도출합니다.</p>
                  <div className="bg-green-100 p-3 rounded">
                    <p className="text-green-800 text-sm"><strong>✅ 실무에 활용시 적합</strong></p>
                    <p className="text-green-700 text-sm">대부분의 경우 '쌍대비교-실용'의 활용을 추천합니다.</p>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">📊 직접입력</h4>
                  <p className="text-orange-700 mb-2">데이터가 있는 경우 <strong className="text-red-600">데이터를 입력</strong>함으로써 이를 기준으로 중요도(Priority)를 도출합니다.</p>
                  <div className="bg-orange-100 p-3 rounded">
                    <p className="text-orange-700 text-sm">💡 데이터가 있는 경우에도 쌍대비교가 더 바람직할 수 있습니다.</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">🔬 쌍대비교-이론</h4>
                  <p className="text-blue-700 mb-2">이론상 필요한 <strong className="text-red-600">모든 쌍대비교를 실시</strong>하여 상대적 중요도(Priority)를 도출합니다.</p>
                  <div className="bg-blue-100 p-3 rounded">
                    <p className="text-blue-800 text-sm"><strong>📝 논문작성의 경우에 적합</strong></p>
                    <p className="text-blue-700 text-sm">학술적 연구나 엄밀한 분석이 필요한 경우 사용합니다.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        };

      default:
        return { title: '도움말', content: <p>도움말 내용을 불러올 수 없습니다.</p> };
    }
  };

  const { title, content } = getHelpContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="text-2xl mr-2">❓</span>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {content}
        </div>
        
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;