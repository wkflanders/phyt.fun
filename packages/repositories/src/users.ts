import { UUIDv7 } from '@phyt/types';

import type {
    User,
    CreateUserRequest,
    UserResponse,
    Transaction,
    CardWithMetadata
} from '@phyt/models';

export interface UserRepository {
    createUser: (userData: CreateUserRequest) => Promise<User>;
    getUserByPrivyId: (privyId: string) => Promise<User>;
    getUserByWalletAddress: (walletAddress: string) => Promise<User>;
    getUserById: (id: UUIDv7) => Promise<User>;
    getUserByEmail: (email: string) => Promise<User>;
    getUserByUsername: (username: string) => Promise<User>;
    getTransactionsByUserId: (userId: UUIDv7) => Promise<Transaction[]>;
    getCardsByPrivyId: (privyId: string) => Promise<CardWithMetadata[]>;
}
