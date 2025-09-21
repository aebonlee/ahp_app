/**
 * 실시간 워크숍 동기화 서비스
 * WebSocket을 통한 실시간 협업 기능
 */
import { Server as HTTPServer } from 'http';
declare class WorkshopSyncService {
    private io;
    private workshops;
    constructor(httpServer: HTTPServer);
    private setupEventHandlers;
    private authenticateSocket;
    private handleJoinWorkshop;
    private handleLeaveWorkshop;
    private handleProgressUpdate;
    private handleEvaluationUpdate;
    private handleConsistencyCheck;
    private handleAdminCommand;
    private handleDisconnect;
    private removeParticipant;
    private broadcastParticipantList;
    getWorkshopInfo(projectId: string): {
        projectId: string;
        projectName: string;
        participantCount: number;
        status: "waiting" | "active" | "paused" | "completed";
        startTime: Date;
    } | null;
    getAllWorkshops(): {
        projectId: string;
        projectName: string;
        participantCount: number;
        status: "waiting" | "active" | "paused" | "completed";
        startTime: Date;
    }[];
}
export default WorkshopSyncService;
