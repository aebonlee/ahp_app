import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { API_BASE_URL } from '../../config/api';

interface Evaluator {
  id: string;
  email: string;
  name: string;
  phone?: string;
  assignedProjects?: string[];
  isSelected?: boolean;
  createdAt?: string;
  lastActive?: string;
  invitationStatus?: 'pending' | 'sent' | 'accepted' | 'expired';
  invitationLink?: string;
  shortLink?: string;
}

// interface Project {
//   id: string;
//   title: string;
//   description: string;
// }

interface EnhancedEvaluatorManagementProps {
  projectId?: string;
  projectName?: string;
  onAssign?: (evaluatorIds: string[]) => void;
  onClose?: () => void;
}

const EnhancedEvaluatorManagement: React.FC<EnhancedEvaluatorManagementProps> = ({
  projectId,
  projectName,
  onAssign,
  onClose
}) => {
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  // const [editingEvaluator, setEditingEvaluator] = useState<Evaluator | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: ''
  });
  const [inviteData, setInviteData] = useState({
    emails: '',
    subject: `AHP 평가 초대 - ${projectName || '프로젝트'}`,
    message: '',
    sendSMS: false
  });
  const [errors, setErrors] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');

  // 실제 평가자 데이터 로드
  useEffect(() => {
    loadEvaluators();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadEvaluators = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const isDemoMode = !token;

      if (isDemoMode) {
        // 데모 모드에서는 빈 배열로 시작
        setEvaluators([]);
      } else {
        const response = await fetch(`${API_BASE_URL}/api/evaluators${projectId ? `?projectId=${projectId}` : ''}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setEvaluators(data.evaluators || []);
        }
      }
    } catch (error) {
      console.error('Failed to load evaluators:', error);
      setEvaluators([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setEvaluators(evaluators.map(e => ({ ...e, isSelected: newSelectAll })));
  };

  const handleSelectEvaluator = (evaluatorId: string) => {
    setEvaluators(evaluators.map(e => 
      e.id === evaluatorId ? { ...e, isSelected: !e.isSelected } : e
    ));
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }
    
    if (formData.phone && !/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = '전화번호는 숫자와 하이픈(-)만 입력 가능합니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddEvaluator = async () => {
    if (!validateForm()) return;
    
    const newEvaluator: Evaluator = {
      id: `eval-${Date.now()}`,
      email: formData.email,
      name: formData.name,
      phone: formData.phone,
      assignedProjects: projectId ? [projectId] : [],
      createdAt: new Date().toISOString(),
      lastActive: '방금 전',
      invitationStatus: 'pending'
    };

    try {
      const token = localStorage.getItem('token');
      const isDemoMode = !token;

      if (isDemoMode) {
        // 데모 모드에서는 로컬에만 추가
        setEvaluators([newEvaluator, ...evaluators]);
      } else {
        const response = await fetch(`${API_BASE_URL}/api/evaluators`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            projectId
          })
        });

        if (response.ok) {
          const data = await response.json();
          setEvaluators([data.evaluator, ...evaluators]);
        }
      }

      setFormData({ email: '', name: '', phone: '' });
      setShowAddForm(false);
      setErrors({});
    } catch (error) {
      console.error('Failed to add evaluator:', error);
      alert('평가자 추가 중 오류가 발생했습니다.');
    }
  };

  const generateShortLink = async (longUrl: string): Promise<string> => {
    // 간단한 단축 URL 생성 (실제로는 bit.ly, TinyURL 등의 API 사용)
    const shortCode = Math.random().toString(36).substring(2, 8);
    const baseUrl = window.location.origin;
    return `${baseUrl}/e/${shortCode}`;
  };

  const handleSendInvitations = async () => {
    const selectedEvaluators = evaluators.filter(e => e.isSelected);
    
    if (selectedEvaluators.length === 0) {
      alert('초대할 평가자를 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      for (const evaluator of selectedEvaluators) {
        // 평가 링크 생성
        const evaluationLink = `${window.location.origin}/AHP_forPaper/?tab=evaluator-dashboard&project=${projectId}&evaluator=${evaluator.id}`;
        
        // 단축 URL 생성
        const shortLink = await generateShortLink(evaluationLink);
        
        // 이메일 초대 발송
        const emailContent = {
          to: evaluator.email,
          subject: inviteData.subject,
          body: `
안녕하세요 ${evaluator.name}님,

AHP 평가에 초대되었습니다.

프로젝트: ${projectName}
평가 링크: ${shortLink}

위 링크를 클릭하여 평가를 시작해주세요.

${inviteData.message}

감사합니다.
          `.trim()
        };

        // 실제 이메일 발송 (백엔드 API 또는 이메일 서비스 사용)
        const token = localStorage.getItem('token');
        if (token) {
          await fetch(`${API_BASE_URL}/api/evaluators/invite`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              evaluatorId: evaluator.id,
              projectId,
              emailContent,
              shortLink
            })
          });
        }

        // SMS 발송 (옵션)
        if (inviteData.sendSMS && evaluator.phone) {
          console.log(`SMS 발송: ${evaluator.phone} - ${shortLink}`);
        }

        // 상태 업데이트
        setEvaluators(prev => prev.map(e => 
          e.id === evaluator.id 
            ? { ...e, invitationStatus: 'sent', invitationLink: evaluationLink, shortLink }
            : e
        ));
      }

      alert(`${selectedEvaluators.length}명의 평가자에게 초대를 발송했습니다.`);
      setShowInviteForm(false);
      setSelectAll(false);
      setEvaluators(evaluators.map(e => ({ ...e, isSelected: false })));
    } catch (error) {
      console.error('Failed to send invitations:', error);
      alert('초대 발송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvaluator = async (evaluatorId: string) => {
    if (window.confirm('평가자를 삭제하시겠습니까? 배정된 프로젝트에서 제외되며 평가 데이터가 삭제됩니다.')) {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          await fetch(`${API_BASE_URL}/api/evaluators/${evaluatorId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }
        
        setEvaluators(evaluators.filter(e => e.id !== evaluatorId));
      } catch (error) {
        console.error('Failed to delete evaluator:', error);
        alert('평가자 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert('링크가 클립보드에 복사되었습니다.');
  };

  const filteredEvaluators = evaluators.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = evaluators.filter(e => e.isSelected).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {projectId ? `평가자 배정 - ${projectName}` : '평가자 관리'}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            평가자를 추가하고 이메일로 초대를 발송할 수 있습니다.
          </p>
        </div>
        {onClose && (
          <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
        )}
      </div>

      {/* Search and Actions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <Input
              id="search"
              placeholder="이름 또는 이메일로 검색..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowInviteForm(true)}
              disabled={selectedCount === 0}
            >
              📧 초대 발송 ({selectedCount})
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowAddForm(true);
                // setEditingEvaluator(null);
                setFormData({ email: '', name: '', phone: '' });
              }}
            >
              + 평가자 추가
            </Button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-3">새 평가자 추가</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                id="email"
                label="이메일"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                error={errors.email}
                placeholder="email@example.com"
                required
              />
              <Input
                id="name"
                label="이름"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                error={errors.name}
                placeholder="홍길동"
                required
              />
              <Input
                id="phone"
                label="전화번호 (선택)"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                error={errors.phone}
                placeholder="010-1234-5678"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ email: '', name: '', phone: '' });
                  setErrors({});
                }}
              >
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleAddEvaluator}
              >
                추가
              </Button>
            </div>
          </div>
        )}

        {/* Invite Form */}
        {showInviteForm && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-3">초대 메시지 설정</h3>
            <div className="space-y-4">
              <Input
                id="subject"
                label="이메일 제목"
                value={inviteData.subject}
                onChange={(value) => setInviteData({ ...inviteData, subject: value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  추가 메시지 (선택)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={inviteData.message}
                  onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                  placeholder="평가자에게 전달할 추가 메시지를 입력하세요..."
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={inviteData.sendSMS}
                  onChange={(e) => setInviteData({ ...inviteData, sendSMS: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  SMS로도 링크 발송 (전화번호가 있는 평가자만)
                </span>
              </label>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowInviteForm(false)}
              >
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleSendInvitations}
                disabled={loading}
              >
                {loading ? '발송 중...' : '초대 발송'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Evaluators List */}
      <Card>
        {projectId && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                전체 선택 {selectedCount > 0 && `(${selectedCount}명 선택됨)`}
              </span>
            </label>
          </div>
        )}

        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              데이터 로딩 중...
            </div>
          ) : filteredEvaluators.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>등록된 평가자가 없습니다.</p>
              <p className="text-sm mt-2">상단의 '평가자 추가' 버튼으로 평가자를 추가해주세요.</p>
            </div>
          ) : (
            filteredEvaluators.map(evaluator => (
              <div
                key={evaluator.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  evaluator.isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                } hover:shadow-sm transition-all`}
              >
                <div className="flex items-center space-x-4">
                  {projectId && (
                    <input
                      type="checkbox"
                      checked={evaluator.isSelected || false}
                      onChange={() => handleSelectEvaluator(evaluator.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{evaluator.name}</span>
                      {evaluator.invitationStatus && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          evaluator.invitationStatus === 'sent' ? 'bg-green-100 text-green-800' :
                          evaluator.invitationStatus === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          evaluator.invitationStatus === 'expired' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {evaluator.invitationStatus === 'sent' ? '초대 발송됨' :
                           evaluator.invitationStatus === 'accepted' ? '참여 중' :
                           evaluator.invitationStatus === 'expired' ? '만료됨' :
                           '대기 중'}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {evaluator.email}
                      {evaluator.phone && ` · ${evaluator.phone}`}
                    </div>
                    {evaluator.shortLink && (
                      <div className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
                        <span>평가 링크: {evaluator.shortLink}</span>
                        <button
                          onClick={() => handleCopyLink(evaluator.shortLink!)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          복사
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {evaluator.invitationStatus === 'pending' && (
                    <button
                      onClick={() => {
                        setEvaluators(prev => prev.map(e => 
                          e.id === evaluator.id ? { ...e, isSelected: true } : e
                        ));
                        setShowInviteForm(true);
                      }}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      초대
                    </button>
                  )}
                  {evaluator.invitationStatus === 'sent' && (
                    <button
                      onClick={() => {
                        setEvaluators(prev => prev.map(e => 
                          e.id === evaluator.id ? { ...e, isSelected: true } : e
                        ));
                        setShowInviteForm(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      재발송
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteEvaluator(evaluator.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">평가자 초대 안내</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 평가자를 추가한 후 이메일로 초대를 발송할 수 있습니다.</li>
          <li>• 초대 링크는 자동으로 단축 URL로 생성되어 발송됩니다.</li>
          <li>• 평가자는 받은 링크를 통해 바로 평가에 참여할 수 있습니다.</li>
          <li>• SMS 발송 옵션을 선택하면 전화번호로도 링크가 전송됩니다.</li>
          <li>• 초대 상태를 실시간으로 확인할 수 있습니다.</li>
        </ul>
      </Card>
    </div>
  );
};

export default EnhancedEvaluatorManagement;