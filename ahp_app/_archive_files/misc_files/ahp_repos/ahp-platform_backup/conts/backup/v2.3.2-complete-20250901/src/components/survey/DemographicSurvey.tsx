import React, { useState } from 'react';

interface DemographicSurveyProps {
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

const DemographicSurvey: React.FC<DemographicSurveyProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    education: '',
    occupation: '',
    experience: '',
    department: '',
    position: '',
    projectExperience: '',
    decisionRole: '',
    additionalInfo: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/60 shadow-lg">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          📊 인구통계학적 설문조사
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              기본 정보
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  연령대
                </label>
                <select 
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">선택하세요</option>
                  <option value="20s">20대</option>
                  <option value="30s">30대</option>
                  <option value="40s">40대</option>
                  <option value="50s">50대</option>
                  <option value="60s">60대 이상</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  성별
                </label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">선택하세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                  <option value="prefer-not">응답하지 않음</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  최종 학력
                </label>
                <select 
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">선택하세요</option>
                  <option value="high-school">고등학교 졸업</option>
                  <option value="bachelor">학사</option>
                  <option value="master">석사</option>
                  <option value="phd">박사</option>
                  <option value="other">기타</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  직업
                </label>
                <input 
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  placeholder="예: 소프트웨어 엔지니어"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                />
              </div>
            </div>
          </div>

          {/* 전문 정보 섹션 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              전문 정보
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  해당 분야 경력
                </label>
                <select 
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">선택하세요</option>
                  <option value="less-1">1년 미만</option>
                  <option value="1-3">1-3년</option>
                  <option value="3-5">3-5년</option>
                  <option value="5-10">5-10년</option>
                  <option value="more-10">10년 이상</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  소속 부서
                </label>
                <input 
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="예: 연구개발부"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  직급/직책
                </label>
                <input 
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="예: 선임연구원"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  AHP 프로젝트 경험
                </label>
                <select 
                  name="projectExperience"
                  value={formData.projectExperience}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">선택하세요</option>
                  <option value="none">없음</option>
                  <option value="1-2">1-2회</option>
                  <option value="3-5">3-5회</option>
                  <option value="more-5">5회 이상</option>
                </select>
              </div>
            </div>
          </div>

          {/* 의사결정 역할 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              의사결정 역할
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                프로젝트에서의 역할
              </label>
              <select 
                name="decisionRole"
                value={formData.decisionRole}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              >
                <option value="">선택하세요</option>
                <option value="decision-maker">최종 의사결정권자</option>
                <option value="advisor">자문/조언자</option>
                <option value="analyst">분석가</option>
                <option value="evaluator">평가자</option>
                <option value="observer">관찰자</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                추가 정보 (선택사항)
              </label>
              <textarea 
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                rows={4}
                placeholder="프로젝트와 관련된 추가 정보나 특별한 전문 분야가 있다면 입력해주세요."
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              />
            </div>
          </div>

          {/* 버튼 섹션 */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                취소
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-3 rounded-lg text-white transition-all duration-300"
              style={{ backgroundColor: 'var(--accent-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-secondary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemographicSurvey;