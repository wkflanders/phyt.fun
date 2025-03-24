import { ApiError, RunnerLeaderboard, LeaderboardQueryParams, ManagerLeaderboard } from "@phyt/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const LEADERBOARD_RUNNER_QUERY_KEY = "leaderboard_runner";
export const LEADERBOARD_USER_QUERY_KEY = "leaderboard_user";

export async function getRunnerLeaderboard(params: LeaderboardQueryParams = {}, token: string | null): Promise<RunnerLeaderboard> {
    const { page = 1, limit = 20, timeFrame = 'weekly' } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    searchParams.append('timeFrame', timeFrame);

    const response = await fetch(`${API_URL}/leaderboard/runner/?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw {
            error: data.error || 'Failed to fetch user',
            status: response.status
        } as ApiError;
    }

    return data;
}

export async function getManagerLeaderboard(params: LeaderboardQueryParams = {}, token: string | null): Promise<ManagerLeaderboard> {
    const { page = 1, limit = 20, timeFrame = 'weekly' } = params;

    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    searchParams.append('timeFrame', timeFrame);

    const response = await fetch(`${API_URL}/leaderboard/users/?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw {
            error: data.error || 'Failed to fetch user',
            status: response.status
        } as ApiError;
    }

    return data;
}