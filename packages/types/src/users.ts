import { UUIDv7, Pagination, ISODate } from './core.js';
import { RunnerStatus } from './runners.js';

export const DefaultAvatar =
    'https://rsg5uys7zq.ufs.sh/f/AMgtrA9DGKkFuVELmbdSRBPUEIciTL7a2xg1vJ8ZDQh5ejut';

export type UserRole = 'admin' | 'user' | 'runner';

export interface User {
    id: UUIDv7;
    email: string;
    username: string;
    role: UserRole;
    privyId: string;
    avatarUrl: string;
    walletAddress: `0x${string}`;
    phytnessPoints: number | null;
    twitterHandle: string | null;
    stravaHandle: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserWithStatus extends User {
    status?: RunnerStatus;
}

export interface UserQueryParams {
    page?: number;
    limit?: number;
    parentOnly?: boolean;
}

// export interface CreateUserInput {
//     email: string;
//     username: string;
//     privyId: string;
//     walletAddress: `0x${string}`;
// }

export interface UserInsert {
    email: string;
    username: string;
    privyId: string;
    walletAddress: `0x${string}`;
    avatarUrl?: string;
    role?: UserRole;
    phytnessPoints: number;
    twitterHandle?: string | null;
    stravaHandle?: string | null;
}

export interface PaginatedUsers {
    users: UserWithStatus[];
    pagination?: Pagination;
}
