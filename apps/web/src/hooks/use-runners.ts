import { useQuery } from '@tanstack/react-query';
import { getRunners, getRunnersQueryKey, getRunner, getRunnerQueryKey, getRunnerActivities, RUNNER_ACTIVITIES_QUERY_KEY } from '@/queries/runners';
import type { Runner } from '@phyt/types';

export function useGetRunners(search?: string) {
    return useQuery<Runner[]>({
        queryKey: [...getRunnersQueryKey(), { search }],
        queryFn: () => getRunners(search),
    });
}

export function useGetRunner(id: number) {
    return useQuery<Runner>({
        queryKey: getRunnerQueryKey(id),
        queryFn: () => getRunner(id),
    });
}

export function useGetRunnerActivities(filter?: string) {
    return useQuery({
        queryKey: [RUNNER_ACTIVITIES_QUERY_KEY, filter],
        queryFn: () => getRunnerActivities(filter),
        staleTime: 60000,
        refetchInterval: 300000,
    });
}