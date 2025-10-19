// Centralized error/toast messages for AHP system

export const MESSAGES = {
  // Pairwise Comparison CR Warning
  CR_WARNING: "비일관성비율이 0.1보다 큽니다. '판단 도우미'를 참고하여 수정해 주세요.",
  
  // Direct Input (Cost Type) Warning
  COST_TYPE_WARNING: "낮을수록 좋은 값입니다. '여기를' 클릭하여 역수 값을 적용하세요.",
  
  // Sensitivity/Integration Results Save Warning
  RESULTS_NOT_SAVED: "이 화면의 결과는 서버에 저장되지 않습니다. 캡처 또는 Excel 저장으로 보관하세요.",
  
  // Workshop Access Restriction (Evaluator)
  WORKSHOP_ACCESS_RESTRICTED: "관리자가 워크숍을 진행하는 중에만 접속할 수 있습니다.",
  
  // Additional common messages
  SAVE_WARNING: "표시된 평가결과는 DB에 저장되지 않으니 Excel 저장 단추로 별도 저장하세요.",
  CAPTURE_RECOMMENDED: "서버 미저장, 캡처 권장"
} as const;

export type MessageKey = keyof typeof MESSAGES;