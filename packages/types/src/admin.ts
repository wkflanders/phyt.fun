import type { UUIDv7 } from './core.js';
import type { Run } from './runs.js';

export interface PendingRun {
    run: Run;
    runner: string;
}

export interface PendingRunner {
    id: UUIDv7;
    username: string;
    email: string;
    createdAt: Date;
    role: string;
    privyId: string;
    walletAddress: string;
    avatarUrl: string;
}
