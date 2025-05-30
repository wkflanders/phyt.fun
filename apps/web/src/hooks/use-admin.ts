import { RunnerDTO, RunnerIdDTO } from '@phyt/dto';

import { APIError } from '@phyt/infra';

import {
    getPendingRunners,
    getPendingRuns,
    approveRunner,
    updateRunVerification,
    PENDING_RUNNERS_QUERY_KEY,
    PENDING_RUNS_QUERY_KEY
} from '@/queries/adminQueries';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from './use-toast';

export function usePendingRunners() {
    return useQuery({
        queryKey: [PENDING_RUNNERS_QUERY_KEY],
        queryFn: async () => {
            return getPendingRunners();
        }
    });
}

export function usePendingRuns() {
    return useQuery({
        queryKey: [PENDING_RUNS_QUERY_KEY],
        queryFn: async () => {
            return getPendingRuns();
        }
    });
}

export function useApproveRunner() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<RunnerDTO, APIError, RunnerIdDTO>({
        mutationFn: async (runnerId) => {
            return approveRunner(runnerId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [PENDING_RUNNERS_QUERY_KEY]
            });
            toast({
                title: 'Success',
                description: 'Runner approved successfully'
            });
        },
        onError: (error: APIError) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to approve runner',
                variant: 'destructive'
            });
        }
    });
}

export function useUpdateRunVerification() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({
            runId,
            isVerified
        }: {
            runId: string;
            isVerified: boolean;
        }) => {
            return updateRunVerification(runId, isVerified);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [PENDING_RUNS_QUERY_KEY]
            });
            toast({
                title: 'Success',
                description: 'Run verification updated successfully'
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description:
                    error.message || 'Failed to update run verification',
                variant: 'destructive'
            });
        }
    });
}
