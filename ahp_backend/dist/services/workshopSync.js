"use strict";
/**
 * 실시간 워크숍 동기화 서비스 (비활성화됨)
 * WebSocket을 통한 실시간 협업 기능
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 더미 워크숍 동기화 서비스 클래스
 */
class WorkshopSyncService {
    constructor(httpServer) {
        this.workshops = new Map();
        // WebSocket 기능 비활성화
        console.log('WorkshopSyncService initialized (disabled)');
    }
    getWorkshopInfo(projectId) {
        return this.workshops.get(projectId) || null;
    }
    getAllWorkshops() {
        return Array.from(this.workshops.values());
    }
    startWorkshop(projectId) {
        // 더미 구현
    }
    endWorkshop(projectId) {
        // 더미 구현
    }
}
exports.default = WorkshopSyncService;
