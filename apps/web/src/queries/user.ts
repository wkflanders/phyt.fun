import {
    CardWithMetadata,
    Transaction,
    User,
    CreateUserInput
} from '@phyt/types';

import { api } from '@/lib/api';

export const USER_QUERY_KEY = 'user';
export const TRANSACTIONS_QUERY_KEY = 'transactions';
export const getUserQueryKey = (privyId: string) => [USER_QUERY_KEY, privyId];

export async function getUser(privyId: string, token: string): Promise<User> {
    const response = await api.get<User>(`/users/${privyId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

export async function getUserTransactions(
    privyId: string,
    token: string
): Promise<Transaction[]> {
    const response = await api.get<Transaction[]>(
        `/users/transactions/${privyId}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}

export async function createUser(
    { formData }: CreateUserInput,
    token: string
): Promise<User> {
    const response = await api.post<User>(`/users/create`, formData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

export async function getUserCards(
    privyId: string,
    token: string
): Promise<CardWithMetadata[]> {
    const response = await api.get<CardWithMetadata[]>(
        `/users/cards/${privyId}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}
