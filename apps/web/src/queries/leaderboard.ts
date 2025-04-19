import {
    ApiError,
    RunnerLeaderboard,
    LeaderboardQueryParams,
    ManagerLeaderboard,
    ManagerStanding,
    RunnerStanding
} from '@phyt/types';

import { env } from '@/env';

const API_URL: string = env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const LEADERBOARD_RUNNER_QUERY_KEY = 'leaderboard_runner';
export const LEADERBOARD_USER_QUERY_KEY = 'leaderboard_user';
export const MANAGER_STANDING_QUERY_KEY = 'manager_standing';
export const RUNNER_STANDING_QUERY_KEY = 'runner_standing';

export async function getRunnerLeaderboard(
    params: LeaderboardQueryParams = {},
    token: string
): Promise<RunnerLeaderboard> {
    const { page = 1, limit = 20, timeFrame = 'weekly' } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    searchParams.append('timeFrame', timeFrame);

    const response = await fetch(
        `${API_URL}/leaderboard/runner/?${searchParams.toString()}`,
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
            error: error.error ?? 'Failed to fetch leaderboard',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

export async function getManagerLeaderboard(
    params: LeaderboardQueryParams = {},
    token: string
): Promise<ManagerLeaderboard> {
    const { page = 1, limit = 20, timeFrame = 'weekly' } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    searchParams.append('timeFrame', timeFrame);

    const response = await fetch(
        `${API_URL}/leaderboard/users/?${searchParams.toString()}`,
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
            error: error.error ?? 'Failed to fetch leaderboard',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

export async function getManagerStanding(
    id: string | number,
    params: LeaderboardQueryParams = {},
    token: string
): Promise<ManagerStanding> {
    const { page = 1, limit = 20, timeFrame = 'weekly' } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    searchParams.append('timeFrame', timeFrame);

    const response = await fetch(
        `${API_URL}/leaderboard/manager/${String(id)}?${searchParams.toString()}`,
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
            error: error.error ?? 'Failed to fetch standing',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

export async function getRunnerStanding(
    id: string | number,
    params: LeaderboardQueryParams = {},
    token: string
): Promise<RunnerStanding> {
    const { page = 1, limit = 20, timeFrame = 'weekly' } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    searchParams.append('timeFrame', timeFrame);

    const response = await fetch(
        `${API_URL}/leaderboard/runner/${String(id)}?${searchParams.toString()}`,
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
            error: error.error ?? 'Failed to fetch standing',
            status: response.status
        } as ApiError;
    }

    return response.json();
}
