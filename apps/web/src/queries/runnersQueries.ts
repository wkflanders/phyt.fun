import {
    RunnerIdDTO,
    RunnerDTO,
    CreateRunnerDTO,
    RunnersPageDTO,
    RunDTO,
    CreateRunDTO,
    RunnerActivitiesDTO
} from '@phyt/dto';

import { api } from '@/lib/api';

export const getRunnersQueryKey = () => ['runners'];
export const RUNNER_ACTIVITIES_QUERY_KEY = 'runnerActivities';
export const getRunnerQueryKey = (id: RunnerIdDTO) => ['runners', id];

export async function getRunners(search?: string): Promise<RunnersPageDTO> {
    const response = await api.get<RunnersPageDTO>('/runners', {
        params: { search }
    });
    return response.data;
}

export async function getRunner(id: RunnerIdDTO): Promise<RunnerDTO> {
    const response = await api.get<RunnerDTO>(`/runners/runner/${String(id)}`);
    return response.data;
}

export async function getRunnerActivities(
    filter?: string
): Promise<RunnerActivitiesDTO> {
    const response = await api.get<RunnerActivitiesDTO>('/runners/activities', {
        params: filter ? { filter } : {}
    });
    return response.data;
}

export async function createRunnerApplication(
    runnerData: CreateRunnerDTO
): Promise<RunnerDTO> {
    const response = await api.post<RunnerDTO>('/runners/apply', runnerData);
    return response.data;
}

export async function submitRun(runData: CreateRunDTO): Promise<RunDTO> {
    const response = await api.post<RunDTO>('/runners/submit-run', runData);
    return response.data;
}
