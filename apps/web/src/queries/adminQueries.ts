import { RunnerIdDTO, RunnerDTO } from '@phyt/dto';

import { PendingRunner, PendingRun } from '@phyt/types';

import { api } from '@/lib/api';

export const PENDING_RUNNERS_QUERY_KEY = 'pendingRunners';
export const PENDING_RUNS_QUERY_KEY = 'pendingRuns';

export const getPendingRunners = async (): Promise<PendingRunner[]> => {
    const response = await api.get<PendingRunner[]>('/admin/pending-runners');
    return response.data;
};

export const getPendingRuns = async (): Promise<PendingRun[]> => {
    const response = await api.get<PendingRun[]>('/admin/pending-runs');
    return response.data;
};

export const approveRunner = async (
    runnerId: RunnerIdDTO
): Promise<RunnerDTO> => {
    const response = await api.patch<RunnerDTO>(
        `/admin/approve-runner/${runnerId}`
    );
    return response.data;
};

export const updateRunVerification = async (
    runId: string,
    isVerified: boolean
): Promise<void> => {
    await api.patch(`/admin/verify-run/${runId}`, { isVerified });
};
