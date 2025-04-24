import { UUIDv7, PendingRunner, PendingRun } from '@phyt/types';

import { api } from '@/lib/api';

export const PENDING_RUNNERS_QUERY_KEY = 'pendingRunners';
export const PENDING_RUNS_QUERY_KEY = 'pendingRuns';

export const getPendingRunners = async (
    token: string
): Promise<PendingRunner[]> => {
    const response = await api.get<PendingRunner[]>('/admin/pending-runners', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getPendingRuns = async (token: string): Promise<PendingRun[]> => {
    const response = await api.get<PendingRun[]>('/admin/pending-runs', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const approveRunner = async (
    runnerId: UUIDv7,
    token: string
): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(
        `/admin/runners/${String(runnerId)}/approve`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
};

export const updateRunVerification = async (
    runId: UUIDv7,
    status: 'verified' | 'flagged',
    token: string
): Promise<{ success: boolean }> => {
    const response = await api.patch<{ success: boolean }>(
        `/admin/runs/${String(runId)}/verify`,
        status,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
};
