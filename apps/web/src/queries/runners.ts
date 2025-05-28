import { UUIDv7, RunnerProfile, RunnerActivity } from '@phyt/types';

import { api } from '@/lib/api';

export const getRunnersQueryKey = () => ['runners'];
export const RUNNER_ACTIVITIES_QUERY_KEY = 'runnerActivities';
export const getRunnerQueryKey = (id: UUIDv7) => ['runners', id];

export async function getRunners(
    token: string,
    search?: string
): Promise<RunnerProfile[]> {
    const response = await api.get<RunnerProfile[]>('/runners', {
        params: { search },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

export async function getRunner(
    id: UUIDv7,
    token: string
): Promise<RunnerProfile> {
    const response = await api.get<RunnerProfile>(
        `/runners/runner/${String(id)}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}

export async function getRunnerActivities(
    token: string,
    filter?: string
): Promise<RunnerActivity[]> {
    const response = await api.get<RunnerActivity[]>('/runners/activities', {
        params: { filter },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}
