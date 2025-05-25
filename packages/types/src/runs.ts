import type { UUIDv7, Pagination, AvatarUrl } from './core.js';
import type { Runner } from './runners.js';

export interface Run {
    id: UUIDv7;
    runnerId: UUIDv7;
    startTime: Date;
    endTime: Date;
    durationSeconds: number;
    distance: number;
    averagePaceSec: number | null;
    caloriesBurned: number | null;
    stepCount: number | null;
    elevationGain: number | null;
    averageHeartRate: number | null;
    maxHeartRate: number | null;
    deviceId: string | null;
    gpsRouteData: string | null;
    isPosted: boolean | null;
    verificationStatus: 'pending' | 'verified' | 'flagged';
    rawDataJson: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface RunWithRunnerInfo extends Run {
    runner: Runner;
    username: string;
    avatarUrl: AvatarUrl;
}

export interface RunInsert {
    runnerId: UUIDv7;
    startTime: Date;
    endTime: Date;
    durationSeconds: number;
    distance: number;
    averagePaceSec?: number | null;
    caloriesBurned?: number | null;
    stepCount?: number | null;
    elevationGain?: number | null;
    averageHeartRate?: number | null;
    maxHeartRate?: number | null;
    deviceId?: string | null;
    gpsRouteData?: string | null;
    rawDataJson?: Record<string, unknown> | null;
    isPosted?: boolean | null;
    verificationStatus?: 'pending' | 'verified' | 'flagged';
}

export interface RunUpdate {
    startTime?: Date;
    endTime?: Date;
    durationSeconds?: number;
    distance?: number;
    averagePaceSec?: number | null;
    caloriesBurned?: number | null;
    stepCount?: number | null;
    elevationGain?: number | null;
    averageHeartRate?: number | null;
    maxHeartRate?: number | null;
    deviceId?: string | null;
    gpsRouteData?: string | null;
    rawDataJson?: Record<string, unknown> | null;
    isPosted?: boolean | null;
    verificationStatus?: 'pending' | 'verified' | 'flagged';
}

export interface RunQueryParams {
    page?: number;
    limit?: number;
    sortBy?: 'startTime' | 'distance' | 'durationSeconds';
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedRuns<T = Run> {
    runs: T[];
    pagination: Pagination;
}
