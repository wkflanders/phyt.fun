import { useQuery } from "@tanstack/react-query";
import { getRunnerActivities, RUNNER_ACTIVITIES_QUERY_KEY } from "@/queries/runners";

export function useGetRunnerActivities(filter?: string) {
    return useQuery({
        queryKey: [RUNNER_ACTIVITIES_QUERY_KEY, filter],
        queryFn: () => getRunnerActivities(filter),
        staleTime: 60000,
        refetchInterval: 300000,
    });
}