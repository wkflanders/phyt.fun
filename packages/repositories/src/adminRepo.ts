import type { UUIDv7, PendingRunner, PendingRun, User, Run } from '@phyt/types';

// Define the shape of the ops dependency (to be injected)
export interface AdminOps {
    getPendingRunners: () => Promise<PendingRunner[]>;
    getPendingRuns: () => Promise<PendingRun[]>;
    approveRunner: (userId: UUIDv7) => Promise<User>;
    updateRunVerification: (
        runId: UUIDv7,
        status: 'verified' | 'flagged'
    ) => Promise<Run>;
}

export const makeAdminRepository = (ops: AdminOps) => {
    return {
        async getPendingRunners(): Promise<PendingRunner[]> {
            return ops.getPendingRunners();
        },
        async getPendingRuns(): Promise<PendingRun[]> {
            return ops.getPendingRuns();
        },
        async approveRunner(userId: UUIDv7): Promise<User> {
            return ops.approveRunner(userId);
        },
        async updateRunVerification(
            runId: UUIDv7,
            status: 'verified' | 'flagged'
        ): Promise<Run> {
            return ops.updateRunVerification(runId, status);
        }
    };
};

export type AdminRepository = ReturnType<typeof makeAdminRepository>;
