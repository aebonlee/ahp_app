import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

interface SurveyLink {
  id: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorEmail: string;
  projectId: string;
  projectName: string;
  originalLink: string;
  shortLink: string;
  qrCode?: string;
  createdAt: string;
  expiresAt?: string;
  clickCount: number;
  lastAccessed?: string;
  status: 'active' | 'expired' | 'completed' | 'pending';
  shareMethod?: 'email' | 'sms' | 'kakao' | 'copy' | 'qr';
}

interface SurveyLinkManagerProps {
  projectId?: string;
  projectName?: string;
  evaluators?: any[];
}

const SurveyLinkManager: React.FC<SurveyLinkManagerProps> = ({
  projectId,
  projectName,
  evaluators = []
}) => {
  const [surveyLinks, setSurveyLinks] = useState<SurveyLink[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'completed' | 'pending'>('all');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState<SurveyLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkPrefix, setLinkPrefix] = useState('ahp.link/');
  const [expiryDays, setExpiryDays] = useState(30);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // 설문 링크 생성 함수
  const generateShortLink = (evaluatorId: string, projectId: string): string => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${linkPrefix}${code}`;
  };

  // QR 코드 생성 (실제로는 QR 라이브러리 사용)
  const generateQRCode = (link: string): string => {
    // 실제로는 qrcode.js 등의 라이브러리를 사용
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
  };

  // 초기 데이터 로드 또는 생성
  useEffect(() => {
    if (projectId && evaluators.length > 0) {
      generateLinksForEvaluators();
    } else {
      loadExistingLinks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, evaluators]);

  const generateLinksForEvaluators = () => {
    setLoading(true);
    const newLinks: SurveyLink[] = evaluators.map(evaluator => {
      const originalLink = `${window.location.origin}/?tab=evaluator-dashboard&project=${projectId}&evaluator=${evaluator.id}`;
      const shortLink = generateShortLink(evaluator.id, projectId || '');
      const fullShortLink = `https://${shortLink}`;
      
      return {
        id: `link-${evaluator.id}-${projectId}`,
        evaluatorId: evaluator.id,
        evaluatorName: evaluator.name,
        evaluatorEmail: evaluator.email,
        projectId: projectId || '',
        projectName: projectName || '',
        originalLink,
        shortLink: fullShortLink,
        qrCode: generateQRCode(fullShortLink),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
        clickCount: 0,
        status: 'active' as const
      };
    });

    setSurveyLinks(prevLinks => {
      // 기존 링크와 병합 (중복 제거)
      const existingIds = prevLinks.map(l => l.id);
      const uniqueNewLinks = (Array.isArray(newLinks) ? newLinks : []).filter(l => !existingIds.includes(l.id));
      return [...prevLinks, ...uniqueNewLinks];
    });
    setLoading(false);
  };

  const loadExistingLinks = async () => {
    // localStorage 제거됨 - API에서 링크 데이터 조회
    try {
      // TODO: 서버 API에서 설문 링크 목록 조회
      // const response = await fetch('/api/survey-links');
      // const links = await response.json();
      // setSurveyLinks(links);
      console.log('API에서 설문 링크 데이터 로드 예정');
    } catch (error) {
      console.error('API에서 링크 데이터 로드 실패:', error);
    }
  };

  // 링크 저장 (localStorage 제거)
  useEffect(() => {
    if (surveyLinks.length > 0) {
      // TODO: API로 서버에 링크 데이터 저장
      // saveSurveyLinksToAPI(surveyLinks);
      console.log('서버 API로 링크 데이터 저장 예정:', surveyLinks.length, '개');
    }
  }, [surveyLinks]);

  // 링크 복사
  const handleCopyLink = (link: string, linkId: string) => {
    navigator.clipboard.writeText(link);
    
    // 복사 통계 업데이트
    setSurveyLinks(prev => prev.map(l => 
      l.id === linkId 
        ? { ...l, shareMethod: 'copy' as const, lastAccessed: new Date().toISOString() }
        : l
    ));
    
    alert('링크가 클립보드에 복사되었습니다.');
  };

  // 이메일로 보내기
  const handleSendEmail = (link: SurveyLink) => {
    const subject = encodeURIComponent(`[${link.projectName}] AHP 평가 참여 요청`);
    const body = encodeURIComponent(`
안녕하세요 ${link.evaluatorName}님,

${link.projectName} 프로젝트의 AHP 평가에 참여해 주시기 바랍니다.

평가 링크: ${link.shortLink}

링크 유효기간: ${new Date(link.expiresAt || '').toLocaleDateString()}까지

감사합니다.
    `.trim());
    
    window.open(`mailto:${link.evaluatorEmail}?subject=${subject}&body=${body}`);
    
    // 이메일 통계 업데이트
    setSurveyLinks(prev => prev.map(l => 
      l.id === link.id 
        ? { ...l, shareMethod: 'email' as const }
        : l
    ));
  };

  // SMS로 보내기 (실제로는 SMS API 사용)
  const handleSendSMS = (link: SurveyLink) => {
    const message = `[AHP평가] ${link.projectName}\n평가링크: ${link.shortLink}`;
    // 실제로는 SMS API 호출
    console.log('SMS 발송:', message);
    alert(`SMS 발송 시뮬레이션:\n${message}`);
    
    setSurveyLinks(prev => prev.map(l => 
      l.id === link.id 
        ? { ...l, shareMethod: 'sms' as const }
        : l
    ));
  };

  // 카카오톡으로 보내기
  const handleSendKakao = (link: SurveyLink) => {
    // Kakao SDK를 사용한 실제 구현
    const kakaoLink = `https://talk-apps.kakao.com/scheme/kakaotalk://msg/text/${encodeURIComponent(`[${link.projectName}] AHP 평가 링크\n${link.shortLink}`)}`;
    window.open(kakaoLink);
    
    setSurveyLinks(prev => prev.map(l => 
      l.id === link.id 
        ? { ...l, shareMethod: 'kakao' as const }
        : l
    ));
  };

  // QR 코드 표시
  const handleShowQR = (link: SurveyLink) => {
    setSelectedQR(link);
    setShowQRModal(true);
  };

  // 링크 재생성
  const handleRegenerateLink = (linkId: string) => {
    setSurveyLinks(prev => prev.map(l => {
      if (l.id === linkId) {
        const newShortLink = generateShortLink(l.evaluatorId, l.projectId);
        const fullShortLink = `https://${newShortLink}`;
        return {
          ...l,
          shortLink: fullShortLink,
          qrCode: generateQRCode(fullShortLink),
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
          clickCount: 0
        };
      }
      return l;
    }));
  };

  // 만료 기간 연장
  const handleExtendExpiry = (linkId: string) => {
    setSurveyLinks(prev => prev.map(l => 
      l.id === linkId 
        ? { ...l, expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(), status: 'active' as const }
        : l
    ));
  };

  // 대량 작업
  const handleBulkCopy = () => {
    const selectedLinkTexts = surveyLinks
      .filter(l => selectedLinks.includes(l.id))
      .map(l => `${l.evaluatorName}: ${l.shortLink}`)
      .join('\n');
    
    navigator.clipboard.writeText(selectedLinkTexts);
    alert(`${selectedLinks.length}개의 링크가 복사되었습니다.`);
    setSelectedLinks([]);
  };

  const handleBulkEmail = () => {
    const selectedSurveyLinks = surveyLinks.filter(l => selectedLinks.includes(l.id));
    selectedSurveyLinks.forEach(link => handleSendEmail(link));
    setSelectedLinks([]);
  };

  // 필터링된 링크
  const filteredLinks = (Array.isArray(surveyLinks) ? surveyLinks : [])
    .filter(link => {
      const matchesSearch = 
        link.evaluatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.evaluatorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || link.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 통계 계산
  const safeLinks = Array.isArray(surveyLinks) ? surveyLinks : [];
  const stats = {
    total: safeLinks.length,
    active: safeLinks.filter(l => l.status === 'active').length,
    completed: safeLinks.filter(l => l.status === 'completed').length,
    expired: safeLinks.filter(l => l.status === 'expired').length,
    totalClicks: safeLinks.reduce((sum, l) => sum + l.clickCount, 0)
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">설문 링크 관리</h2>
        <p className="mt-1 text-sm text-gray-600">
          평가자별 설문 링크를 생성하고 관리합니다. 단축 URL과 QR 코드를 통해 쉽게 공유할 수 있습니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-700">전체 링크</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-green-700">활성 링크</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.completed}</div>
            <div className="text-sm text-purple-700">완료됨</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
            <div className="text-sm text-red-700">만료됨</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{stats.totalClicks}</div>
            <div className="text-sm text-indigo-700">총 클릭수</div>
          </div>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              id="search"
              placeholder="평가자명, 이메일, 프로젝트명으로 검색..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="pending">대기중</option>
            <option value="completed">완료</option>
            <option value="expired">만료</option>
          </select>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowBulkActions(!showBulkActions)}
              disabled={selectedLinks.length === 0}
            >
              대량 작업 ({selectedLinks.length})
            </Button>
            <Button
              variant="primary"
              onClick={generateLinksForEvaluators}
              disabled={loading}
            >
              {loading ? '생성 중...' : '링크 일괄 생성'}
            </Button>
          </div>
        </div>

        {/* 대량 작업 메뉴 */}
        {showBulkActions && selectedLinks.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleBulkCopy}>
              📋 일괄 복사
            </Button>
            <Button variant="secondary" size="sm" onClick={handleBulkEmail}>
              📧 일괄 이메일
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSelectedLinks([])}>
              ✖ 선택 해제
            </Button>
          </div>
        )}
      </Card>

      {/* 링크 테이블 */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={selectedLinks.length === filteredLinks.length && filteredLinks.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLinks(filteredLinks.map(l => l.id));
                      } else {
                        setSelectedLinks([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  평가자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  프로젝트
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  단축 링크
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  클릭수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  만료일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLinks.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={selectedLinks.includes(link.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLinks([...selectedLinks, link.id]);
                        } else {
                          setSelectedLinks(selectedLinks.filter(id => id !== link.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{link.evaluatorName}</div>
                      <div className="text-xs text-gray-500">{link.evaluatorEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{link.projectName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {link.shortLink.replace('https://', '')}
                      </code>
                      <button
                        onClick={() => handleCopyLink(link.shortLink, link.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="복사"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      link.status === 'active' ? 'bg-green-100 text-green-800' :
                      link.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      link.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {link.status === 'active' ? '활성' :
                       link.status === 'completed' ? '완료' :
                       link.status === 'expired' ? '만료' :
                       '대기중'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{link.clickCount}</div>
                    {link.lastAccessed && (
                      <div className="text-xs text-gray-500">
                        최근: {new Date(link.lastAccessed).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : '무제한'}
                    </div>
                    {link.status === 'expired' && (
                      <button
                        onClick={() => handleExtendExpiry(link.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        연장
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleSendEmail(link)}
                        className="text-gray-600 hover:text-blue-600"
                        title="이메일"
                      >
                        📧
                      </button>
                      <button
                        onClick={() => handleSendSMS(link)}
                        className="text-gray-600 hover:text-green-600"
                        title="SMS"
                      >
                        💬
                      </button>
                      <button
                        onClick={() => handleSendKakao(link)}
                        className="text-gray-600 hover:text-yellow-600"
                        title="카카오톡"
                      >
                        💛
                      </button>
                      <button
                        onClick={() => handleShowQR(link)}
                        className="text-gray-600 hover:text-purple-600"
                        title="QR 코드"
                      >
                        📱
                      </button>
                      <button
                        onClick={() => handleRegenerateLink(link.id)}
                        className="text-gray-600 hover:text-orange-600"
                        title="재생성"
                      >
                        🔄
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLinks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>생성된 링크가 없습니다.</p>
            <p className="text-sm mt-2">평가자를 추가한 후 '링크 일괄 생성' 버튼을 클릭하세요.</p>
          </div>
        )}
      </Card>

      {/* QR 코드 모달 */}
      {showQRModal && selectedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">QR 코드</h3>
            <div className="text-center">
              <img
                src={selectedQR.qrCode}
                alt="QR Code"
                className="mx-auto mb-4"
              />
              <p className="text-sm text-gray-600 mb-2">{selectedQR.evaluatorName}</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-4">
                {selectedQR.shortLink}
              </code>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedQR.qrCode || '';
                    link.download = `qr-${selectedQR.evaluatorName}-${selectedQR.projectName}.png`;
                    link.click();
                  }}
                >
                  다운로드
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowQRModal(false);
                    setSelectedQR(null);
                  }}
                >
                  닫기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 설정 패널 */}
      <Card className="bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-4">링크 설정</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              링크 접두사
            </label>
            <Input
              id="linkPrefix"
              value={linkPrefix}
              onChange={setLinkPrefix}
              placeholder="ahp.link/"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              유효 기간 (일)
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value) || 30)}
              min="1"
              max="365"
            />
          </div>
        </div>
      </Card>

      {/* 도움말 */}
      <Card className="bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">설문 링크 관리 가이드</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 각 평가자별로 고유한 단축 링크가 생성됩니다.</li>
          <li>• 이메일, SMS, 카카오톡, QR 코드 등 다양한 방법으로 공유할 수 있습니다.</li>
          <li>• 링크 클릭 수와 최근 접속 시간을 추적할 수 있습니다.</li>
          <li>• 만료된 링크는 연장하거나 재생성할 수 있습니다.</li>
          <li>• 대량 선택으로 여러 링크를 한 번에 관리할 수 있습니다.</li>
        </ul>
      </Card>
    </div>
  );
};

export default SurveyLinkManager;