import { ApiError, Runner } from '@phyt/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function getAllRunners(): Promise<Runner[]> {
    const response = await fetch(`${API_URL}/runners/all`, {
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