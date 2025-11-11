import React, { useState, useEffect } from 'react';
import { useDemographicSurvey, aggregateDemographicData, exportDemographicData } from '../../hooks/useDemographicSurvey';
import Card from '../common/Card';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  AcademicCapIcon,
  BriefcaseIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface DemographicDashboardProps {
  projectId: string;
  showExport?: boolean;
  showDetails?: boolean;
}

const DemographicDashboard: React.FC<DemographicDashboardProps> = ({
  projectId,
  showExport = true,
  showDetails = true
}) => {
  const { stats, loading, refreshStats } = useDemographicSurvey({ projectId });
  const [selectedView, setSelectedView] = useState<'overview' | 'gender' | 'education' | 'experience'>('overview');
  const [allResponses, setAllResponses] = useState<any[]>([]);

  // 모든 응답 데이터 로드
  useEffect(() => {
    const loadAllResponses = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/demographics/all/`);
        const data = await response.json();
        setAllResponses(data);
      } catch (error) {
        console.error('응답 데이터 로드 실패:', error);
      }
    };

    if (projectId) {
      loadAllResponses();
    }
  }, [projectId]);

  // 색상 팔레트
  const colors = {
    gender: {
      male: '#3B82F6',
      female: '#EC4899',
      other: '#8B5CF6',
      'prefer-not': '#6B7280'
    },
    education: {
      'high-school': '#F59E0B',
      bachelor: '#10B981',
      master: '#3B82F6',
      phd: '#8B5CF6',
      other: '#6B7280'
    },
    experience: {
      'less-1': '#EF4444',
      '1-3': '#F59E0B',
      '3-5': '#10B981',
      '5-10': '#3B82F6',
      'more-10': '#8B5CF6'
    }
  };

  // 라벨 매핑
  const labels = {
    gender: {
      male: '남성',
      female: '여성',
      other: '기타',
      'prefer-not': '응답 거부'
    },
    education: {
      'high-school': '고등학교',
      bachelor: '학사',
      master: '석사',
      phd: '박사',
      other: '기타'
    },
    experience: {
      'less-1': '1년 미만',
      '1-3': '1-3년',
      '3-5': '3-5년',
      '5-10': '5-10년',
      'more-10': '10년 이상'
    }
  };

  // 차트 바 렌더링
  const renderBarChart = (data: Record<string, number>, type: 'gender' | 'education' | 'experience') => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => {
          const percentage = total > 0 ? (value / total) * 100 : 0;
          const color = colors[type][key as keyof typeof colors[typeof type]] || '#6B7280';
          const label = labels[type][key as keyof typeof labels[typeof type]] || key;
          
          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-sm text-gray-500">
                  {value}명 ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div 
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: color,
                    minWidth: percentage > 0 ? '40px' : '0'
                  }}
                >
                  {percentage > 5 && `${percentage.toFixed(0)}%`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 통계 카드 컴포넌트
  const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 수집된 인구통계 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          📊 인구통계 분석 대시보드
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={refreshStats}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>새로고침</span>
          </button>
          {showExport && allResponses.length > 0 && (
            <>
              <button
                onClick={() => exportDemographicData(allResponses, 'json')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => exportDemographicData(allResponses, 'csv')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>CSV</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={UserGroupIcon}
          title="총 응답자"
          value={stats.totalResponses}
          subtitle="참여자 수"
          color="text-blue-600"
        />
        <StatCard
          icon={ChartBarIcon}
          title="완료율"
          value={`${stats.completionRate}%`}
          subtitle="필수 항목 작성률"
          color="text-green-600"
        />
        <StatCard
          icon={AcademicCapIcon}
          title="평균 학력"
          value={
            stats.educationDistribution && 
            Object.entries(stats.educationDistribution)
              .reduce((max, [key, val]) => val > (max[1] || 0) ? [key, val] : max, ['', 0])[0]
              ? labels.education[Object.entries(stats.educationDistribution)
                  .reduce((max, [key, val]) => val > (max[1] || 0) ? [key, val] : max, ['', 0])[0] as keyof typeof labels.education]
              : 'N/A'
          }
          subtitle="최빈값"
          color="text-purple-600"
        />
        <StatCard
          icon={BriefcaseIcon}
          title="평균 경력"
          value={
            stats.experienceDistribution &&
            Object.entries(stats.experienceDistribution)
              .reduce((max, [key, val]) => val > (max[1] || 0) ? [key, val] : max, ['', 0])[0]
              ? labels.experience[Object.entries(stats.experienceDistribution)
                  .reduce((max, [key, val]) => val > (max[1] || 0) ? [key, val] : max, ['', 0])[0] as keyof typeof labels.experience]
              : 'N/A'
          }
          subtitle="최빈값"
          color="text-orange-600"
        />
      </div>

      {showDetails && (
        <>
          {/* 탭 네비게이션 */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['overview', 'gender', 'education', 'experience'].map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedView === view
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {view === 'overview' ? '전체 현황' :
                   view === 'gender' ? '성별 분포' :
                   view === 'education' ? '학력 분포' : '경력 분포'}
                </button>
              ))}
            </nav>
          </div>

          {/* 상세 차트 */}
          <Card>
            <div className="p-6">
              {selectedView === 'overview' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.genderDistribution && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-4">성별 분포</h4>
                      {renderBarChart(stats.genderDistribution, 'gender')}
                    </div>
                  )}
                  {stats.educationDistribution && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-4">학력 분포</h4>
                      {renderBarChart(stats.educationDistribution, 'education')}
                    </div>
                  )}
                  {stats.experienceDistribution && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-4">경력 분포</h4>
                      {renderBarChart(stats.experienceDistribution, 'experience')}
                    </div>
                  )}
                </div>
              ) : selectedView === 'gender' && stats.genderDistribution ? (
                <div className="max-w-2xl mx-auto">
                  <h4 className="font-medium text-gray-700 mb-6">성별 분포 상세</h4>
                  {renderBarChart(stats.genderDistribution, 'gender')}
                </div>
              ) : selectedView === 'education' && stats.educationDistribution ? (
                <div className="max-w-2xl mx-auto">
                  <h4 className="font-medium text-gray-700 mb-6">학력 분포 상세</h4>
                  {renderBarChart(stats.educationDistribution, 'education')}
                </div>
              ) : selectedView === 'experience' && stats.experienceDistribution ? (
                <div className="max-w-2xl mx-auto">
                  <h4 className="font-medium text-gray-700 mb-6">경력 분포 상세</h4>
                  {renderBarChart(stats.experienceDistribution, 'experience')}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  해당 데이터가 없습니다.
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* 추가 정보 */}
      {stats.totalResponses > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <ChartBarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">분석 인사이트</p>
              <p className="text-sm text-blue-700 mt-1">
                총 {stats.totalResponses}명의 응답자가 참여했으며, 
                {stats.completionRate >= 80 ? ' 높은 완료율을 보이고 있습니다.' :
                 stats.completionRate >= 60 ? ' 적절한 완료율을 보이고 있습니다.' :
                 ' 완료율 향상이 필요합니다.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemographicDashboard;