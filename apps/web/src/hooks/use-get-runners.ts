import { useQuery } from '@tanstack/react-query';
import { getRunners, getRunnersQueryKey, getRunner, getRunnerQueryKey } from '@/queries/runners';
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