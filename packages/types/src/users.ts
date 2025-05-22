import { UUIDv7, Pagination } from './core.js';
import { RunnerStatus } from './runners.js';

export type UserRole = 'admin' | 'user' | 'runner';

/**
 * EVM addresses are always 20 bytes → 40 hex chars → 42 chars incl. “0x”.
 * Tighten the template literal so the compiler yells early.
 */
export type WalletAddress = `0x${string & { length: 40 }}`;

export interface User {
    id: UUIDv7;
    email: string;
    username: string;
    role: UserRole;
    privyId: string;
    avatarUrl: string;
    walletAddress: WalletAddress;
    phytnessPoints: number;
    twitterHandle: string | null;
    stravaHandle: string | null;
    createdAt: Date;
    updatedAt: Date;
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
    walletAddress: WalletAddress;
    avatarUrl?: string;
    role?: UserRole;
    phytnessPoints?: number;
    twitterHandle?: string | null;
    stravaHandle?: string | null;
}

export interface UserUpdate {
    email?: string;
    username?: string;
    privyId?: string;
    walletAddress?: WalletAddress;
    avatarUrl?: string;
    role?: UserRole;
    phytnessPoints?: number;
    twitterHandle?: string | null;
    stravaHandle?: string | null;
}

export interface PaginatedUsers<T = User> {
    users: T[];
    pagination?: Pagination;
}
