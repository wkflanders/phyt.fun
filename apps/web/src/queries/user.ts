import { env } from '@/env';
import {
    CardWithMetadata,
    Transaction,
    User,
    ApiError,
    CreateUserInput
} from '@phyt/types';

const API_URL: string = env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const USER_QUERY_KEY = 'user';
export const TRANSACTIONS_QUERY_KEY = 'transactions';
export const getUserQueryKey = (privyId: string) => [USER_QUERY_KEY, privyId];

export async function getUser(privyId: string, token: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/${privyId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to fetch user',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

export async function getUserTransactions(
    privyId: string,
    token: string
): Promise<Transaction[]> {
    const response = await fetch(`${API_URL}/users/transactions/${privyId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to fetch user transactions',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

export async function createUser(
    { formData }: CreateUserInput,
    token: string
): Promise<User> {
    const response = await fetch(`${API_URL}/users/create`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to create user',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

export async function getUserCards(
    privyId: string,
    token: string
): Promise<CardWithMetadata[]> {
    const response = await fetch(`${API_URL}/users/cards/${privyId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to fetch user cards',
            status: response.status
        } as ApiError;
    }

    return response.json();
}
