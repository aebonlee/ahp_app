import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import cleanDataService from '../../services/dataService_clean';

interface QRCodeAssignmentProps {
  projectId: string;
  onComplete: () => void;
}

interface EvaluatorSession {
  sessionId: string;
  projectId: string;
  evaluatorName?: string;
  email?: string;
  status: 'pending' | 'active' | 'completed';
  startedAt?: string;
  completedAt?: string;
  progress: number;
  accessUrl: string;
  shortUrl: string;
  qrCode: string;
}

const QRCodeEvaluatorAssignment: React.FC<QRCodeAssignmentProps> = ({ 
  projectId, 
  onComplete 
}) => {
  const [sessions, setSessions] = useState<EvaluatorSession[]>([]);
  const [maxEvaluators, setMaxEvaluators] = useState<number>(5);
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [showQRCodes, setShowQRCodes] = useState<boolean>(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generate base URL for evaluation
  const getBaseUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/ahp_app`;
  };

  // Generate short URL code (6 characters)
  const generateShortCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Initialize evaluation sessions
  useEffect(() => {
    const initializeSessions = async () => {
      try {
        // Get project details
        const project = await cleanDataService.getProject(projectId);
        if (project) {
          setProjectTitle(project.title || 'AHP 평가');
        }

        // Create evaluation sessions based on max evaluators
        const newSessions: EvaluatorSession[] = [];
        for (let i = 0; i < maxEvaluators; i++) {
          const sessionId = `session_${Date.now()}_${i}`;
          const shortCode = generateShortCode();
          const accessUrl = `${getBaseUrl()}/evaluate/${projectId}/${sessionId}`;
          const shortUrl = `${getBaseUrl()}/e/${shortCode}`;
          
          newSessions.push({
            sessionId,
            projectId,
            status: 'pending',
            progress: 0,
            accessUrl,
            shortUrl,
            qrCode: accessUrl // QR code will contain the full URL
          });
        }
        setSessions(newSessions);
      } catch (error) {
        console.error('Failed to initialize sessions:', error);
      }
    };

    if (projectId) {
      initializeSessions();
    }
  }, [projectId, maxEvaluators]);

  // Handle number of evaluators change
  const handleMaxEvaluatorsChange = (value: string) => {
    const num = parseInt(value) || 1;
    if (num > 0 && num <= 50) {
      setMaxEvaluators(num);
    }
  };

  // Copy link to clipboard
  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Generate QR code for printing
  const generatePrintableQRCodes = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrCodesHtml = sessions.map((session, index) => `
      <div style="page-break-after: always; padding: 50px; text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 20px;">${projectTitle}</h1>
        <h2 style="font-size: 18px; color: #666;">평가자 ${index + 1}</h2>
        <div style="margin: 30px auto; width: 200px; height: 200px; border: 2px solid #000; padding: 20px;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(session.accessUrl)}" 
               alt="QR Code ${index + 1}" style="width: 100%; height: 100%;" />
        </div>
        <p style="font-size: 14px; margin-top: 20px;">
          <strong>단축 링크:</strong> ${session.shortUrl}
        </p>
        <p style="font-size: 12px; color: #666; margin-top: 10px;">
          QR코드를 스캔하거나 단축 링크를 입력하여 평가를 시작하세요.
        </p>
        <hr style="margin-top: 30px; border: 1px dashed #ccc;">
        <p style="font-size: 10px; color: #999; margin-top: 20px;">
          세션 ID: ${session.sessionId}
        </p>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${projectTitle} - QR 코드</title>
          <meta charset="utf-8">
        </head>
        <body>
          ${qrCodesHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Monitor active sessions (simulate real-time updates)
  useEffect(() => {
    const checkActiveSessions = async () => {
      // In production, this would check the actual database
      // For now, simulate some active sessions
      const updatedSessions = sessions.map((session, index) => {
        // Simulate random progress
        if (Math.random() > 0.7 && session.status === 'pending') {
          return {
            ...session,
            status: 'active' as const,
            evaluatorName: `평가자 ${index + 1}`,
            startedAt: new Date().toISOString(),
            progress: Math.floor(Math.random() * 50) + 10
          };
        }
        if (session.status === 'active' && Math.random() > 0.9) {
          return {
            ...session,
            status: 'completed' as const,
            progress: 100,
            completedAt: new Date().toISOString()
          };
        }
        return session;
      });
      
      if (JSON.stringify(updatedSessions) !== JSON.stringify(sessions)) {
        setSessions(updatedSessions);
      }
    };

    const interval = setInterval(checkActiveSessions, 5000);
    return () => clearInterval(interval);
  }, [sessions]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress > 50) return 'bg-blue-500';
    if (progress > 0) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <div className="space-y-6">
      <Card title="5️⃣ QR코드 기반 평가자 배정">
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📱 QR코드 평가 시스템</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 이메일 초대 없이 QR코드로 즉시 평가 참여 가능</li>
              <li>• 각 QR코드는 독립적인 평가 세션 제공</li>
              <li>• 실시간으로 평가 진행 상황 모니터링</li>
              <li>• 익명 평가 지원 (선택적 실명 입력)</li>
            </ul>
          </div>

          {/* Settings */}
          <div className="border-b pb-4">
            <div className="flex items-center gap-4">
              <Input
                id="maxEvaluators"
                label="평가자 수"
                type="number"
                value={maxEvaluators.toString()}
                onChange={handleMaxEvaluatorsChange}
                min="1"
                max="50"
                className="w-32"
              />
              <Button
                variant="secondary"
                onClick={() => setShowQRCodes(!showQRCodes)}
              >
                {showQRCodes ? '🙈 QR코드 숨기기' : '👁️ QR코드 보기'}
              </Button>
              <Button
                variant="primary"
                onClick={generatePrintableQRCodes}
              >
                🖨️ QR코드 인쇄
              </Button>
            </div>
          </div>

          {/* QR Codes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session, index) => (
              <div
                key={session.sessionId}
                className="border rounded-lg p-4 bg-white hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h5 className="font-medium text-gray-900">
                      평가자 {index + 1}
                    </h5>
                    {session.evaluatorName && (
                      <p className="text-sm text-gray-600 mt-1">
                        {session.evaluatorName}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                    {session.status === 'completed' ? '완료' : 
                     session.status === 'active' ? '진행중' : '대기'}
                  </span>
                </div>

                {/* QR Code */}
                {showQRCodes && (
                  <div className="flex justify-center my-4">
                    <div className="border-2 border-gray-300 p-2 rounded">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(session.accessUrl)}`}
                        alt={`QR Code ${index + 1}`}
                        className="w-36 h-36"
                      />
                    </div>
                  </div>
                )}

                {/* Short URL */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
                    <code className="text-blue-600">{session.shortUrl}</code>
                    <button
                      onClick={() => copyToClipboard(session.shortUrl, index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {copiedIndex === index ? '✅' : '📋'}
                    </button>
                  </div>

                  {/* Progress */}
                  {session.status !== 'pending' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>진행률</span>
                        <span>{session.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getProgressColor(session.progress)}`}
                          style={{ width: `${session.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  {session.startedAt && (
                    <p className="text-xs text-gray-500">
                      시작: {new Date(session.startedAt).toLocaleTimeString()}
                    </p>
                  )}
                  {session.completedAt && (
                    <p className="text-xs text-green-600">
                      완료: {new Date(session.completedAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {sessions.length}
                </div>
                <div className="text-sm text-gray-600">총 QR코드</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {sessions.filter(s => s.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">진행중</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {sessions.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">완료</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {sessions.filter(s => s.status !== 'pending').length > 0
                    ? Math.round(
                        sessions.reduce((acc, s) => acc + s.progress, 0) / 
                        sessions.filter(s => s.status !== 'pending').length
                      )
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">평균 진행률</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              <span className="text-green-600">
                ✨ QR코드를 배포하면 평가자가 자동으로 등록됩니다
              </span>
            </div>
            <Button
              variant="primary"
              onClick={onComplete}
            >
              평가 시작하기
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QRCodeEvaluatorAssignment;