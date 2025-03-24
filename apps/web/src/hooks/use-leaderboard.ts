import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
    getRunnerLeaderboard,
    getUserLeaderboard,
    LEADERBOARD_RUNNER_QUERY_KEY,
    LEADERBOARD_USER_QUERY_KEY,
} from '@/queries/leaderboard';
import { LeaderboardQueryParams, RunnerLeaderboard, UserLeaderboard, ApiError } from '@phyt/types';

export function useGetRunnerLeadeboard(params: LeaderboardQueryParams) {
    const { user: privyUser, getAccessToken } = usePrivy();

    return useQuery<RunnerLeaderboard, ApiError>({
        queryKey: [LEADERBOARD_RUNNER_QUERY_KEY, privyUser?.id],
        queryFn: async () => {
            if (!privyUser?.id) {
                throw new Error("No authenticated user");
            }
            const token = await getAccessToken();

            const leaderboardData = await getRunnerLeaderboard(params, token);
            return leaderboardData;
        },
    });
}

export function useGetUserLeaderboard(params: LeaderboardQueryParams) {
    const { user: privyUser, getAccessToken } = usePrivy();

    return useQuery<UserLeaderboard, ApiError>({
        queryKey: [LEADERBOARD_USER_QUERY_KEY, privyUser?.id],
        queryFn: async () => {
            if (!privyUser?.id) {
                throw new Error("No authenticated user");
            }
            const token = await getAccessToken();

            const leaderboardData = await getUserLeaderboard(params, token);
            return leaderboardData;
        },
    });
}