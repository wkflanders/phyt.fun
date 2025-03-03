import { PendingRunner, PendingRun } from '@phyt/types';
import { ApiError } from 'next/dist/server/api-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const PENDING_RUNNERS_QUERY_KEY = 'pendingRunners';
export const PENDING_RUNS_QUERY_KEY = 'pendingRuns';

export const getPendingRunners = async (token: string | null): Promise<PendingRunner[]> => {
    if (!token) {
        throw new Error("No token available. Is user logged in with privy?");
    }

    const response = await fetch(`${API_URL}/api/admin/pending-runners`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch pending runners');
    }

    return response.json();
};

export const getPendingRuns = async (token: string | null): Promise<PendingRun[]> => {
    if (!token) {
        throw new Error("No token available. Is user logged in with privy?");
    }

    const response = await fetch(`${API_URL}/api/admin/pending-runs`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch pending runs');
    }

    return response.json();
};

export const approveRunner = async (runnerId: number, token: string | null) => {
    if (!token) {
        throw new Error("No token available. Is user logged in with privy?");
    }

    const response = await fetch(`${API_URL}/api/admin/runners/${runnerId}/approve`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to approve runner');
    }

    return response.json();
};

export const updateRunVerification = async (runId: number, status: 'verified' | 'flagged', token: string | null) => {
    if (!token) {
        throw new Error("No token available. Is user logged in with privy?");
    }

    const response = await fetch(`${API_URL}/api/admin/runs/${runId}/verify`, {
        method: 'PATCH',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        throw new Error('Failed to update run verification');
    }

    return response.json();
};