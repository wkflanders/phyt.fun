import { UUIDv7, Pagination } from '@phyt/types';
import { RunnerStatus } from './runners.js';

export type UserRole = 'admin' | 'user' | 'runner';

export interface User {
    id: UUIDv7;
    email: string;
    username: string;
    role: UserRole;
    privyId: string;
    avatarUrl: string;
    walletAddress: string;
    phytnessPoints: number | null;
    twitterHandle: string | null;
    stravaHandle: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserWithStatus extends User {
    status?: RunnerStatus;
}

export interface CreateUserRequest {
    // extends FormData
    // Make sure  on the client side formdata is turned into DTO
    email: string;
    username: string;
    privyId: string;
    walletAddress: `0x${string}`;
}

export interface UserResponse {
    users: UserWithStatus[];
    pagination?: Pagination;
}
