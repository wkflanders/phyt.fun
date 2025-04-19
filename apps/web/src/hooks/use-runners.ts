import { AuthenticationError, RunnerProfile, ApiError } from '@phyt/types';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';

import {
    getRunners,
    getRunnersQueryKey,
    getRunner,
    getRunnerQueryKey,
    getRunnerActivities,
    RUNNER_ACTIVITIES_QUERY_KEY
} from '@/queries/runners';

export function useGetRunners(search?: string) {
    const { getAccessToken } = usePrivy();

    return useQuery<RunnerProfile[], ApiError>({
        queryKey: [...getRunnersQueryKey(), { search }],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return getRunners(token, search);
        }
    });
}

export function useGetRunner(id: number) {
    const { getAccessToken } = usePrivy();

    return useQuery<RunnerProfile, ApiError>({
        queryKey: getRunnerQueryKey(id),
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return getRunner(id, token);
        }
    });
}

export function useGetRunnerActivities(filter?: string) {
    const { getAccessToken } = usePrivy();

    return useQuery({
        queryKey: [RUNNER_ACTIVITIES_QUERY_KEY, filter],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return getRunnerActivities(token, filter);
        },
        staleTime: 60000,
        refetchInterval: 300000
    });
}
