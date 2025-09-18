// Label consistency checklist for capture 1:1 mapping verification

export interface LabelCheckItem {
  screenId: string;
  category: 'title' | 'button' | 'badge' | 'message';
  element: string;
  expectedText: string;
  location: string;
  verified?: boolean;
  actualText?: string;
  notes?: string;
}

export const LABEL_CHECKLIST: LabelCheckItem[] = [
  // Sensitivity Analysis Screen
  {
    screenId: 'ADMIN-STEP3-SENS',
    category: 'title',
    element: 'Main Title',
    expectedText: '서브 기능 2) 민감도 분석',
    location: 'Card title',
  },
  {
    screenId: 'ADMIN-STEP3-SENS',
    category: 'badge',
    element: 'Warning Badge',
    expectedText: '서버 미저장, 캡처 권장',
    location: 'Top warning badge',
  },
  {
    screenId: 'ADMIN-STEP3-SENS',
    category: 'button',
    element: 'Analysis Start Button',
    expectedText: '④ 분석 시작',
    location: 'Analysis section',
  },
  {
    screenId: 'ADMIN-STEP3-SENS',
    category: 'button',
    element: 'Result Capture Button',
    expectedText: '결과 캡처',
    location: 'Results section',
  },

  // Group Weight Analysis Screen  
  {
    screenId: 'ADMIN-STEP3-WEIGHTS',
    category: 'title',
    element: 'Main Title',
    expectedText: '그룹별 가중치 도출',
    location: 'Card title',
  },
  {
    screenId: 'ADMIN-STEP3-WEIGHTS',
    category: 'title',
    element: 'Subtitle',
    expectedText: '평가자 별 가중치 조정 / 일부 평가자의 통합 결과 산출',
    location: 'Blue info panel',
  },
  {
    screenId: 'ADMIN-STEP3-WEIGHTS',
    category: 'button',
    element: 'Results Button',
    expectedText: '결과보기',
    location: 'Evaluator selection section',
  },
  {
    screenId: 'ADMIN-STEP3-WEIGHTS',
    category: 'message',
    element: 'Save Notice',
    expectedText: '표시된 평가결과는 DB에 저장되지 않으니 Excel 저장 단추로 별도 저장하세요',
    location: 'Yellow warning panel',
  },
  {
    screenId: 'ADMIN-STEP3-WEIGHTS',
    category: 'button',
    element: 'Excel Save Button',
    expectedText: 'Excel 저장',
    location: 'Save section',
  },

  // Pairwise Comparison Screen
  {
    screenId: 'RATER-PAIRWISE',
    category: 'message',
    element: 'CR Warning',
    expectedText: '비일관성비율이 0.1보다 큽니다. \'판단 도우미\'를 참고하여 수정해 주세요.',
    location: 'CR warning panel when CR > 0.1',
  },
  {
    screenId: 'RATER-PAIRWISE',
    category: 'button',
    element: 'Judgment Helper Link',
    expectedText: '판단 도우미 보기',
    location: 'CR warning panel',
  },

  // Direct Input Screen
  {
    screenId: 'RATER-DIRECT',
    category: 'message',
    element: 'Cost Type Warning',
    expectedText: '낮을수록 좋은 값입니다. \'여기를\' 클릭하여 역수 값을 적용하세요.',
    location: 'Cost type warning panel',
  },
  {
    screenId: 'RATER-DIRECT',
    category: 'button',
    element: 'Apply Inverse Link',
    expectedText: '여기를',
    location: 'Cost type warning',
  },

  // Project Selection Screen
  {
    screenId: 'RATER-PROJ-SELECT',
    category: 'title',
    element: 'Main Title',
    expectedText: '단계 1 — 프로젝트 선택',
    location: 'Page header',
  },
  {
    screenId: 'RATER-PROJ-SELECT',
    category: 'message',
    element: 'Workshop Restriction',
    expectedText: '관리자가 워크숍을 진행하는 중에만 접속할 수 있습니다.',
    location: 'Workshop warning message',
  },
  {
    screenId: 'RATER-PROJ-SELECT',
    category: 'badge',
    element: 'Workshop Active Badge',
    expectedText: '워크숍 진행중',
    location: 'Project card badge',
  },
  {
    screenId: 'RATER-PROJ-SELECT',
    category: 'badge',
    element: 'Workshop Waiting Badge',
    expectedText: '워크숍 대기중',
    location: 'Project card badge',
  },
];

export const verifyLabel = (screenId: string, element: string, actualText: string): boolean => {
  const item = LABEL_CHECKLIST.find(item => 
    item.screenId === screenId && item.element === element
  );
  
  if (!item) return false;
  
  return item.expectedText === actualText;
};

export const getExpectedLabel = (screenId: string, element: string): string | null => {
  const item = LABEL_CHECKLIST.find(item => 
    item.screenId === screenId && item.element === element
  );
  
  return item ? item.expectedText : null;
};