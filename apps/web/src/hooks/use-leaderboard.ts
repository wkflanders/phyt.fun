import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
    getManagerLeaderboard,
    getManagerStanding,
    getRunnerLeaderboard,
    getRunnerStanding,
    LEADERBOARD_RUNNER_QUERY_KEY,
    LEADERBOARD_USER_QUERY_KEY,
    MANAGER_STANDING_QUERY_KEY,
    RUNNER_STANDING_QUERY_KEY,
} from '@/queries/leaderboard';
import { LeaderboardQueryParams, RunnerLeaderboard, ManagerLeaderboard, ApiError, ManagerStanding, RunnerStanding } from '@phyt/types';

export function useGetRunnerLeadeboard(params: LeaderboardQueryParams) {
    const { getAccessToken } = usePrivy();

    return useQuery<RunnerLeaderboard, ApiError>({
        queryKey: [LEADERBOARD_RUNNER_QUERY_KEY],
        queryFn: async () => {
            const token = await getAccessToken();

            const leaderboardData = await getRunnerLeaderboard(params, token);
            return leaderboardData;
        },
    });
}

export function useGetManagerLeaderboard(params: LeaderboardQueryParams) {
    const { getAccessToken } = usePrivy();

    return useQuery<ManagerLeaderboard, ApiError>({
        queryKey: [LEADERBOARD_USER_QUERY_KEY],
        queryFn: async () => {
            const token = await getAccessToken();

            const leaderboardData = await getManagerLeaderboard(params, token);
            return leaderboardData;
        },
    });
}

export function useGetManagerStanding(id: string | number, params: LeaderboardQueryParams) {
    const { getAccessToken } = usePrivy();

    return useQuery<ManagerStanding, ApiError>({
        queryKey: [MANAGER_STANDING_QUERY_KEY],
        queryFn: async () => {
            const token = await getAccessToken();

            const managerStandingData = await getManagerStanding(id, params, token);
            return managerStandingData;
        },
    });
}

export function useGetRunnerStanding(id: string | number, params: LeaderboardQueryParams) {
    const { getAccessToken } = usePrivy();

    return useQuery<RunnerStanding, ApiError>({
        queryKey: [RUNNER_STANDING_QUERY_KEY],
        queryFn: async () => {
            const token = await getAccessToken();

            const runnerStandingData = await getRunnerStanding(id, params, token);
            return runnerStandingData;
        },
    });
}   