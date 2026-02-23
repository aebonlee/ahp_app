/**
 * PSDEvaluationTestTab - 평가 테스트 탭 컴포넌트
 * PersonalServiceDashboard에서 분리됨
 */
import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import type { UserProject } from '../../types';

interface PSDEvaluationTestTabProps {
  projects: UserProject[];
}

const PSDEvaluationTestTab: React.FC<PSDEvaluationTestTabProps> = ({ projects }) => (
  <div className="space-y-6">
    <div className="text-center py-8">
      <div className="mb-6">
        <div
          className="w-24 h-24 mx-auto rounded-full border-4 border-dashed flex items-center justify-center mb-4"
          style={{ borderColor: 'var(--accent-primary)' }}
        >
          <span className="text-4xl">🧪</span>
        </div>
        <h3
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          평가 테스트
        </h3>
        <p
          className="text-lg"
          style={{ color: 'var(--text-secondary)' }}
        >
          실제 평가 환경에서 테스트를 진행해보세요
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 테스트 프로젝트 선택 */}
          <Card
            title="테스트 프로젝트"
            icon="📋"
            className="p-6"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--accent-primary)'
            }}
          >
            <div className="space-y-4">
              <p
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                테스트할 프로젝트를 선택하세요
              </p>
              <select
                className="w-full p-3 rounded-lg border-2"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-elevated)'
                }}
              >
                <option value="">프로젝트 선택...</option>
                {(projects || []).filter(p => (p.criteria_count || 0) >= 3 && (p.alternatives_count || 0) >= 2).map((project, index) => (
                  <option key={index} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* 평가자 역할 선택 */}
          <Card
            title="평가자 역할"
            icon="👤"
            className="p-6"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--accent-secondary)'
            }}
          >
            <div className="space-y-4">
              <p
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                테스트할 평가자 역할을 선택하세요
              </p>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="evaluator-role"
                    value="expert"
                    className="form-radio"
                  />
                  <span className="text-sm">전문가 평가자</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="evaluator-role"
                    value="stakeholder"
                    className="form-radio"
                  />
                  <span className="text-sm">이해관계자</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="evaluator-role"
                    value="general"
                    className="form-radio"
                  />
                  <span className="text-sm">일반 평가자</span>
                </label>
              </div>
            </div>
          </Card>

          {/* 테스트 모드 설정 */}
          <Card
            title="테스트 모드"
            icon="⚙️"
            className="p-6"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--status-info-bg)'
            }}
          >
            <div className="space-y-4">
              <p
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                테스트 환경을 설정하세요
              </p>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                  />
                  <span className="text-sm">일관성 검증 활성화</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    defaultChecked
                  />
                  <span className="text-sm">진행률 표시</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                  />
                  <span className="text-sm">자동 저장</span>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* 테스트 시작 버튼 */}
        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            className="px-12 py-4 text-lg font-bold"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'white'
            }}
          >
            🚀 평가 테스트 시작
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-semibold mb-1">쌍대비교 평가</h4>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                실제 평가 화면에서 비교 진행
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold mb-1">실시간 결과</h4>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                평가 중 실시간 순위 확인
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <div className="text-2xl mb-2">✅</div>
              <h4 className="font-semibold mb-1">일관성 검증</h4>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                평가 품질 자동 검증
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default React.memo(PSDEvaluationTestTab);
