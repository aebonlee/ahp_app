import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import apiService from '../../services/api';

interface RoleSwitcherProps {
  currentUser: User;
  targetRole: UserRole;
  onRoleSwitch: (role: UserRole) => void;
  onBack: () => void;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ 
  currentUser, 
  targetRole, 
  onRoleSwitch, 
  onBack 
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [actionMessage, setActionMessage] = useState<{type:'success'|'error'|'info', text:string}|null>(null);

  const showActionMessage = (type: 'success'|'error'|'info', text: string) => {
    setActionMessage({type, text});
    setTimeout(() => setActionMessage(null), 3000);
  };

  const roleInfo = {
    service_admin: {
      title: '서비스 관리자',
      icon: '👨‍💼',
      color: 'blue',
      description: '프로젝트와 사용자를 관리할 수 있는 권한',
      permissions: [
        '프로젝트 생성/수정/삭제',
        '사용자 관리',
        '평가자 할당',
        '결과 분석 및 보고서 생성',
        '시스템 설정 일부 접근'
      ]
    },
    service_user: {
      title: '서비스 사용자',
      icon: '👤',
      color: 'green',
      description: '일반 사용자 권한으로 프로젝트 참여',
      permissions: [
        '할당된 프로젝트 조회',
        '평가 참여',
        '개인 설정 관리',
        '결과 조회 (제한적)'
      ]
    },
    evaluator: {
      title: '평가자',
      icon: '⚖️',
      color: 'purple',
      description: '평가 작업에만 집중하는 제한된 권한',
      permissions: [
        '할당된 평가 수행',
        '쌍대비교 평가',
        '직접입력 평가',
        '일관성 검증',
        '평가 이력 조회'
      ]
    },
    super_admin: {
      title: '슈퍼 관리자',
      icon: '👑',
      color: 'red',
      description: '시스템 전체를 관리하는 최고 권한',
      permissions: [
        '모든 기능 접근',
        '시스템 초기화',
        '데이터베이스 관리',
        '역할 전환',
        '시스템 모니터링'
      ]
    }
  };

  const info = roleInfo[targetRole];

  const handleConfirmSwitch = async () => {
    if (!password) {
      showActionMessage('error', '비밀번호를 입력해주세요.');
      return;
    }
    setIsVerifying(true);
    try {
      const result = await apiService.post('/api/service/accounts/verify-password/', { password });
      if (result.data && (result.data as { valid?: boolean }).valid) {
        onRoleSwitch(targetRole);
        showActionMessage('success', `${info.title} 모드로 전환되었습니다.`);
        setIsConfirming(false);
      } else {
        showActionMessage('error', '비밀번호가 올바르지 않습니다.');
      }
    } catch {
      showActionMessage('error', '비밀번호 확인 중 오류가 발생했습니다.');
    } finally {
      setIsVerifying(false);
      setPassword('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {actionMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : actionMessage.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage.text}
        </div>
      )}
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            역할 전환
          </h1>
          <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
            다른 사용자 역할로 전환하여 시스템을 테스트할 수 있습니다
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)'
          }}
        >
          ← 돌아가기
        </button>
      </div>

      {/* 현재 역할 */}
      <div className="p-6 rounded-xl" style={{ 
        backgroundColor: 'var(--bg-secondary)',
        border: '2px solid var(--accent-primary)'
      }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
          현재 역할
        </h3>
        <div className="flex items-center space-x-4">
          <div className="text-5xl">👑</div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              슈퍼 관리자
            </h2>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
              {currentUser.email} • 최고 권한 보유
            </p>
          </div>
        </div>
      </div>

      {/* 전환할 역할 */}
      <div className={`p-6 rounded-xl border-2`} style={{ 
        backgroundColor: 'var(--bg-primary)',
        borderColor: info.color === 'blue' ? '#3B82F6' :
                     info.color === 'green' ? '#10B981' :
                     info.color === 'purple' ? '#8B5CF6' :
                     '#EF4444'
      }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
          전환할 역할
        </h3>
        <div className="flex items-start space-x-4">
          <div className="text-5xl">{info.icon}</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {info.title}
            </h2>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              {info.description}
            </p>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                사용 가능한 권한:
              </h4>
              <ul className="space-y-1">
                {info.permissions.map((permission, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 경고 메시지 */}
      <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-900">주의사항</h4>
            <ul className="mt-2 space-y-1 text-sm text-yellow-800">
              <li>• 역할 전환 시 현재 작업 중인 내용이 저장되지 않을 수 있습니다</li>
              <li>• 전환된 역할의 권한으로만 시스템을 사용할 수 있습니다</li>
              <li>• 원래 역할로 돌아오려면 다시 로그인해야 합니다</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 전환 버튼 */}
      {!isConfirming ? (
        <div className="flex justify-center">
          <button
            onClick={() => setIsConfirming(true)}
            className="px-8 py-3 rounded-lg font-semibold text-white transition-transform hover:scale-105"
            style={{ 
              backgroundColor: info.color === 'blue' ? '#3B82F6' :
                             info.color === 'green' ? '#10B981' :
                             info.color === 'purple' ? '#8B5CF6' :
                             '#EF4444'
            }}
          >
            {info.icon} {info.title}로 전환하기
          </button>
        </div>
      ) : (
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            비밀번호 확인
          </h3>
          <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            보안을 위해 슈퍼 관리자 비밀번호를 다시 입력해주세요
          </p>
          <div className="flex space-x-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="flex-1 px-4 py-2 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
              autoFocus
            />
            <button
              onClick={handleConfirmSwitch}
              disabled={isVerifying}
              className="px-6 py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? '확인 중...' : '확인'}
            </button>
            <button
              onClick={() => {
                setIsConfirming(false);
                setPassword('');
              }}
              className="px-6 py-2 rounded-lg font-semibold"
              style={{ 
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)'
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSwitcher;