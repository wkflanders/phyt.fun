import type { UUIDv7, Pagination, AvatarUrl, WalletAddress } from './core.js';

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
    runnerWallet: WalletAddress;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    // Below are not included in the database table, but used in the API
    username?: string;
    avatarUrl?: AvatarUrl;
}

export interface RunnerInsert {
    userId: UUIDv7;
    totalDistance: number;
    averagePace: number | null;
    totalRuns: number;
    bestMileTime: number | null;
    status: RunnerStatus;
    isPooled: boolean;
    runnerWallet: WalletAddress;
}

export interface RunnerUpdate {
    totalDistance?: number;
    averagePace?: number | null;
    totalRuns?: number;
    bestMileTime?: number | null;
    status?: RunnerStatus;
    isPooled?: boolean;
    runnerWallet?: WalletAddress;
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
    pagination: Pagination;
}
