/**
 * 초대 상태별 UI 설정 (Phase 2a)
 */

import { InvitationStatus } from '../../../hooks/useEvaluatorInvite';

export interface InvitationStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  description: string;
  actions: ('resend' | 'revoke' | 'regenerate' | 'view_detail')[];
}

export const INVITATION_STATUS_MAP: Record<InvitationStatus, InvitationStatusConfig> = {
  pending: {
    label: '대기중',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    description: '평가자가 아직 초대에 응답하지 않았습니다.',
    actions: ['resend', 'revoke', 'view_detail'],
  },
  accepted: {
    label: '수락됨',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: '평가자가 초대를 수락했습니다.',
    actions: ['view_detail'],
  },
  declined: {
    label: '거절됨',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: '평가자가 초대를 거절했습니다.',
    actions: ['view_detail'],
  },
  expired: {
    label: '만료됨',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    description: '초대 유효기간이 경과했습니다.',
    actions: ['regenerate', 'view_detail'],
  },
  revoked: {
    label: '철회됨',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    description: '관리자가 초대를 철회했습니다.',
    actions: ['view_detail'],
  },
};
