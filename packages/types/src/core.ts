export type UUIDv7 = string & { __uuidv7: true };

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type WalletAddress = `0x${string & { length: 40 }}`;

export type AvatarUrl = string;
