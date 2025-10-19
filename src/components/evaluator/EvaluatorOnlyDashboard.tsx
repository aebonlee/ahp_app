/**
 * 평가자 전용 간단한 대시보드
 * evaluator 역할 전용 페이지 - 초대받은 링크로 평가만 수행
 */

import React, { useState } from 'react';
import { User } from '../../types';

interface EvaluatorOnlyDashboardProps {
  user: User;
  onTabChange: (tab: string) => void;
}

const EvaluatorOnlyDashboard: React.FC<EvaluatorOnlyDashboardProps> = ({ user, onTabChange }) => {
  const [invitationCode, setInvitationCode] = useState('');

  const handleInvitationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invitationCode.trim()) {
      // TODO: 초대 코드로 평가 페이지로 이동
      console.log('초대 코드 입력됨:', invitationCode);
      onTabChange('pairwise-evaluation');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-2xl w-full space-y-8 p-8">
        
        {/* 평가자 환영 메시지 */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl mb-6"
               style={{ backgroundColor: 'var(--accent-primary-pastel)' }}>
            ⚖️
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            평가자 {user.first_name || user.username}님, 환영합니다!
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            AHP 평가 시스템
          </p>
        </div>

        {/* 초대 코드 입력 카드 */}
        <div className="p-8 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
          <h2 className="text-xl font-semibold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
            평가 참여하기
          </h2>
          
          <form onSubmit={handleInvitationSubmit} className="space-y-6">
            <div>
              <label htmlFor="invitation-code" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                초대 코드 또는 링크를 입력하세요
              </label>
              <input
                id="invitation-code"
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder="예: PRJ-2025-ABC123"
                className="w-full px-4 py-3 rounded-lg text-lg"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)'
                }}
              />
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                프로젝트 관리자로부터 받은 초대 코드를 입력해주세요.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={!invitationCode.trim()}
              className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all"
              style={{ 
                backgroundColor: invitationCode.trim() ? 'var(--accent-primary)' : 'var(--border-light)',
                cursor: invitationCode.trim() ? 'pointer' : 'not-allowed'
              }}
              onMouseEnter={(e) => {
                if (invitationCode.trim()) {
                  e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (invitationCode.trim()) {
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                }
              }}
            >
              평가 시작하기
            </button>
          </form>
        </div>

        {/* 도움말 */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
          <h3 className="font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
            <span className="text-2xl mr-2">💡</span>
            도움말
          </h3>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>프로젝트 관리자로부터 이메일이나 메시지로 초대 코드를 받으셨나요?</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>위 입력란에 초대 코드를 입력하고 '평가 시작하기' 버튼을 클릭하세요.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>쌍대비교 평가를 진행하고 결과를 제출하면 됩니다.</span>
            </li>
          </ul>
        </div>

        {/* 문의 정보 */}
        <div className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          <p>도움이 필요하신가요?</p>
          <p>
            <a 
              href="mailto:support@ahp-platform.com" 
              className="hover:underline"
              style={{ color: 'var(--accent-primary)' }}
            >
              support@ahp-platform.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EvaluatorOnlyDashboard;