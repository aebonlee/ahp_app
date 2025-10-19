/**
 * 이메일 알림 시스템 컴포넌트
 * 워크숍 초대, 알림, 결과 공유 등의 이메일 자동화
 */

import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

export interface EmailTemplate {
  id: string;
  name: string;
  type: 'invitation' | 'reminder' | 'completion' | 'results' | 'custom';
  subject: string;
  content: string;
  variables: string[];
  isDefault: boolean;
}

export interface EmailNotification {
  id: string;
  type: EmailTemplate['type'];
  recipients: string[];
  subject: string;
  content: string;
  scheduledTime?: string;
  sentTime?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  templateId: string;
  projectId: string;
  participantIds?: string[];
}

export interface EmailSettings {
  smtpConfig: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
  senderInfo: {
    name: string;
    email: string;
    organization: string;
  };
  autoSend: {
    invitations: boolean;
    reminders: boolean;
    completionNotices: boolean;
    results: boolean;
  };
  reminderSchedule: {
    firstReminder: number; // hours before deadline
    secondReminder: number;
    finalReminder: number;
  };
}

interface EmailNotificationSystemProps {
  projectId: string;
  participants: Array<{ id: string; name: string; email: string; status: string }>;
  onNotificationSent?: (notification: EmailNotification) => void;
  className?: string;
}

