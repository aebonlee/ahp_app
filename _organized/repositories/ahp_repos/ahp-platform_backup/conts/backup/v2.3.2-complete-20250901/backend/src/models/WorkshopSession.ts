/**
 * 워크숍 세션 모델
 * 다중 평가자를 지원하는 AHP 워크숍 세션 관리
 */

export interface WorkshopSession {
  id: number;
  projectId: number;
  sessionName: string;
  sessionDescription?: string;
  facilitatorId: number;
  sessionType: 'collaborative' | 'individual' | 'hybrid';
  maxParticipants: number;
  sessionStatus: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  deadline?: Date;
  evaluationMode: 'pairwise' | 'direct_input' | 'ranking' | 'scoring' | 'fuzzy' | 'linguistic' | 'interval' | 'group_discussion';
  consensusMethod: 'geometric_mean' | 'arithmetic_mean' | 'median' | 'weighted_average';
  minimumConsistencyRatio: number;
  requireAllEvaluations: boolean;
  allowPartialSubmissions: boolean;
  sessionConfig: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkshopParticipant {
  id: number;
  workshopSessionId: number;
  participantId?: number;
  participantEmail: string;
  participantName: string;
  participantRole: 'facilitator' | 'evaluator' | 'observer' | 'expert';
  invitationStatus: 'pending' | 'invited' | 'accepted' | 'declined' | 'expired';
  evaluationStatus: 'not_started' | 'in_progress' | 'completed' | 'incomplete';
  weightMultiplier: number;
  expertiseAreas?: string[];
  invitedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  completionPercentage: number;
  consistencyRatio?: number;
  participationDuration: number; // seconds
  lastActivity?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluatorAssessment {
  id: number;
  workshopSessionId: number;
  participantId: number;
  evaluationStep: string;
  stepStatus: 'pending' | 'in_progress' | 'completed' | 'skipped';
  criteriaId?: number;
  evaluationData: any;
  individualWeights?: any;
  individualScores?: any;
  individualRanking?: any;
  confidenceLevel: number; // 1-5
  evaluationMethod?: string;
  consistencyRatio?: number;
  evaluationTime: number; // seconds
  notes?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupConsensusResult {
  id: number;
  workshopSessionId: number;
  resultType: 'criteria_weights' | 'alternative_scores' | 'final_ranking' | 'sensitivity_analysis';
  consensusMethod: string;
  groupWeights?: any;
  groupScores?: any;
  groupRanking?: any;
  individualResults?: any;
  consensusLevel?: number; // 0-1
  disagreementMatrix?: any;
  outlierParticipants?: number[];
  confidenceInterval?: any;
  sensitivityData?: any;
  calculationMetadata?: any;
  calculatedAt: Date;
  createdAt: Date;
}

export interface RealTimeProgress {
  id: number;
  workshopSessionId: number;
  participantId?: number;
  eventType: 'login' | 'logout' | 'step_start' | 'step_complete' | 'data_save' | 'session_pause' | 'session_resume';
  eventData: any;
  currentStep?: string;
  progressPercentage?: number;
  sessionDuration: number; // seconds
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface EmailNotification {
  id: number;
  workshopSessionId?: number;
  participantId?: number;
  notificationType: 'invitation' | 'reminder' | 'deadline_warning' | 'completion_confirmation' | 'results_sharing';
  templateId?: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  content: string;
  personalizationData: any;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  smtpResponse?: string;
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  retryCount: number;
  errorMessage?: string;
  createdAt: Date;
}

export interface WorkshopTemplate {
  id: number;
  templateName: string;
  templateDescription?: string;
  templateCategory?: string;
  createdBy?: number;
  isPublic: boolean;
  defaultSettings: any;
  criteriaTemplate: any[];
  alternativesTemplate: any[];
  evaluationFlow: any;
  emailTemplates: any;
  usageCount: number;
  rating: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SensitivityScenario {
  id: number;
  workshopSessionId: number;
  scenarioName: string;
  scenarioDescription?: string;
  scenarioType?: 'conservative' | 'aggressive' | 'custom' | 'threshold';
  weightChanges: any; // 가중치 변화 정의
  enabled: boolean;
  createdBy?: number;
  createdAt: Date;
}

export interface SensitivityResult {
  id: number;
  workshopSessionId: number;
  scenarioId?: number;
  alternativeId: number;
  originalRank: number;
  newRank: number;
  rankChange: number;
  originalScore: number;
  newScore: number;
  scoreChange: number;
  stabilityLevel?: 'stable' | 'moderate' | 'sensitive' | 'very_sensitive';
  calculatedAt: Date;
}

export interface ExportHistory {
  id: number;
  workshopSessionId?: number;
  exportedBy?: number;
  exportType: 'basic' | 'advanced' | 'dashboard' | 'sensitivity' | 'detailed';
  exportFormat: 'xlsx' | 'csv' | 'pdf' | 'json';
  fileName?: string;
  fileSize?: number;
  filePath?: string;
  exportConfig: any;
  downloadCount: number;
  expiresAt?: Date;
  createdAt: Date;
}

export interface MultiEvaluatorSettings {
  id: number;
  settingCategory: string;
  settingKey: string;
  settingValue?: string;
  dataType: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  isSystemSetting: boolean;
  requiresRestart: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 유틸리티 타입들
export interface WorkshopSessionWithParticipants extends WorkshopSession {
  participants: WorkshopParticipant[];
  facilitator: {
    id: number;
    name: string;
    email: string;
  };
  project: {
    id: number;
    title: string;
    description?: string;
  };
}

export interface ParticipantProgress {
  participantId: number;
  participantName: string;
  evaluationStatus: WorkshopParticipant['evaluationStatus'];
  completionPercentage: number;
  consistencyRatio?: number;
  currentStep?: string;
  lastActivity?: Date;
  evaluationTime: number;
}

export interface WorkshopStatistics {
  totalParticipants: number;
  invitedParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  averageCompletionTime: number;
  averageConsistencyRatio: number;
  consensusLevel: number;
  progressByStep: { [step: string]: number };
}

export interface ConsensusAnalysis {
  consensusMethod: string;
  consensusLevel: number;
  agreementMatrix: number[][];
  outlierParticipants: number[];
  confidenceInterval: {
    lower: number[];
    upper: number[];
  };
  variabilityMetrics: {
    standardDeviation: number[];
    variance: number[];
    coefficientOfVariation: number[];
  };
}

// API 요청/응답 타입들
export interface CreateWorkshopSessionRequest {
  projectId: number;
  sessionName: string;
  sessionDescription?: string;
  sessionType?: WorkshopSession['sessionType'];
  maxParticipants?: number;
  startDate?: Date;
  endDate?: Date;
  deadline?: Date;
  evaluationMode?: WorkshopSession['evaluationMode'];
  consensusMethod?: WorkshopSession['consensusMethod'];
  minimumConsistencyRatio?: number;
  requireAllEvaluations?: boolean;
  allowPartialSubmissions?: boolean;
  sessionConfig?: any;
}

export interface UpdateWorkshopSessionRequest extends Partial<CreateWorkshopSessionRequest> {
  sessionStatus?: WorkshopSession['sessionStatus'];
}

export interface InviteParticipantsRequest {
  participants: Array<{
    email: string;
    name: string;
    role?: WorkshopParticipant['participantRole'];
    weightMultiplier?: number;
    expertiseAreas?: string[];
  }>;
  sendInvitation?: boolean;
  customMessage?: string;
}

export interface SubmitEvaluationRequest {
  evaluationStep: string;
  criteriaId?: number;
  evaluationData: any;
  confidenceLevel?: number;
  notes?: string;
}

export interface CalculateConsensusRequest {
  resultType: GroupConsensusResult['resultType'];
  consensusMethod?: string;
  includeOutliers?: boolean;
  weightThreshold?: number;
}

export interface RunSensitivityAnalysisRequest {
  scenarios: Array<{
    scenarioName: string;
    scenarioType: 'conservative' | 'aggressive' | 'custom';
    weightChanges: { [criteriaId: string]: number };
  }>;
  analysisType: 'single' | 'multi' | 'threshold';
}

export interface ExportWorkshopRequest {
  exportType: ExportHistory['exportType'];
  exportFormat: ExportHistory['exportFormat'];
  includeCharts?: boolean;
  includeSensitivity?: boolean;
  includeIndividualResults?: boolean;
  customConfig?: any;
}