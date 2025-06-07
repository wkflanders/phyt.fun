import { UUIDv7, Pagination, AvatarUrl, PrivyId } from './core.js';
import { RunnerStatus } from './runners.js';

export type UserRole = 'admin' | 'user' | 'runner';

export interface User {
    id: UUIDv7;
    email: string;
    username: string;
    role: UserRole;
    privyId: PrivyId;
    avatarUrl: AvatarUrl;
    walletAddress: string;
    phytnessPoints: number;
    twitterHandle: string | null;
    stravaHandle: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    // Below is not included in the database table, but used in the API
    status?: RunnerStatus;
}

export interface UserQueryParams {
    page?: number;
    limit?: number;
    parentOnly?: boolean;
}

export interface UserInsert {
    email: string;
    username: string;
    privyId: string;
    walletAddress: string;
    avatarUrl?: AvatarUrl;
    role?: UserRole;
    phytnessPoints?: number;
    twitterHandle?: string | null;
    stravaHandle?: string | null;
}

export interface UserUpdate {
    email?: string;
    username?: string;
    privyId?: string;
    walletAddress?: string;
    avatarUrl?: AvatarUrl;
    role?: UserRole;
    phytnessPoints?: number;
    twitterHandle?: string | null;
    stravaHandle?: string | null;
}

export interface PaginatedUsers<T = User> {
    users: T[];
    pagination: Pagination;
}