const EmailNotificationSystem: React.FC<EmailNotificationSystemProps> = ({
  projectId,
  participants,
  onNotificationSent,
  className = ''
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [currentView, setCurrentView] = useState<'templates' | 'notifications' | 'settings'>('templates');
  const [isConfigured, setIsConfigured] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadEmailTemplates();
    loadEmailSettings();
    loadNotificationHistory();
  }, [projectId]);

  const loadEmailTemplates = () => {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'invitation_template',
        name: '워크숍 초대장',
        type: 'invitation',
        subject: '[AHP 워크숍] {{workshop_title}} 참여 요청',
        content: `안녕하세요 {{participant_name}}님,

{{workshop_title}} AHP 의사결정 워크숍에 초대합니다.

📅 일정: {{workshop_date}}
⏰ 소요시간: {{workshop_duration}}분
🎯 목적: {{workshop_description}}

아래 링크를 클릭하여 워크숍에 참여해주세요:
{{participation_link}}

워크숍 진행 방법:
1. 위 링크로 접속
2. 계층구조 및 평가 기준 검토
3. 쌍대비교 또는 직접입력을 통한 평가 수행
4. 일관성 검증 및 결과 확인

문의사항이 있으시면 언제든 연락주세요.

감사합니다.

{{facilitator_name}}
{{organization}}
{{contact_info}}`,
        variables: ['participant_name', 'workshop_title', 'workshop_date', 'workshop_duration', 'workshop_description', 'participation_link', 'facilitator_name', 'organization', 'contact_info'],
        isDefault: true
      },
      {
        id: 'reminder_template',
        name: '평가 알림',
        type: 'reminder',
        subject: '[알림] {{workshop_title}} 평가 마감 {{hours_remaining}}시간 전',
        content: `안녕하세요 {{participant_name}}님,

{{workshop_title}} 워크숍의 평가 마감이 {{hours_remaining}}시간 남았습니다.

현재 진행률: {{completion_rate}}%
남은 평가 항목: {{remaining_items}}개

아직 평가를 완료하지 않으셨다면, 아래 링크를 통해 계속 진행해주세요:
{{participation_link}}

평가 완료 예상 소요시간: {{estimated_time}}분

문의사항이 있으시면 언제든 연락주세요.

{{facilitator_name}}`,
        variables: ['participant_name', 'workshop_title', 'hours_remaining', 'completion_rate', 'remaining_items', 'participation_link', 'estimated_time', 'facilitator_name'],
        isDefault: true
      },
      {
        id: 'completion_template',
        name: '평가 완료 확인',
        type: 'completion',
        subject: '[완료] {{workshop_title}} 평가 완료 확인',
        content: `안녕하세요 {{participant_name}}님,

{{workshop_title}} 워크숍 평가를 성공적으로 완료해주셔서 감사합니다.

✅ 평가 완료 시간: {{completion_time}}
✅ 일관성 비율: {{consistency_ratio}}
✅ 평가 소요시간: {{evaluation_time}}분

귀하의 평가 결과는 다른 참가자들과 함께 종합 분석되어 최종 의사결정에 반영됩니다.

전체 결과는 모든 참가자의 평가가 완료된 후 공유드리겠습니다.

다시 한번 참여해주셔서 감사합니다.

{{facilitator_name}}`,
        variables: ['participant_name', 'workshop_title', 'completion_time', 'consistency_ratio', 'evaluation_time', 'facilitator_name'],
        isDefault: true
      },
      {
        id: 'results_template',
        name: '결과 공유',
        type: 'results',
        subject: '[결과] {{workshop_title}} 최종 결과 공유',
        content: `안녕하세요 {{participant_name}}님,

{{workshop_title}} 워크숍의 최종 결과를 공유드립니다.

📊 참여 현황:
- 총 참가자: {{total_participants}}명
- 완료 참가자: {{completed_participants}}명
- 전체 일관성: {{overall_consistency}}

🏆 최종 순위:
{{ranking_results}}

📈 상세 분석 결과:
- 그룹 합의도: {{consensus_level}}%
- 민감도 분석: {{sensitivity_analysis}}

상세한 분석 보고서는 첨부파일을 확인해주세요.

결과에 대한 질문이나 추가 논의가 필요하시면 언제든 연락주세요.

감사합니다.

{{facilitator_name}}`,
        variables: ['participant_name', 'workshop_title', 'total_participants', 'completed_participants', 'overall_consistency', 'ranking_results', 'consensus_level', 'sensitivity_analysis', 'facilitator_name'],
        isDefault: true
      }
    ];

    setTemplates(defaultTemplates);
    setSelectedTemplate(defaultTemplates[0]);
  };

  const loadEmailSettings = () => {
    // 실제로는 API에서 로드
    const sampleSettings: EmailSettings = {
      smtpConfig: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        username: '',
        password: ''
      },
      senderInfo: {
        name: '워크숍 진행자',
        email: 'facilitator@company.com',
        organization: 'TechCorp'
      },
      autoSend: {
        invitations: true,
        reminders: true,
        completionNotices: true,
        results: false
      },
      reminderSchedule: {
        firstReminder: 24, // 24시간 전
        secondReminder: 4,  // 4시간 전
        finalReminder: 1    // 1시간 전
      }
    };

    setSettings(sampleSettings);
    setIsConfigured(false); // SMTP 설정이 없어서 비활성화
  };

  const loadNotificationHistory = () => {
    const sampleNotifications: EmailNotification[] = [
      {
        id: 'notif_1',
        type: 'invitation',
        recipients: ['kim@company.com', 'lee@company.com'],
        subject: '[AHP 워크숍] 신기술 도입 우선순위 결정 참여 요청',
        content: '워크숍 초대 내용...',
        sentTime: new Date(Date.now() - 3600000).toISOString(),
        status: 'sent',
        templateId: 'invitation_template',
        projectId,
        participantIds: ['p1', 'p2']
      },
      {
        id: 'notif_2',
        type: 'reminder',
        recipients: ['choi@company.com'],
        subject: '[알림] 신기술 도입 우선순위 결정 평가 마감 4시간 전',
        content: '평가 알림 내용...',
        sentTime: new Date(Date.now() - 14400000).toISOString(),
        status: 'sent',
        templateId: 'reminder_template',
        projectId,
        participantIds: ['p4']
      }
    ];

    setNotifications(sampleNotifications);
  };

  const sendNotification = async (templateId: string, recipientIds: string[], customData: any = {}) => {
    if (!isConfigured) {
      alert('이메일 설정을 먼저 구성해주세요.');
      return;
    }

    setIsSending(true);
    
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('템플릿을 찾을 수 없습니다.');
      }

      const recipients = participants.filter(p => recipientIds.includes(p.id));
      
      for (const recipient of recipients) {
        const personalizedContent = personalizeContent(template.content, recipient, customData);
        const personalizedSubject = personalizeContent(template.subject, recipient, customData);

        const notification: EmailNotification = {
          id: `notif_${Date.now()}_${recipient.id}`,
          type: template.type,
          recipients: [recipient.email],
          subject: personalizedSubject,
          content: personalizedContent,
          sentTime: new Date().toISOString(),
          status: 'sent', // 실제로는 API 응답에 따라 결정
          templateId,
          projectId,
          participantIds: [recipient.id]
        };

        setNotifications(prev => [notification, ...prev]);

        if (onNotificationSent) {
          onNotificationSent(notification);
        }
      }

      alert(`${recipients.length}명에게 이메일을 성공적으로 전송했습니다.`);
      
    } catch (error) {
      console.error('이메일 전송 실패:', error);
      alert('이메일 전송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const personalizeContent = (content: string, participant: any, customData: any): string => {
    let personalized = content;
    
    // 기본 변수 치환
    const variables: { [key: string]: string } = {
      participant_name: participant.name,
      workshop_title: customData.workshop_title || '신기술 도입 우선순위 결정',
      workshop_date: customData.workshop_date || new Date().toLocaleString('ko-KR'),
      workshop_duration: customData.workshop_duration || '180',
      workshop_description: customData.workshop_description || 'AHP 기반 의사결정 워크숍',
      participation_link: `${window.location.origin}/workshop/${projectId}?participant=${participant.id}`,
      facilitator_name: settings?.senderInfo.name || '워크숍 진행자',
      organization: settings?.senderInfo.organization || 'TechCorp',
      contact_info: settings?.senderInfo.email || 'facilitator@company.com',
      completion_rate: `${Math.floor(Math.random() * 30 + 70)}`,
      remaining_items: `${Math.floor(Math.random() * 5 + 1)}`,
      estimated_time: `${Math.floor(Math.random() * 20 + 10)}`,
      hours_remaining: customData.hours_remaining || '24',
      ...customData
    };

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      personalized = personalized.replace(regex, value);
    });

    return personalized;
  };

  const sendTestEmail = async () => {
    if (!testEmail || !selectedTemplate) {
      alert('테스트 이메일 주소와 템플릿을 선택해주세요.');
      return;
    }

    setIsSending(true);
    
    try {
      const testParticipant = {
        id: 'test',
        name: '테스트 사용자',
        email: testEmail
      };

      const personalizedContent = personalizeContent(selectedTemplate.content, testParticipant, {
        workshop_title: '테스트 워크숍',
        workshop_date: new Date().toLocaleString('ko-KR'),
        hours_remaining: '24'
      });

      console.log('테스트 이메일 전송:', {
        to: testEmail,
        subject: personalizeContent(selectedTemplate.subject, testParticipant, {}),
        content: personalizedContent
      });

      alert('테스트 이메일을 전송했습니다. (실제로는 SMTP 서버를 통해 전송됩니다)');
      
    } catch (error) {
      console.error('테스트 이메일 전송 실패:', error);
      alert('테스트 이메일 전송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const renderTemplates = () => (
    <div className="space-y-6">
      {/* 템플릿 목록 */}
      <Card title="이메일 템플릿">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {templates.map(template => (
            <div 
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{template.name}</h4>
                <span className={`px-2 py-1 rounded text-xs ${
                  template.type === 'invitation' ? 'bg-green-100 text-green-700' :
                  template.type === 'reminder' ? 'bg-yellow-100 text-yellow-700' :
                  template.type === 'completion' ? 'bg-blue-100 text-blue-700' :
                  template.type === 'results' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {template.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
              <div className="text-xs text-gray-500">
                변수: {template.variables.length}개 | 
                {template.isDefault ? ' 기본 템플릿' : ' 사용자 정의'}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 선택된 템플릿 상세 */}
      {selectedTemplate && (
        <Card title={`템플릿 상세: ${selectedTemplate.name}`}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">제목</label>
              <input
                type="text"
                value={selectedTemplate.subject}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">내용</label>
              <textarea
                value={selectedTemplate.content}
                readOnly
                rows={12}
                className="w-full border rounded px-3 py-2 bg-gray-50 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">사용 가능한 변수</label>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.variables.map(variable => (
                  <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">
                    {`{{${variable}}}`}
                  </span>
                ))}
              </div>
            </div>

            {/* 테스트 이메일 전송 */}
            <div className="border-t pt-4">
              <h5 className="font-medium mb-2">테스트 이메일 전송</h5>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="테스트 이메일 주소"
                  className="flex-1 border rounded px-3 py-2"
                />
                <Button
                  variant="secondary"
                  onClick={sendTestEmail}
                  disabled={isSending || !isConfigured}
                >
                  {isSending ? '전송 중...' : '테스트 전송'}
                </Button>
              </div>
              {!isConfigured && (
                <p className="text-sm text-red-600 mt-1">이메일 설정을 먼저 구성해주세요.</p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      {/* 빠른 전송 */}
      <Card title="빠른 이메일 전송">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">템플릿 선택</label>
              <select className="w-full border rounded px-3 py-2">
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">수신자 선택</label>
              <select className="w-full border rounded px-3 py-2">
                <option value="all">모든 참가자</option>
                <option value="incomplete">미완료 참가자</option>
                <option value="completed">완료 참가자</option>
                <option value="invited">초대된 참가자</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="primary" 
              disabled={!isConfigured || isSending}
              onClick={() => {
                const incompleteParticipants = participants.filter(p => p.status !== 'completed');
                sendNotification('reminder_template', incompleteParticipants.map(p => p.id));
              }}
            >
              {isSending ? '전송 중...' : '선택된 참가자에게 전송'}
            </Button>
            <Button variant="secondary">
              예약 전송
            </Button>
          </div>
        </div>
      </Card>

      {/* 전송 기록 */}
      <Card title="이메일 전송 기록">
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              전송된 이메일이 없습니다.
            </div>
          ) : (
            notifications.map(notification => (
              <div key={notification.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{notification.subject}</h4>
                    <p className="text-sm text-gray-600">
                      수신자: {notification.recipients.join(', ')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    notification.status === 'sent' ? 'bg-green-100 text-green-700' :
                    notification.status === 'failed' ? 'bg-red-100 text-red-700' :
                    notification.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {notification.status === 'sent' ? '전송완료' :
                     notification.status === 'failed' ? '전송실패' :
                     notification.status === 'scheduled' ? '예약됨' : '임시저장'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {notification.sentTime && (
                    <>전송시간: {new Date(notification.sentTime).toLocaleString('ko-KR')}</>
                  )}
                  {notification.scheduledTime && (
                    <>예약시간: {new Date(notification.scheduledTime).toLocaleString('ko-KR')}</>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* SMTP 설정 */}
      <Card title="SMTP 서버 설정">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">SMTP 호스트</label>
              <input
                type="text"
                value={settings?.smtpConfig.host || ''}
                onChange={(e) => setSettings(prev => prev ? {
                  ...prev,
                  smtpConfig: { ...prev.smtpConfig, host: e.target.value }
                } : null)}
                placeholder="smtp.gmail.com"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">포트</label>
              <input
                type="number"
                value={settings?.smtpConfig.port || 587}
                onChange={(e) => setSettings(prev => prev ? {
                  ...prev,
                  smtpConfig: { ...prev.smtpConfig, port: parseInt(e.target.value) }
                } : null)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">사용자명</label>
              <input
                type="text"
                value={settings?.smtpConfig.username || ''}
                onChange={(e) => setSettings(prev => prev ? {
                  ...prev,
                  smtpConfig: { ...prev.smtpConfig, username: e.target.value }
                } : null)}
                placeholder="your-email@gmail.com"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">비밀번호</label>
              <input
                type="password"
                value={settings?.smtpConfig.password || ''}
                onChange={(e) => setSettings(prev => prev ? {
                  ...prev,
                  smtpConfig: { ...prev.smtpConfig, password: e.target.value }
                } : null)}
                placeholder="앱 비밀번호"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings?.smtpConfig.secure || false}
              onChange={(e) => setSettings(prev => prev ? {
                ...prev,
                smtpConfig: { ...prev.smtpConfig, secure: e.target.checked }
              } : null)}
              className="mr-2"
            />
            <span className="text-sm">SSL/TLS 사용</span>
          </label>

          <div className="flex space-x-2">
            <Button 
              variant="primary"
              onClick={() => {
                if (settings?.smtpConfig.username && settings?.smtpConfig.password) {
                  setIsConfigured(true);
                  alert('SMTP 설정이 저장되었습니다.');
                } else {
                  alert('사용자명과 비밀번호를 입력해주세요.');
                }
              }}
            >
              설정 저장
            </Button>
            <Button variant="secondary">
              연결 테스트
            </Button>
          </div>
        </div>
      </Card>

      {/* 발신자 정보 */}
      <Card title="발신자 정보">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">발신자 이름</label>
              <input
                type="text"
                value={settings?.senderInfo.name || ''}
                onChange={(e) => setSettings(prev => prev ? {
                  ...prev,
                  senderInfo: { ...prev.senderInfo, name: e.target.value }
                } : null)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">이메일 주소</label>
              <input
                type="email"
                value={settings?.senderInfo.email || ''}
                onChange={(e) => setSettings(prev => prev ? {
                  ...prev,
                  senderInfo: { ...prev.senderInfo, email: e.target.value }
                } : null)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">조직명</label>
            <input
              type="text"
              value={settings?.senderInfo.organization || ''}
              onChange={(e) => setSettings(prev => prev ? {
                ...prev,
                senderInfo: { ...prev.senderInfo, organization: e.target.value }
              } : null)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      </Card>

      {/* 자동 전송 설정 */}
      <Card title="자동 전송 설정">
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(settings?.autoSend || {}).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setSettings(prev => prev ? {
                    ...prev,
                    autoSend: { ...prev.autoSend, [key]: e.target.checked }
                  } : null)}
                  className="mr-2"
                />
                <span className="text-sm">
                  {key === 'invitations' ? '초대장' :
                   key === 'reminders' ? '알림' :
                   key === 'completionNotices' ? '완료 알림' :
                   key === 'results' ? '결과 공유' : key}
                </span>
              </label>
            ))}
          </div>

          <div>
            <h5 className="font-medium mb-2">알림 일정</h5>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">1차 알림 (시간 전)</label>
                <input
                  type="number"
                  value={settings?.reminderSchedule.firstReminder || 24}
                  onChange={(e) => setSettings(prev => prev ? {
                    ...prev,
                    reminderSchedule: { ...prev.reminderSchedule, firstReminder: parseInt(e.target.value) }
                  } : null)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">2차 알림 (시간 전)</label>
                <input
                  type="number"
                  value={settings?.reminderSchedule.secondReminder || 4}
                  onChange={(e) => setSettings(prev => prev ? {
                    ...prev,
                    reminderSchedule: { ...prev.reminderSchedule, secondReminder: parseInt(e.target.value) }
                  } : null)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">최종 알림 (시간 전)</label>
                <input
                  type="number"
                  value={settings?.reminderSchedule.finalReminder || 1}
                  onChange={(e) => setSettings(prev => prev ? {
                    ...prev,
                    reminderSchedule: { ...prev.reminderSchedule, finalReminder: parseInt(e.target.value) }
                  } : null)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 상태 표시 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">
            {isConfigured ? '이메일 시스템 활성화됨' : '이메일 설정 필요'}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          참가자 {participants.length}명 | 전송 기록 {notifications.length}건
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'templates', name: '이메일 템플릿', icon: '📝' },
            { id: 'notifications', name: '전송 관리', icon: '📧' },
            { id: 'settings', name: '시스템 설정', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                currentView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {currentView === 'templates' && renderTemplates()}
      {currentView === 'notifications' && renderNotifications()}
      {currentView === 'settings' && renderSettings()}
    </div>
  );
};

export default EmailNotificationSystem;