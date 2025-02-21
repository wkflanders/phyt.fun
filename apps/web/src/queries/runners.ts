import { ApiError, Runner } from '@phyt/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const getRunnersQueryKey = () => ['runners'];
export const getRunnerQueryKey = (id: number) => ['runners', id];

export async function getRunners(search?: string): Promise<Runner[]> {
    const searchParams = new URLSearchParams();
    if (search) {
        searchParams.append('search', search);
    }

    const response = await fetch(
        `${API_URL}/runners?${searchParams.toString()}`,
        {
            method: 'GET',
            credentials: 'include',
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch runners');
    }

    return response.json();
}

export async function getRunner(id: number): Promise<Runner> {
    const response = await fetch(
        `${API_URL}/runners/${id}`,
        {
            method: 'GET',
            credentials: 'include',
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch runner');
    }

    return response.json();
}
