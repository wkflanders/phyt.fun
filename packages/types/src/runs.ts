import type { UUIDv7, ISODate, Pagination } from './core.js';

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

export interface RunRecord {
    id?: UUIDv7;
    runnerId: UUIDv7;
    startTime: ISODate;
    endTime: ISODate;
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
    createdAt: ISODate;
    updatedAt: ISODate;
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
}

export interface RunWithRunner extends Run {
    runnerUsername: string;
    runnerAvatarUrl: string | null;
}

export interface RunQueryParams {
    page?: number;
    limit?: number;
    sortBy?: 'startTime' | 'distance' | 'durationSeconds';
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedRuns<T = Run> {
    runs: T[];
    pagination?: Pagination;
}
