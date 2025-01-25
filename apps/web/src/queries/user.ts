import { Transaction, User } from "@phyt/types";
import { ApiError } from "@phyt/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const USER_QUERY_KEY = "user";
export const TRANSACTIONS_QUERY_KEY = "transactions";
export const getUserQueryKey = (privyId: string) => [USER_QUERY_KEY, privyId];

export async function getUser(privyId: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/${privyId}`, {
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw {
            error: data.error || 'Failed to fetch user',
            status: response.status
        } as ApiError;
    }

    return data;
}

export async function getUserTransactions(privyId: string): Promise<Transaction[]> {
    const response = await fetch(`${API_URL}/users/transactions/${privyId}`, {
        credentials: 'include',
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
        console.log('test');
        throw {
            error: data.error || 'Failed to fetch user transactions',
            status: response.status
        } as ApiError;
    }

    return data;
}

export async function createUser(userData: {
    email: string,
    username: string,
    avatar_url: string,
    privy_id: string,
    wallet_address?: string;
}): Promise<User> {
    const response = await fetch(`${API_URL}/users/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw {
            error: data.error || 'Failed to create user',
            status: response.status
        } as ApiError;
    }

    return data;
}
