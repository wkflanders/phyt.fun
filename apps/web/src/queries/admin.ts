import { PendingRunner, PendingRun } from '@phyt/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const PENDING_RUNNERS_QUERY_KEY = 'pendingRunners';
export const PENDING_RUNS_QUERY_KEY = 'pendingRuns';

export const getPendingRunners = async (): Promise<PendingRunner[]> => {
    const response = await fetch(`${API_URL}/api/admin/pending-runners`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch pending runners');
    }

    return response.json();
};

export const getPendingRuns = async (): Promise<PendingRun[]> => {
    const response = await fetch(`${API_URL}/api/admin/pending-runs`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch pending runs');
    }

    return response.json();
};

export const approveRunner = async (runnerId: number) => {
    const response = await fetch(`${API_URL}/api/admin/runners/${runnerId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to approve runner');
    }

    return response.json();
};

export const updateRunVerification = async (runId: number, status: 'verified' | 'flagged') => {
    const response = await fetch(`${API_URL}/api/admin/runs/${runId}/verify`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        throw new Error('Failed to update run verification');
    }

    return response.json();
};