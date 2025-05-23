import type { UUIDv7, Pagination } from './core.js';

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

export interface RunnerInsert {
    userId: UUIDv7;
    totalDistance: number;
    averagePace: number | null;
    totalRuns: number;
    bestMileTime: number | null;
    status: RunnerStatus;
    isPooled: boolean;
    runnerWallet: string;
}

export interface RunnerUpdate {
    totalDistance?: number;
    averagePace?: number | null;
    totalRuns?: number;
    bestMileTime?: number | null;
    status?: RunnerStatus;
    isPooled?: boolean;
    runnerWallet?: string;
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
    page?: number;
    limit?: number;
}

export interface PaginatedRunners<T = Runner> {
    runners: T[];
    pagination?: Pagination;
}
