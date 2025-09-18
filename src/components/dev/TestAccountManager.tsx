import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { createAllTestAccounts, testLogin, testAccounts, TestAccount } from '../../utils/createTestAccounts';

const TestAccountManager: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<Array<{ account: string; success: boolean; message: string }>>([]);
  const [loginResults, setLoginResults] = useState<Array<{ account: string; success: boolean; message: string }>>([]);

  const handleCreateAccounts = async () => {
    setIsCreating(true);
    setResults([]);
    
    try {
      const result = await createAllTestAccounts();
      setResults(result.results);
    } catch (error) {
      console.error('Test account creation error:', error);
      setResults([{
        account: 'system',
        success: false,
        message: '테스트 계정 생성 중 오류가 발생했습니다.'
      }]);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTestLogins = async () => {
    setIsTesting(true);
    setLoginResults([]);
    
    const testResults = [];
    
    for (const account of testAccounts) {
      try {
        const result = await testLogin(account.username, account.password);
        testResults.push({
          account: account.username,
          success: result.success,
          message: result.message
        });
      } catch (error) {
        testResults.push({
          account: account.username,
          success: false,
          message: '로그인 테스트 중 오류 발생'
        });
      }
      
      // 각 로그인 테스트 사이에 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setLoginResults(testResults);
    setIsTesting(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Card title="🛠️ 개발자 도구 - 테스트 계정 관리" variant="elevated">
        <div style={{ display: 'grid', gap: '2rem' }}>
          
          {/* 테스트 계정 정보 */}
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              marginBottom: '1rem' 
            }}>
              📋 테스트 계정 목록
            </h3>
            
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {testAccounts.map((account, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{account.first_name} {account.last_name}</strong>
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        ({account.user_type})
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {account.username} / {account.password}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 계정 생성 섹션 */}
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              marginBottom: '1rem' 
            }}>
              🏗️ 테스트 계정 생성
            </h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <Button
                variant="primary"
                onClick={handleCreateAccounts}
                loading={isCreating}
                disabled={isCreating}
              >
                {isCreating ? '생성 중...' : '모든 테스트 계정 생성'}
              </Button>
            </div>
            
            {results.length > 0 && (
              <div style={{ 
                padding: '1rem', 
                backgroundColor: 'var(--bg-elevated)', 
                borderRadius: '0.5rem',
                marginTop: '1rem'
              }}>
                <h4 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  marginBottom: '0.75rem',
                  color: 'var(--text-primary)'
                }}>
                  생성 결과:
                </h4>
                {results.map((result, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      backgroundColor: result.success ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`,
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <span style={{ 
                      marginRight: '0.5rem',
                      fontSize: '1rem'
                    }}>
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span style={{ fontWeight: '500', marginRight: '0.5rem' }}>
                      {result.account}:
                    </span>
                    <span style={{ color: result.success ? '#059669' : '#dc2626' }}>
                      {result.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 로그인 테스트 섹션 */}
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              marginBottom: '1rem' 
            }}>
              🔐 로그인 테스트
            </h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <Button
                variant="secondary"
                onClick={handleTestLogins}
                loading={isTesting}
                disabled={isTesting}
              >
                {isTesting ? '테스트 중...' : '모든 계정 로그인 테스트'}
              </Button>
            </div>
            
            {loginResults.length > 0 && (
              <div style={{ 
                padding: '1rem', 
                backgroundColor: 'var(--bg-elevated)', 
                borderRadius: '0.5rem',
                marginTop: '1rem'
              }}>
                <h4 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  marginBottom: '0.75rem',
                  color: 'var(--text-primary)'
                }}>
                  로그인 테스트 결과:
                </h4>
                {loginResults.map((result, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      backgroundColor: result.success ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`,
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <span style={{ 
                      marginRight: '0.5rem',
                      fontSize: '1rem'
                    }}>
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span style={{ fontWeight: '500', marginRight: '0.5rem' }}>
                      {result.account}:
                    </span>
                    <span style={{ color: result.success ? '#059669' : '#dc2626' }}>
                      {result.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 주의사항 */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: '600',
              color: '#92400e',
              marginBottom: '0.5rem'
            }}>
              <span style={{ marginRight: '0.5rem' }}>⚠️</span>
              주의사항
            </div>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '1rem',
              color: '#92400e'
            }}>
              <li>이 도구는 개발 환경에서만 사용해주세요.</li>
              <li>테스트 계정이 이미 존재하는 경우 생성이 실패할 수 있습니다.</li>
              <li>Django 백엔드가 실행 중이어야 정상 작동합니다.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TestAccountManager;