import type {
  HierarchicalStructure,
  HierarchyNode,
  NodeProgress,
  OverallProgress,
  LevelProgress,
  NodeInfo,
  ProgressMessage,
  ConsistencyResult,
  HierarchicalEvaluationError,
  HierarchyError
} from '../types/hierarchy';

// Opus 4.1 설계 문서 기반 진행률 추적기

export class ProgressTracker {
  private projectId: string;
  private evaluatorId: string;
  private totalNodes: number;
  private completedNodes: Set<string>;
  private nodeProgress: Map<string, NodeProgress>;
  private websocket: WebSocket | null;
  private updateCallbacks: Array<(progress: OverallProgress) => void>;
  
  constructor(projectId: string, evaluatorId: string, websocket?: WebSocket) {
    this.projectId = projectId;
    this.evaluatorId = evaluatorId;
    this.completedNodes = new Set();
    this.nodeProgress = new Map();
    this.websocket = websocket || null;
    this.totalNodes = 0;
    this.updateCallbacks = [];
  }
  
  /**
   * 진행률 초기화
   */
  async initialize(structure: HierarchicalStructure): Promise<void> {
    try {
      // 평가가 필요한 모든 노드 계산
      const evaluationNodes = this.getEvaluationNodes(structure);
      this.totalNodes = evaluationNodes.length;
      
      // 각 노드별 진행률 초기화
      for (const node of evaluationNodes) {
        const childCount = node.children?.length || 0;
        const totalComparisons = childCount > 1 ? (childCount * (childCount - 1)) / 2 : 0;
        
        this.nodeProgress.set(node.id, {
          nodeId: node.id,
          nodeName: node.name,
          level: node.level,
          totalComparisons,
          completedComparisons: 0,
          isCompleted: false,
          isConsistent: false,
          consistencyRatio: 0,
          startedAt: null,
          completedAt: null,
          timeSpent: 0
        });
      }
      
      // 초기 상태 전송
      await this.broadcastProgress();
      
    } catch (error) {
      throw new HierarchyError(
        HierarchicalEvaluationError.CALCULATION_ERROR,
        '진행률 초기화 중 오류가 발생했습니다',
        error
      );
    }
  }
  
  /**
   * 쌍대비교 완료 업데이트
   */
  async updateComparison(
    nodeId: string, 
    comparisonIndex: number,
    isComplete: boolean = false
  ): Promise<void> {
    const progress = this.nodeProgress.get(nodeId);
    
    if (!progress) {
      throw new HierarchyError(
        HierarchicalEvaluationError.INVALID_HIERARCHY,
        `Node ${nodeId} not found in progress tracker`
      );
    }
    
    // 시작 시간 기록
    if (!progress.startedAt) {
      progress.startedAt = new Date();
    }
    
    // 진행률 업데이트
    progress.completedComparisons = Math.min(
      comparisonIndex + 1,
      progress.totalComparisons
    );
    
    // 완료 처리
    if (isComplete || progress.completedComparisons >= progress.totalComparisons) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      if (progress.startedAt) {
        progress.timeSpent = progress.completedAt.getTime() - progress.startedAt.getTime();
      }
      this.completedNodes.add(nodeId);
    }
    
