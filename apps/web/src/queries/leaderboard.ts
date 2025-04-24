import {
    UUIDv7,
    RunnerLeaderboard,
    LeaderboardQueryParams,
    ManagerLeaderboard,
    ManagerStanding,
    RunnerStanding
} from '@phyt/types';

import { api } from '@/lib/api';

export const LEADERBOARD_RUNNER_QUERY_KEY = 'leaderboard_runner';
export const LEADERBOARD_USER_QUERY_KEY = 'leaderboard_user';
export const MANAGER_STANDING_QUERY_KEY = 'manager_standing';
export const RUNNER_STANDING_QUERY_KEY = 'runner_standing';

export async function getManagerLeaderboard(
    { page = 1, limit = 20, timeFrame = 'weekly' }: LeaderboardQueryParams = {},
    token: string
): Promise<ManagerLeaderboard> {
    const response = await api.get<ManagerLeaderboard>('/leaderboard/users/', {
        params: { page, limit, timeFrame },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

export async function getManagerStanding(
    id: UUIDv7 | string,
    { page = 1, limit = 20, timeFrame = 'weekly' }: LeaderboardQueryParams = {},
    token: string
): Promise<ManagerStanding> {
    const response = await api.get<ManagerStanding>(
        `/leaderboard/manager/${String(id)}`,
        {
            params: { page, limit, timeFrame },
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}

export async function getRunnerLeaderboard(
    { page = 1, limit = 20, timeFrame = 'weekly' }: LeaderboardQueryParams = {},
    token: string
): Promise<RunnerLeaderboard> {
    const response = await api.get<RunnerLeaderboard>('/leaderboard/runner/', {
        params: { page, limit, timeFrame },
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

export async function getRunnerStanding(
    id: UUIDv7 | string,
    { page = 1, limit = 20, timeFrame = 'weekly' }: LeaderboardQueryParams = {},
    token: string
): Promise<RunnerStanding> {
    const response = await api.get<RunnerStanding>(
        `/leaderboard/runner/${String(id)}`,
        {
            params: { page, limit, timeFrame },
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    return response.data;
}
