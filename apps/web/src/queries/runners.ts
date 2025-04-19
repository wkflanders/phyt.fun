import { env } from '@/env';
import { ApiError, Runner, RunnerProfile, RunnerActivity } from '@phyt/types';

const API_URL: string = env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const getRunnersQueryKey = () => ['runners'];
export const RUNNER_ACTIVITIES_QUERY_KEY = 'runnerActivities';
export const getRunnerQueryKey = (id: number) => ['runners', id];

export async function getRunners(
    token: string,
    search?: string
): Promise<RunnerProfile[]> {
    const searchParams = new URLSearchParams();
    if (search) {
        searchParams.append('search', search);
    }

    const response = await fetch(
        `${API_URL}/runners?${searchParams.toString()}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to fetch runners',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

export async function getRunner(
    id: number,
    token: string
): Promise<RunnerProfile> {
    const response = await fetch(`${API_URL}/runners/runner/${String(id)}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to fetch runner',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

export async function getRunnerActivities(
    token: string,
    filter?: string
): Promise<RunnerActivity[]> {
    const queryParams = filter ? `?filter=${filter}` : '';
    const response = await fetch(
        `${API_URL}/runners/activities${queryParams}`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to fetch runner activities',
            status: response.status
        } as ApiError;
    }

    return response.json();
}
