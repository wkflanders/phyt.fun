import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';

import { getRunners, getRunnersQueryKey, getRunner, getRunnerQueryKey, getRunnerActivities, RUNNER_ACTIVITIES_QUERY_KEY } from '@/queries/runners';

import type { Runner, RunnerProfile, ApiError } from '@phyt/types';

export function useGetRunners(search?: string) {
    const { getAccessToken } = usePrivy();

    return useQuery<RunnerProfile[], ApiError>({
        queryKey: [...getRunnersQueryKey(), { search }],
        queryFn: async () => {
            const token = await getAccessToken();
            return getRunners(token, search);
        },
    });
}

export function useGetRunner(id: number) {
    const { getAccessToken } = usePrivy();

    return useQuery<RunnerProfile, ApiError>({
        queryKey: getRunnerQueryKey(id),
        queryFn: async () => {
            const token = await getAccessToken();
            return getRunner(id, token);
        },
    });
}

export function useGetRunnerActivities(filter?: string) {
    const { getAccessToken } = usePrivy();

    return useQuery({
        queryKey: [RUNNER_ACTIVITIES_QUERY_KEY, filter],
        queryFn: async () => {
            const token = await getAccessToken();
            return getRunnerActivities(token, filter);
        },
        staleTime: 60000,
        refetchInterval: 300000,
    });
}