    // 실시간 브로드캐스트
    await this.broadcastProgress();
    this.notifyCallbacks();
  }
  
  /**
   * 일관성 검증 결과 업데이트
   */
  async updateConsistency(
    nodeId: string,
    consistencyResult: ConsistencyResult
  ): Promise<void> {
    const progress = this.nodeProgress.get(nodeId);
    
    if (progress) {
      progress.isConsistent = consistencyResult.isConsistent;
      progress.consistencyRatio = consistencyResult.ratio;
      
      // 불일관한 경우 완료 상태 취소
      if (!consistencyResult.isConsistent) {
        progress.isCompleted = false;
        this.completedNodes.delete(nodeId);
      } else if (progress.completedComparisons >= progress.totalComparisons) {
        // 일관하고 모든 비교가 완료된 경우 완료 처리
        progress.isCompleted = true;
        this.completedNodes.add(nodeId);
      }
      
      await this.broadcastProgress();
      this.notifyCallbacks();
    }
  }
  
  /**
   * 전체 진행률 계산
   */
  getOverallProgress(): OverallProgress {
    const completed = this.completedNodes.size;
    const percentage = this.totalNodes > 0 
      ? (completed / this.totalNodes) * 100 
      : 0;
    
    // 레벨별 진행률
    const levelProgress: Map<number, LevelProgress> = new Map();
    
    for (const [, progress] of this.nodeProgress) {
      if (!levelProgress.has(progress.level)) {
        levelProgress.set(progress.level, {
          level: progress.level,
          totalNodes: 0,
          completedNodes: 0,
          percentage: 0
        });
      }
      
      const level = levelProgress.get(progress.level)!;
      level.totalNodes++;
      
      if (progress.isCompleted && progress.isConsistent) {
        level.completedNodes++;
      }
    }
    
    // 레벨별 퍼센트 계산
    for (const [, level] of levelProgress) {
      level.percentage = level.totalNodes > 0
        ? (level.completedNodes / level.totalNodes) * 100
        : 0;
    }
    
    // 예상 남은 시간 계산
    const estimatedTimeRemaining = this.estimateTimeRemaining();
    
    return {
      totalNodes: this.totalNodes,
      completedNodes: completed,
      percentage,
      levelProgress: Array.from(levelProgress.values()).sort((a, b) => a.level - b.level),
      estimatedTimeRemaining,
      currentNode: this.getCurrentNode(),
      nextNode: this.getNextNode()
    };
  }
  
  /**
   * WebSocket으로 진행률 브로드캐스트
   */
  private async broadcastProgress(): Promise<void> {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      return;
    }
    
    try {
      const progress = this.getOverallProgress();
      
      const message: ProgressMessage = {
        type: 'PROGRESS_UPDATE',
        projectId: this.projectId,
        evaluatorId: this.evaluatorId,
        timestamp: new Date().toISOString(),
        data: progress
      };
      
      this.websocket.send(JSON.stringify(message));
      
      // 데이터베이스에도 저장 (실제 구현에서는 API 호출)
      await this.saveProgressToDatabase();
      
    } catch (error) {
      console.error('진행률 브로드캐스트 실패:', error);
    }
  }
  
  /**
   * 남은 시간 추정
   */
  private estimateTimeRemaining(): number {
    const completedWithTime = Array.from(this.nodeProgress.values())
      .filter(p => p.isCompleted && p.timeSpent > 0);
    
    if (completedWithTime.length === 0) {
      return -1; // 추정 불가
    }
    
    // 평균 시간 계산
    const avgTimePerNode = completedWithTime
      .reduce((sum, p) => sum + p.timeSpent, 0) / completedWithTime.length;
    
    const remainingNodes = this.totalNodes - this.completedNodes.size;
    
    return Math.round(avgTimePerNode * remainingNodes / 1000); // 초 단위
  }
  
  /**
   * 현재 진행 중인 노드
   */
  private getCurrentNode(): NodeInfo | null {
    for (const [id, progress] of this.nodeProgress) {
      if (progress.startedAt && !progress.isCompleted) {
        const nodeProgress = progress.totalComparisons > 0 
          ? (progress.completedComparisons / progress.totalComparisons) * 100
          : 0;
          
        return {
          id,
          name: progress.nodeName,
          level: progress.level,
          progress: nodeProgress
        };
      }
    }
    return null;
  }
  
  /**
   * 다음 평가할 노드
   */
  private getNextNode(): NodeInfo | null {
    // 레벨 순서대로 정렬하여 다음 노드 찾기
    const sortedProgress = Array.from(this.nodeProgress.entries())
      .sort(([, a], [, b]) => a.level - b.level);
    
    for (const [id, progress] of sortedProgress) {
      if (!progress.startedAt || (!progress.isCompleted && !progress.isConsistent)) {
        return {
          id,
          name: progress.nodeName,
          level: progress.level,
          progress: 0
        };
      }
    }
    return null;
  }
  
  /**
   * 평가가 필요한 노드 목록
   */
  private getEvaluationNodes(structure: HierarchicalStructure): HierarchyNode[] {
    const nodes: HierarchyNode[] = [];
    
    const traverse = (node: HierarchyNode) => {
      if (node.children && node.children.length > 1) {
        nodes.push(node);
        node.children.forEach(traverse);
      }
    };
    
    // 목표 노드부터 시작
    traverse(structure.goal);
    
    // 말단 기준들도 대안과 비교해야 함
    const leafCriteria = this.getLeafCriteria(structure);
    for (const criterion of leafCriteria) {
      if (structure.alternatives.length > 1) {
        // 가상 노드 생성 (기준-대안 비교용)
        const virtualNode: HierarchyNode = {
          ...criterion,
          id: `${criterion.id}_alternatives`,
          children: structure.alternatives,
          level: criterion.level + 1
        };
        nodes.push(virtualNode);
      }
    }
    
    return nodes;
  }
  
  /**
   * 말단 기준 노드 찾기
   */
  private getLeafCriteria(structure: HierarchicalStructure): HierarchyNode[] {
    const leaves: HierarchyNode[] = [];
    
    const traverse = (node: HierarchyNode) => {
      if (!node.children || node.children.length === 0) {
        if (node.nodeType === 'criterion' || node.nodeType === 'subcriterion') {
          leaves.push(node);
        }
      } else {
        node.children.forEach(traverse);
      }
    };
    
    structure.criteria.forEach(traverse);
    return leaves;
  }
  
  /**
   * 데이터베이스에 진행률 저장
   */
  private async saveProgressToDatabase(): Promise<void> {
    try {
      // 실제 구현에서는 API 호출
      const progressData = {
        projectId: this.projectId,
        evaluatorId: this.evaluatorId,
        progress: this.getOverallProgress(),
        nodeProgress: Array.from(this.nodeProgress.entries()).map(([nodeId, progress]) => ({
          nodeId,
          ...progress,
          startedAt: progress.startedAt?.toISOString(),
          completedAt: progress.completedAt?.toISOString()
        })),
        timestamp: new Date().toISOString()
      };
      
      // console.log('Saving progress to database:', progressData);
      
      // 실제 API 호출 코드는 여기에 추가
      // await fetch('/api/evaluation/progress', { ... });
      
    } catch (error) {
      console.error('진행률 저장 실패:', error);
    }
  }
  
  /**
   * 진행률 업데이트 콜백 등록
   */
  onProgressUpdate(callback: (progress: OverallProgress) => void): void {
    this.updateCallbacks.push(callback);
  }
  
  /**
   * 콜백 제거
   */
  removeProgressCallback(callback: (progress: OverallProgress) => void): void {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }
  
  /**
   * 모든 콜백에 진행률 알림
   */
  private notifyCallbacks(): void {
    const progress = this.getOverallProgress();
    for (const callback of this.updateCallbacks) {
      try {
        callback(progress);
      } catch (error) {
        console.error('진행률 콜백 실행 중 오류:', error);
      }
    }
  }
  
  /**
   * WebSocket 연결 설정/변경
   */
  setWebSocket(websocket: WebSocket): void {
    this.websocket = websocket;
  }
  
  /**
   * 특정 노드의 진행률 가져오기
   */
  getNodeProgress(nodeId: string): NodeProgress | null {
    return this.nodeProgress.get(nodeId) || null;
  }
  
  /**
   * 모든 노드 진행률 가져오기
   */
  getAllNodeProgress(): Map<string, NodeProgress> {
    return new Map(this.nodeProgress);
  }
  
  /**
   * 평가 세션 리셋
   */
  resetProgress(): void {
    this.completedNodes.clear();
    for (const [, progress] of this.nodeProgress) {
      progress.completedComparisons = 0;
      progress.isCompleted = false;
      progress.isConsistent = false;
      progress.consistencyRatio = 0;
      progress.startedAt = null;
      progress.completedAt = null;
      progress.timeSpent = 0;
    }
  }
  
  /**
   * 완료율 통계
   */
  getCompletionStats(): {
    totalComparisons: number,
    completedComparisons: number,
    consistentNodes: number,
    inconsistentNodes: number,
    averageConsistencyRatio: number
  } {
    let totalComparisons = 0;
    let completedComparisons = 0;
    let consistentNodes = 0;
    let inconsistentNodes = 0;
    let totalCR = 0;
    let nodeCount = 0;
    
    for (const [, progress] of this.nodeProgress) {
      totalComparisons += progress.totalComparisons;
      completedComparisons += progress.completedComparisons;
      
      if (progress.isCompleted) {
        if (progress.isConsistent) {
          consistentNodes++;
        } else {
          inconsistentNodes++;
        }
        totalCR += progress.consistencyRatio;
        nodeCount++;
      }
    }
    
    return {
      totalComparisons,
      completedComparisons,
      consistentNodes,
      inconsistentNodes,
      averageConsistencyRatio: nodeCount > 0 ? totalCR / nodeCount : 0
    };
  }
}