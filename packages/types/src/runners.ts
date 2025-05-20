import type { UUIDv7 } from './core.js';

export type RunnerStatus = 'pending' | 'active' | 'inactive';

export interface Runner {
    id: UUIDv7;
    userId: UUIDv7;
    totalDistance: number;
    averagePace: number | null;
    totalRuns: number;
    bestMileTime: number | null;
    status: RunnerStatus;
    isPooled: boolean;
    runnerWallet: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RunnerProfile extends Runner {
    username: string;
    avatarUrl: string;
}

export type RunnerSortFields =
    | 'username'
    | 'totalDistance'
    | 'averagePace'
    | 'totalRuns'
    | 'bestMileTime'
    | 'createdAt';

export type RunnerSortOrder = 'asc' | 'desc';

export interface RunnerQueryParams {
    search?: string;
    sortBy?: RunnerSortFields;
    sortOrder?: RunnerSortOrder;
}

export interface RunnerActivity {
    id: UUIDv7;
    runnerId: UUIDv7;
    username: string;
    avatarUrl: string;
    distance: number;
    completedAt: string;
    isPooled: boolean;
    timeAgo: string;
}

export interface RunnerPoolStatus {
    status: RunnerStatus;
    isPooled: boolean;
}
