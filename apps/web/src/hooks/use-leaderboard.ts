import { usePrivy } from '@privy-io/react-auth';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
    UUIDv7,
    LeaderboardQueryParams,
    RunnerLeaderboard,
    ManagerLeaderboard,
    ApiError,
    AuthenticationError,
    ManagerStanding,
    RunnerStanding
} from '@phyt/types';

import {
    getManagerLeaderboard,
    getManagerStanding,
    getRunnerLeaderboard,
    getRunnerStanding,
    LEADERBOARD_RUNNER_QUERY_KEY,
    LEADERBOARD_USER_QUERY_KEY,
    MANAGER_STANDING_QUERY_KEY,
    RUNNER_STANDING_QUERY_KEY
} from '@/queries/leaderboard';

export function useGetRunnerLeadeboard(params: LeaderboardQueryParams) {
    const { getAccessToken } = usePrivy();

    return useQuery<RunnerLeaderboard, ApiError>({
        queryKey: [LEADERBOARD_RUNNER_QUERY_KEY, params],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }

            const leaderboardData = await getRunnerLeaderboard(params, token);
            return leaderboardData;
        }
    });
}

export function useGetManagerLeaderboard(params: LeaderboardQueryParams) {
    const { getAccessToken } = usePrivy();

    return useQuery<ManagerLeaderboard, ApiError>({
        queryKey: [LEADERBOARD_USER_QUERY_KEY, params],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }

            const leaderboardData = await getManagerLeaderboard(params, token);
            return leaderboardData;
        }
    });
}

export function useGetManagerStanding(
    id: UUIDv7 | string,
    params: LeaderboardQueryParams
) {
    const { getAccessToken } = usePrivy();

    return useQuery<ManagerStanding, ApiError>({
        queryKey: [MANAGER_STANDING_QUERY_KEY, id, params],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }

            const managerStandingData = await getManagerStanding(
                id,
                params,
                token
            );
            return managerStandingData;
        }
    });
}

export function useGetRunnerStanding(
    id: UUIDv7 | string,
    params: LeaderboardQueryParams
) {
    const { getAccessToken } = usePrivy();

    return useQuery<RunnerStanding, ApiError>({
        queryKey: [RUNNER_STANDING_QUERY_KEY, id, params],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }

            const runnerStandingData = await getRunnerStanding(
                id,
                params,
                token
            );
            return runnerStandingData;
        }
    });
}
