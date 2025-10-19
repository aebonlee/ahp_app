import React, { useState } from 'react';
import { PlusIcon, TrashIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import api from '../../../services/api';

interface InviteEvaluatorsProps {
  projectId: number;
  onSuccess: () => void;
}

const InviteEvaluators: React.FC<InviteEvaluatorsProps> = ({ projectId, onSuccess }) => {
  const [emails, setEmails] = useState<string[]>(['']);
  const [message, setMessage] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [bulkEmail, setBulkEmail] = useState('');
  const [inputMode, setInputMode] = useState<'individual' | 'bulk'>('individual');

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails.length > 0 ? newEmails : ['']);
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const validateEmails = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailList = inputMode === 'bulk' 
      ? bulkEmail.split(/[\n,;]+/).map(e => e.trim()).filter(e => e)
      : emails.filter(e => e);
    
    const invalidEmails = emailList.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      setErrors([`이메일 형식이 올바르지 않습니다: ${invalidEmails.join(', ')}`]);
      return false;
    }
    
    if (emailList.length === 0) {
      setErrors(['최소 1개 이상의 이메일을 입력하세요.']);
      return false;
    }
    
    setErrors([]);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmails()) {
      return;
    }

    const emailList = inputMode === 'bulk'
      ? bulkEmail.split(/[\n,;]+/).map(e => e.trim()).filter(e => e)
      : emails.filter(e => e);

    try {
      setLoading(true);
      const response = await api.post('/evaluations/bulk-invitations/send_bulk_invitations/', {
        project_id: projectId,
        evaluator_emails: emailList,
        custom_message: message,
        expiry_days: expiryDays
      });

      if (response.data) {
        alert(`${response.data.invitations_created}명의 평가자에게 초대를 발송했습니다.`);
        // Reset form
        setEmails(['']);
        setBulkEmail('');
        setMessage('');
        onSuccess();
      }
    } catch (error: any) {
      console.error('초대 발송 실패:', error);
      setErrors([error.response?.data?.error || '초대 발송에 실패했습니다.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="text-xl font-bold mb-6">평가자 초대</h2>

      {/* Input Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg transition-all ${
            inputMode === 'individual'
              ? 'bg-gradient-to-r from-primary to-tertiary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setInputMode('individual')}
        >
          개별 입력
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-all ${
            inputMode === 'bulk'
              ? 'bg-gradient-to-r from-primary to-tertiary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setInputMode('bulk')}
        >
          대량 입력
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        {inputMode === 'individual' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              평가자 이메일
            </label>
            <div className="space-y-2">
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="evaluator@example.com"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmailField(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addEmailField}
              className="mt-2 flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              이메일 추가
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              평가자 이메일 목록
              <span className="text-xs text-gray-500 ml-2">
                (이메일을 쉼표, 세미콜론 또는 줄바꿈으로 구분)
              </span>
            </label>
            <textarea
              value={bulkEmail}
              onChange={(e) => setBulkEmail(e.target.value)}
              placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        )}

        {/* Custom Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            추가 메시지 (선택사항)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="평가자에게 전달할 메시지를 입력하세요..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Expiry Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            초대 유효 기간
          </label>
          <select
            value={expiryDays}
            onChange={(e) => setExpiryDays(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value={7}>7일</option>
            <option value={14}>14일</option>
            <option value={30}>30일</option>
            <option value={60}>60일</option>
            <option value={90}>90일</option>
          </select>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ul className="list-disc list-inside text-red-600 text-sm">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              초대 발송 중...
            </>
          ) : (
            <>
              <EnvelopeIcon className="h-5 w-5" />
              초대 발송
            </>
          )}
        </button>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">안내사항</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 평가자에게 이메일로 초대 링크가 발송됩니다.</li>
          <li>• 평가자는 초대 링크를 통해 평가에 참여할 수 있습니다.</li>
          <li>• 이미 초대된 평가자는 중복 초대되지 않습니다.</li>
          <li>• 초대 유효 기간이 지나면 자동으로 만료됩니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default InviteEvaluators;