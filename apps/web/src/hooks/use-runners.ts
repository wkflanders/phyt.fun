import {
    CreateRunnerDTO,
    CreateRunDTO,
    RunDTO,
    RunnerDTO,
    RunnerActivitiesDTO,
    RunnersPageDTO
} from '@phyt/dto';

import { APIError } from '@phyt/infra';

import {
    getRunnerActivities,
    getRunners,
    createRunnerApplication,
    submitRun,
    RUNNER_ACTIVITIES_QUERY_KEY,
    getRunnersQueryKey
} from '@/queries/runnersQueries';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from './use-toast';

export function useGetRunners() {
    return useQuery<RunnersPageDTO, APIError>({
        queryKey: [getRunnersQueryKey()],
        queryFn: async () => {
            return getRunners();
        }
    });
}

export function useGetRunnerActivities(filter?: string) {
    return useQuery<RunnerActivitiesDTO, APIError>({
        queryKey: [RUNNER_ACTIVITIES_QUERY_KEY, filter],
        queryFn: async () => {
            return getRunnerActivities(filter);
        },
        staleTime: 60000,
        refetchInterval: 300000
    });
}

export function useCreateRunnerApplication() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<RunnerDTO, APIError, CreateRunnerDTO>({
        mutationFn: async (runnerData) => {
            return createRunnerApplication(runnerData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [getRunnersQueryKey()]
            });
            toast({
                title: 'Success',
                description: 'Runner application submitted successfully'
            });
        },
        onError: (error: APIError) => {
            toast({
                title: 'Error',
                description:
                    error.message || 'Failed to submit runner application',
                variant: 'destructive'
            });
        }
    });
}

export function useSubmitRun() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<RunDTO, APIError, CreateRunDTO>({
        mutationFn: async (runData) => {
            return submitRun(runData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [RUNNER_ACTIVITIES_QUERY_KEY]
            });
            toast({
                title: 'Success',
                description: 'Run submitted successfully'
            });
        },
        onError: (error: APIError) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to submit run',
                variant: 'destructive'
            });
        }
    });
}
