/**
 * 실시간 워크숍 동기화 서비스 (비활성화됨)
 * WebSocket을 통한 실시간 협업 기능
 */

interface WorkshopParticipant {
  socketId: string;
  userId: number;
  name: string;
  joinedAt: Date;
}

interface WorkshopInfo {
  projectId: string;
  participants: WorkshopParticipant[];
  isActive: boolean;
  startedAt: Date;
}

/**
 * 더미 워크숍 동기화 서비스 클래스
 */
class WorkshopSyncService {
  private workshops: Map<string, WorkshopInfo> = new Map();

  constructor(httpServer: any) {
    // WebSocket 기능 비활성화
    console.log('WorkshopSyncService initialized (disabled)');
  }

  getWorkshopInfo(projectId: string): WorkshopInfo | null {
    return this.workshops.get(projectId) || null;
  }

  getAllWorkshops(): WorkshopInfo[] {
    return Array.from(this.workshops.values());
  }

  startWorkshop(projectId: string): void {
    // 더미 구현
  }

  endWorkshop(projectId: string): void {
    // 더미 구현
  }
}

export default WorkshopSyncService;