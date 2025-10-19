import React, { useState } from 'react';
import Card from '../common/Card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');

  // 샘플 데이터
  const monthlyData = [
    { month: '1월', projects: 4, evaluations: 28, evaluators: 12 },
    { month: '2월', projects: 6, evaluations: 45, evaluators: 18 },
    { month: '3월', projects: 5, evaluations: 38, evaluators: 15 },
    { month: '4월', projects: 8, evaluations: 62, evaluators: 24 },
    { month: '5월', projects: 7, evaluations: 55, evaluators: 21 },
    { month: '6월', projects: 9, evaluations: 71, evaluators: 27 }
  ];

  const projectTypeData = [
    { name: '제품 개발', value: 35, color: '#3b82f6' },
    { name: '공급업체 선정', value: 25, color: '#10b981' },
    { name: '전략 수립', value: 20, color: '#f59e0b' },
    { name: '인사 평가', value: 15, color: '#8b5cf6' },
    { name: '기타', value: 5, color: '#6b7280' }
  ];

  const evaluationMetrics = {
    totalProjects: 42,
    totalEvaluations: 328,
    averageConsistency: 0.087,
    completionRate: 89.5,
    averageEvaluators: 7.8,
    averageCompletionTime: '4.2일'
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            분석 대시보드
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            marginTop: '0.5rem'
          }}>
            프로젝트 성과와 평가 통계를 확인하세요
          </p>
        </div>
        
        {/* 기간 선택 */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid var(--border-default)',
            borderRadius: '0.5rem',
            backgroundColor: 'var(--bg-primary)',
            fontSize: '0.875rem'
          }}
        >
          <option value="week">최근 1주</option>
          <option value="month">최근 1개월</option>
          <option value="quarter">최근 3개월</option>
          <option value="year">최근 1년</option>
        </select>
      </div>

      {/* 핵심 지표 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <Card variant="elevated">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              총 프로젝트
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {evaluationMetrics.totalProjects}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              +12% 전월 대비
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              총 평가 수
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {evaluationMetrics.totalEvaluations}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              +28% 전월 대비
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              평균 일관성 비율
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {evaluationMetrics.averageConsistency}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              우수 (&lt; 0.1)
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              완료율
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {evaluationMetrics.completionRate}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              +5% 개선
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              평균 평가자 수
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899' }}>
              {evaluationMetrics.averageEvaluators}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              명/프로젝트
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              평균 완료 시간
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>
              {evaluationMetrics.averageCompletionTime}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              -1.2일 단축
            </div>
          </div>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* 월별 추세 차트 */}
        <Card title="월별 활동 추세" variant="elevated">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="projects" stroke="#3b82f6" name="프로젝트" strokeWidth={2} />
              <Line type="monotone" dataKey="evaluations" stroke="#10b981" name="평가" strokeWidth={2} />
              <Line type="monotone" dataKey="evaluators" stroke="#f59e0b" name="평가자" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* 프로젝트 유형별 분포 */}
        <Card title="프로젝트 유형별 분포" variant="elevated">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {projectTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 최근 활동 */}
      <Card title="최근 활동" variant="elevated" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { time: '2시간 전', action: '신제품 개발 우선순위 평가', type: '평가 완료', icon: '✅' },
            { time: '5시간 전', action: '공급업체 선정 프로젝트', type: '평가자 초대', icon: '📧' },
            { time: '1일 전', action: '마케팅 전략 우선순위', type: '프로젝트 생성', icon: '📋' },
            { time: '2일 전', action: '2024 Q1 전략 평가', type: '결과 보고서 생성', icon: '📊' },
            { time: '3일 전', action: '인사 평가 시스템', type: '평가 시작', icon: '🚀' }
          ].map((activity, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '0.5rem'
            }}>
              <div style={{
                fontSize: '1.5rem',
                marginRight: '1rem'
              }}>
                {activity.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem'
                }}>
                  {activity.action}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}>
                  {activity.type} • {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;