export type UUIDv7 = string & { __uuidv7: true };

// export type PrivyId = `did:privy:${string}`;
// Need to find out format of privy id's
export type PrivyId = string;

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type WalletAddress = `0x${string}` & { __brand: 'WalletAddress' };

export type AvatarUrl = string;
