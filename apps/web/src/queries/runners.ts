import { ApiError, Runner, RunnerActivity } from '@phyt/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const getRunnersQueryKey = () => ['runners'];
export const RUNNER_ACTIVITIES_QUERY_KEY = "runnerActivities";
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
        `${API_URL}/runners/runner/${id}`,
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

export async function getRunnerActivities(filter?: string): Promise<RunnerActivity[]> {
    const queryParams = filter ? `?filter=${filter}` : '';
    const response = await fetch(`${API_URL}/runners/activities${queryParams}`, {
        method: 'GET',
        credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
        throw {
            error: data.error || 'Failed to fetch runner activities',
            status: response.status
        } as ApiError;
    }

    return data;
}
