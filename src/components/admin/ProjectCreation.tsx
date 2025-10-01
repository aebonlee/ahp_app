import React, { useState } from "react";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import EvaluationModeSelector, {
  EvaluationMode,
} from "../evaluation/EvaluationModeSelector";
import PaperWorkflowGuide from "../guide/PaperWorkflowGuide";

interface ProjectCreationProps {
  onProjectCreated: () => void;
  onCancel: () => void;
  loading?: boolean;
  createProject?: (projectData: {
    title: string;
    description: string;
    objective: string;
    evaluationMode: EvaluationMode;
    ahpType: "general" | "fuzzy";
  }) => Promise<any>;
}

const ProjectCreation: React.FC<ProjectCreationProps> = ({
  onProjectCreated,
  onCancel,
  loading = false,
  createProject,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    objective: "",
    evaluationMode: "practical" as EvaluationMode,
    ahpType: "general" as "general" | "fuzzy",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "프로젝트명을 입력해주세요.";
    } else if (formData.title.length < 2) {
      newErrors.title = "프로젝트명은 2자 이상이어야 합니다.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "프로젝트 설명을 입력해주세요.";
    } else if (formData.description.length < 10) {
      newErrors.description = "설명은 10자 이상 입력해주세요.";
    }

    if (!formData.objective.trim()) {
      newErrors.objective = "프로젝트 목표를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (createProject) {
        // 실제 프로젝트 생성 함수 호출
        await createProject(formData);

        // 성공 시 폼 초기화
        setFormData({
          title: "",
          description: "",
          objective: "",
          evaluationMode: "practical",
          ahpType: "general",
        });

        onProjectCreated();
      } else {
        // Fallback: 시뮬레이션
        console.log("Creating project with data:", formData);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onProjectCreated();
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      // 에러 메시지를 사용자에게 표시
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "프로젝트 생성에 실패했습니다.",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <>
      {showWorkflowGuide && (
        <PaperWorkflowGuide
          currentStep={1}
          criteriaCount={3}
          alternativesCount={3}
          onClose={() => setShowWorkflowGuide(false)}
        />
      )}
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            단계 1 — 프로젝트 추가
          </h1>
          <p className="text-gray-600">
            새로운 AHP 의사결정 분석 프로젝트를 생성합니다.
          </p>

          {/* 논문 작성 권장 구조 안내 */}
          <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-6 rounded-r-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-yellow-800">
                    📄 논문 작성 권장 구조
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p className="mb-2">
                      학술 논문 작성 시 <strong>3개 기준 × 3개 대안</strong>{" "}
                      구조를 권장합니다.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>명확한 연구 설계와 결과 해석이 용이</li>
                      <li>일관성 검증(CR ≤ 0.1) 충족 확률 향상</li>
                      <li>쌍대비교 횟수 최소화 (기준 3회, 대안 9회)</li>
                      <li>추가 기준/대안은 다음 단계에서 선택 가능</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 워크플로우 가이드 버튼 - 우측에 배치 */}
              <div className="ml-6 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowWorkflowGuide(true)}
                  className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-bold text-sm rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                  style={{
                    backgroundSize: "200% auto",
                    backgroundPosition: "0%",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundPosition = "100%")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundPosition = "0%")
                  }
                >
                  <span className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </span>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="flex flex-col items-start">
                    <span className="text-sm">📚 워크플로우 가이드</span>
                    <span className="text-xs opacity-90">
                      단계별 상세 안내 보기
                    </span>
                  </span>
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Card className="p-8 shadow-lg">
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <Input
                id="title"
                label="프로젝트명"
                placeholder="프로젝트 이름을 입력하세요"
                value={formData.title}
                onChange={(value) => handleInputChange("title", value)}
                error={errors.title}
                required
              />

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  프로젝트 설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="프로젝트에 대한 상세한 설명을 입력하세요"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  required
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <Input
                id="objective"
                label="프로젝트 목표"
                placeholder="이 프로젝트로 달성하고자 하는 목표를 입력하세요"
                value={formData.objective}
                onChange={(value) => handleInputChange("objective", value)}
                error={errors.objective}
                required
              />

              {/* AHP 분석 유형 선택 섹션 */}
              <div className="mt-10">
                <div className="mb-6">
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    AHP 분석 유형 선택 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600">
                    프로젝트에 적합한 분석 방법을 선택하세요
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* 일반 AHP 카드 */}
                  <button
                    type="button"
                    onClick={() => handleInputChange("ahpType", "general")}
                    className={`relative group transition-all duration-300 ${
                      formData.ahpType === "general"
                        ? "transform scale-[1.02]"
                        : "hover:transform hover:scale-[1.01]"
                    }`}
                  >
                    <div
                      className={`p-8 rounded-2xl h-full transition-all duration-300 ${
                        formData.ahpType === "general"
                          ? "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-2xl"
                          : "bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl"
                      }`}
                    >
                      {/* 선택됨 배지 */}
                      {formData.ahpType === "general" && (
                        <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          선택됨
                        </div>
                      )}

                      <div className="text-left space-y-4">
                        {/* 헤더 섹션 */}
                        <div className="flex items-start space-x-4">
                          <div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              formData.ahpType === "general"
                                ? "bg-white/20 backdrop-blur-sm"
                                : "bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100"
                            }`}
                          >
                            <span className="text-3xl">📊</span>
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`font-bold text-xl mb-1 ${
                                formData.ahpType === "general"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              일반 AHP
                            </h3>
                            <p
                              className={`text-sm ${
                                formData.ahpType === "general"
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              Standard AHP Method
                            </p>
                          </div>
                        </div>

                        {/* 설명 텍스트 */}
                        <p
                          className={`text-sm leading-relaxed ${
                            formData.ahpType === "general"
                              ? "text-white/90"
                              : "text-gray-600"
                          }`}
                        >
                          전통적인 쌍대비교 방법으로 명확한 의사결정을
                          지원합니다
                        </p>

                        {/* 특징 리스트 */}
                        <div className="space-y-3">
                          {[
                            "Saaty의 1-9 척도 사용",
                            "명확한 가중치 산출",
                            "일관성 검증 (CR ≤ 0.1)",
                          ].map((feature, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center space-x-3 text-sm ${
                                formData.ahpType === "general"
                                  ? "text-white/85"
                                  : "text-gray-600"
                              }`}
                            >
                              <svg
                                className={`w-5 h-5 flex-shrink-0 ${
                                  formData.ahpType === "general"
                                    ? "text-white/70"
                                    : "text-green-500"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* 추천 태그 */}
                        <div className="pt-2">
                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold ${
                              formData.ahpType === "general"
                                ? "bg-white/25 text-white backdrop-blur-sm"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            <span className="mr-1">👍</span>
                            입문자 추천
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* 퍼지 AHP 카드 */}
                  <button
                    type="button"
                    onClick={() => handleInputChange("ahpType", "fuzzy")}
                    className={`relative group transition-all duration-300 ${
                      formData.ahpType === "fuzzy"
                        ? "transform scale-[1.02]"
                        : "hover:transform hover:scale-[1.01]"
                    }`}
                  >
                    <div
                      className={`p-8 rounded-2xl h-full transition-all duration-300 ${
                        formData.ahpType === "fuzzy"
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl"
                          : "bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-xl"
                      }`}
                    >
                      {/* 선택됨 배지 */}
                      {formData.ahpType === "fuzzy" && (
                        <div className="absolute -top-3 -right-3 bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          선택됨
                        </div>
                      )}

                      <div className="text-left space-y-4">
                        {/* 헤더 섹션 */}
                        <div className="flex items-start space-x-4">
                          <div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              formData.ahpType === "fuzzy"
                                ? "bg-white/20 backdrop-blur-sm"
                                : "bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100"
                            }`}
                          >
                            <span className="text-3xl">🔮</span>
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`font-bold text-xl mb-1 ${
                                formData.ahpType === "fuzzy"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              퍼지 AHP
                            </h3>
                            <p
                              className={`text-sm ${
                                formData.ahpType === "fuzzy"
                                  ? "text-purple-100"
                                  : "text-gray-500"
                              }`}
                            >
                              Fuzzy AHP Method
                            </p>
                          </div>
                        </div>

                        {/* 설명 텍스트 */}
                        <p
                          className={`text-sm leading-relaxed ${
                            formData.ahpType === "fuzzy"
                              ? "text-white/90"
                              : "text-gray-600"
                          }`}
                        >
                          불확실성과 애매모호함을 수학적으로 처리하는 고급 분석
                          방법입니다
                        </p>

                        {/* 특징 리스트 */}
                        <div className="space-y-3">
                          {[
                            "삼각 퍼지수 활용",
                            "불확실성 범위 표현",
                            "민감도 분석 강화",
                          ].map((feature, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center space-x-3 text-sm ${
                                formData.ahpType === "fuzzy"
                                  ? "text-white/85"
                                  : "text-gray-600"
                              }`}
                            >
                              <svg
                                className={`w-5 h-5 flex-shrink-0 ${
                                  formData.ahpType === "fuzzy"
                                    ? "text-white/70"
                                    : "text-purple-500"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* 추천 태그 */}
                        <div className="pt-2">
                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold ${
                              formData.ahpType === "fuzzy"
                                ? "bg-white/25 text-white backdrop-blur-sm"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            <span className="mr-1">🎯</span>
                            전문가용
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {/* 선택된 유형에 대한 추가 정보 */}
                {formData.ahpType === "general" && (
                  <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="text-sm text-blue-800 leading-relaxed">
                        <strong className="font-semibold">
                          일반 AHP를 선택하셨습니다.
                        </strong>
                        <br />
                        가장 널리 사용되는 표준 방법으로, 명확한 수치 척도를
                        사용하여 의사결정의 일관성을 검증합니다. 처음 AHP를
                        사용하시는 분께 추천드립니다.
                      </div>
                    </div>
                  </div>
                )}

                {formData.ahpType === "fuzzy" && (
                  <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="text-sm text-purple-800 leading-relaxed">
                        <strong className="font-semibold">
                          퍼지 AHP를 선택하셨습니다.
                        </strong>
                        <br />
                        평가자 간 의견 차이가 크거나, 정성적 기준이 많은 경우,
                        불확실성이 높은 의사결정 문제에 적합합니다. 복잡한
                        의사결정 상황에서 더 정확한 분석이 가능합니다.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <EvaluationModeSelector
                  selectedMode={formData.evaluationMode}
                  onModeChange={(mode) =>
                    handleInputChange("evaluationMode", mode)
                  }
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
                <h4 className="font-medium text-blue-900 mb-4">
                  📋 프로젝트 생성 후 진행 단계
                </h4>
                <ol className="text-sm text-blue-700 space-y-2">
                  <li>
                    1️⃣ <strong>평가 기준 설정</strong> (기본 3개, 필요시 추가
                    가능)
                  </li>
                  <li>
                    2️⃣ <strong>대안 설정</strong> (기본 3개, 필요시 추가 가능)
                  </li>
                  <li>
                    3️⃣ <strong>평가자 배정</strong> (선택사항, 다중 평가자 지원)
                  </li>
                  <li>
                    4️⃣ <strong>쌍대비교 평가</strong> (
                    {formData.ahpType === "general" ? "일반" : "퍼지"} AHP)
                  </li>
                  <li>
                    5️⃣ <strong>결과 분석 및 검증</strong> (CR, 가중치,{" "}
                    {formData.ahpType === "fuzzy" ? "불확실성 범위" : "민감도"}{" "}
                    확인)
                  </li>
                </ol>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    💡 <strong>선택된 분석 유형:</strong>{" "}
                    {formData.ahpType === "general"
                      ? "일반 AHP - 명확한 가중치와 순위 결정"
                      : "퍼지 AHP - 불확실성을 고려한 강건한 분석"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-6 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={loading}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                >
                  프로젝트 추가
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            프로젝트 추가 성공 시 단계 2로 자동 이동됩니다.
          </p>
        </div>
      </div>
    </>
  );
};

export default ProjectCreation;
