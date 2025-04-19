import { env } from '@/env';
import { PendingRunner, PendingRun, ApiError } from '@phyt/types';

const API_URL: string = env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const PENDING_RUNNERS_QUERY_KEY = 'pendingRunners';
export const PENDING_RUNS_QUERY_KEY = 'pendingRuns';

export const getPendingRunners = async (
    token: string
): Promise<PendingRunner[]> => {
    const response = await fetch(`${API_URL}/admin/pending-runners`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to fetch pending runners',
            status: response.status
        } as ApiError;
    }

    return response.json();
};

export const getPendingRuns = async (token: string): Promise<PendingRun[]> => {
    const response = await fetch(`${API_URL}/admin/pending-runs`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to fetch pending runs',
            status: response.status
        } as ApiError;
    }

    return response.json();
};

export const approveRunner = async (runnerId: number, token: string) => {
    const response = await fetch(
        `${API_URL}/admin/runners/${String(runnerId)}/approve`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to approve runner',
            status: response.status
        } as ApiError;
    }

    return response.json();
};

export const updateRunVerification = async (
    runId: number,
    status: 'verified' | 'flagged',
    token: string
) => {
    const response = await fetch(
        `${API_URL}/admin/runs/${String(runId)}/verify`,
        {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to update run verification',
            status: response.status
        } as ApiError;
    }

    return response.json();
};
