import React, { useState } from 'react';

interface EnhancedDemographicSurveyProps {
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

const EnhancedDemographicSurvey: React.FC<EnhancedDemographicSurveyProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    // 기본 정보
    age: '',
    gender: '',
    education: '',
    occupation: '',
    
    // 전문 정보
    experience: '',
    department: '',
    position: '',
    projectExperience: '',
    
    // 3가지 선택 기능들
    expertiseLevel: '', // 전문성 수준 (초급/중급/고급)
    researchAreas: [] as string[], // 관심 연구 분야 (최대 3개 선택)
    decisionRole: '', // 의사결정 역할
    
    // 추가 정보
    additionalInfo: '',
    
    // 새로운 선택 기능들
    ahpExperience: '', // AHP 경험 정도
    softwareTools: [] as string[], // 사용 가능한 소프트웨어 도구
    projectTypes: [] as string[], // 참여 가능한 프로젝트 유형
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (category: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[category as keyof typeof prev] as string[];
      const updated = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      // 최대 3개 선택 제한
      if (updated.length > 3) {
        return prev;
      }
      
      return {
        ...prev,
        [category]: updated
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  const researchAreaOptions = [
    '경영과학/운영연구', '의사결정이론', '시스템분석', '품질관리',
    '공급망관리', '프로젝트관리', '위험분석', '성과평가',
    '정책분석', '기술평가', '환경평가', '투자분석'
  ];

  const softwareToolOptions = [
    'Expert Choice', 'Super Decisions', 'Excel/Spreadsheet', 'R/Python',
    'MATLAB', 'SPSS', 'Custom AHP Software', 'Web-based AHP Tools'
  ];

  const projectTypeOptions = [
    '학술 연구', '정책 의사결정', '기업 전략 수립', '기술 평가',
    '투자 분석', '공급업체 선정', '성과 평가', '위험 분석'
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/60 shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            📊 고급 인구통계학적 설문조사
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            AHP 연구 및 의사결정 분석을 위한 전문가 프로필 조사
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 섹션 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
              <span className="text-2xl mr-3">👤</span>
              기본 정보
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
                  연령대
                </label>
                <select 
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
                  성별
                </label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">선택하세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                  <option value="prefer-not">응답하지 않음</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
                  최종 학력
                </label>
                <select 
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
                  직업/소속
                </label>
                <input 
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  placeholder="예: 대학교수, 연구원, 컨설턴트"
                  className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  style={{ backgroundColor: 'var(--bg-surface)' }}
                />
              </div>
            </div>
          </div>

          {/* 전문성 수준 선택 (3가지 선택 #1) */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
              <span className="text-2xl mr-3">🎯</span>
              전문성 수준 (3단계 선택)
            </h3>
            
            <div>
              <label className="block text-sm font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
                AHP 및 의사결정 분석 전문성 수준
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'beginner', label: '초급자', desc: '기본 개념 이해 단계' },
                  { value: 'intermediate', label: '중급자', desc: '실무 적용 경험 보유' },
                  { value: 'advanced', label: '고급자', desc: '전문적 연구/컨설팅 경험' }
                ].map((level) => (
                  <label
                    key={level.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      formData.expertiseLevel === level.value
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="expertiseLevel"
                      value={level.value}
                      checked={formData.expertiseLevel === level.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="font-semibold text-lg">{level.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{level.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 관심 연구 분야 (3가지 선택 #2) */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
              <span className="text-2xl mr-3">🔬</span>
              관심 연구 분야 (최대 3개 선택)
            </h3>
            
            <div>
              <label className="block text-sm font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
                귀하의 전문 분야나 관심 영역을 최대 3개까지 선택해주세요
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {researchAreaOptions.map((area) => (
                  <label
                    key={area}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center text-sm ${
                      formData.researchAreas.includes(area)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.researchAreas.includes(area)}
                      onChange={() => handleCheckboxChange('researchAreas', area)}
                      className="sr-only"
                    />
                    {area}
                  </label>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                선택됨: {formData.researchAreas.length}/3
              </div>
            </div>
          </div>

          {/* 소프트웨어 도구 경험 (3가지 선택 #3) */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
              <span className="text-2xl mr-3">💻</span>
              소프트웨어 도구 경험 (최대 3개 선택)
            </h3>
            
            <div>
              <label className="block text-sm font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
                사용 경험이 있는 AHP 분석 도구를 선택해주세요
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {softwareToolOptions.map((tool) => (
                  <label
                    key={tool}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center text-sm ${
                      formData.softwareTools.includes(tool)
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.softwareTools.includes(tool)}
                      onChange={() => handleCheckboxChange('softwareTools', tool)}
                      className="sr-only"
                    />
                    {tool}
                  </label>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                선택됨: {formData.softwareTools.length}/3
              </div>
            </div>
          </div>

          {/* 의사결정 역할 */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
              <span className="text-2xl mr-3">👑</span>
              의사결정 역할
            </h3>
            
            <div>
              <label className="block text-sm font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
                프로젝트에서의 주요 역할
              </label>
              <select 
                name="decisionRole"
                value={formData.decisionRole}
                onChange={handleInputChange}
                className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              >
                <option value="">선택하세요</option>
                <option value="decision-maker">최종 의사결정권자</option>
                <option value="advisor">자문/조언자</option>
                <option value="analyst">분석가/연구자</option>
                <option value="evaluator">평가자</option>
                <option value="facilitator">진행자/조정자</option>
                <option value="observer">관찰자/학습자</option>
              </select>
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center" style={{ color: 'var(--text-primary)' }}>
              <span className="text-2xl mr-3">📝</span>
              추가 정보
            </h3>
            
            <div>
              <label className="block text-sm font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
                특별한 전문 분야나 본 연구와 관련된 추가 정보가 있다면 자유롭게 기술해주세요
              </label>
              <textarea 
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                rows={5}
                placeholder="예: 특정 산업 분야 전문성, 관련 연구 경험, 기대하는 연구 결과 활용 방안 등"
                className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              />
            </div>
          </div>

          {/* 버튼 섹션 */}
          <div className="flex justify-end space-x-6 pt-8 border-t-2 border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-4 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300 font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                취소
              </button>
            )}
            <button
              type="submit"
              className="px-8 py-4 rounded-lg text-white transition-all duration-300 font-semibold transform hover:scale-105"
              style={{ backgroundColor: 'var(--accent-primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-secondary)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              💾 설문 결과 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedDemographicSurvey;