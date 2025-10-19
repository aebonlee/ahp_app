import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ko' | 'en' | 'ja' | 'zh';

interface Translation {
  [key: string]: string | Translation;
}

interface Translations {
  [key: string]: Translation;
}

const translations: Translations = {
  ko: {
    common: {
      save: '저장',
      cancel: '취소',
      edit: '편집',
      delete: '삭제',
      search: '검색',
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      success: '성공적으로 완료되었습니다',
      confirm: '확인',
      back: '뒤로',
      next: '다음',
      previous: '이전',
      close: '닫기',
      open: '열기'
    },
    navigation: {
      dashboard: '대시보드',
      projects: '프로젝트',
      evaluation: '평가',
      results: '결과',
      settings: '설정',
      logout: '로그아웃'
    },
    ahp: {
      title: 'AHP 의사결정 시스템',
      pairwiseComparison: '쌍대비교',
      criteria: '기준',
      alternatives: '대안',
      consistency: '일관성',
      consistencyRatio: '일관성 비율',
      weights: '가중치',
      finalResult: '최종 결과'
    },
    workshop: {
      title: '워크숍 관리',
      planning: '계획 수립',
      facilitation: '진행 관리',
      results: '결과 분석',
      participants: '참가자',
      facilitator: '진행자',
      consensus: '합의도',
      status: '상태'
    },
    admin: {
      userManagement: '사용자 관리',
      systemSettings: '시스템 설정',
      securityMonitoring: '보안 모니터링',
      systemLogs: '시스템 로그',
      subscriptionManagement: '구독 관리'
    }
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Successfully completed',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      open: 'Open'
    },
    navigation: {
      dashboard: 'Dashboard',
      projects: 'Projects',
      evaluation: 'Evaluation',
      results: 'Results',
      settings: 'Settings',
      logout: 'Logout'
    },
    ahp: {
      title: 'AHP Decision Support System',
      pairwiseComparison: 'Pairwise Comparison',
      criteria: 'Criteria',
      alternatives: 'Alternatives',
      consistency: 'Consistency',
      consistencyRatio: 'Consistency Ratio',
      weights: 'Weights',
      finalResult: 'Final Result'
    },
    workshop: {
      title: 'Workshop Management',
      planning: 'Planning',
      facilitation: 'Facilitation',
      results: 'Results Analysis',
      participants: 'Participants',
      facilitator: 'Facilitator',
      consensus: 'Consensus',
      status: 'Status'
    },
    admin: {
      userManagement: 'User Management',
      systemSettings: 'System Settings',
      securityMonitoring: 'Security Monitoring',
      systemLogs: 'System Logs',
      subscriptionManagement: 'Subscription Management'
    }
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  defaultLanguage = 'ko' 
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    // 로컬 스토리지에서 언어 설정 불러오기
    const saved = localStorage.getItem('ahp-language');
    return (saved as Language) || defaultLanguage;
  });

  useEffect(() => {
    // 언어 설정 저장
    localStorage.setItem('ahp-language', language);
    
    // HTML lang 속성 업데이트
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        break;
      }
    }
    
    if (typeof value !== 'string') {
      // 키를 찾을 수 없는 경우 영어로 fallback
      value = translations.en;
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          break;
        }
      }
    }
    
    if (typeof value !== 'string') {
      return key; // 키를 그대로 반환
    }
    
    // 파라미터 치환
    if (params) {
      Object.entries(params).forEach(([param, val]) => {
        value = value.replace(new RegExp(`{{${param}}}`, 'g'), val);
      });
    }
    
    return value;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

// 언어 선택 컴포넌트
export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useTranslation();
  
  const languages = [
    { code: 'ko' as Language, name: '한국어', flag: '🇰🇷' },
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'ja' as Language, name: '日本語', flag: '🇯🇵' },
    { code: 'zh' as Language, name: '中文', flag: '🇨🇳' }
  ];

  return (
    <select 
      value={language} 
      onChange={(e) => setLanguage(e.target.value as Language)}
      className={`border rounded px-3 py-2 text-sm ${className}`}
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
};