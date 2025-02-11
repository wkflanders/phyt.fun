import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getPendingRunners,
    getPendingRuns,
    approveRunner,
    updateRunVerification,
    PENDING_RUNNERS_QUERY_KEY,
    PENDING_RUNS_QUERY_KEY
} from '@/queries/admin';
import { useToast } from './use-toast';

export function usePendingRunners() {
    return useQuery({
        queryKey: [PENDING_RUNNERS_QUERY_KEY],
        queryFn: getPendingRunners
    });
}

export function usePendingRuns() {
    return useQuery({
        queryKey: [PENDING_RUNS_QUERY_KEY],
        queryFn: getPendingRuns
    });
}

export function useApproveRunner() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: approveRunner,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PENDING_RUNNERS_QUERY_KEY] });
            toast({
                title: "Success",
                description: "Runner approved successfully",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to approve runner",
                variant: "destructive",
            });
        },
    });
}

export function useUpdateRunVerification() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ runId, status }: { runId: number; status: 'verified' | 'flagged'; }) =>
            updateRunVerification(runId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PENDING_RUNS_QUERY_KEY] });
            toast({
                title: "Success",
                description: "Run verification status updated successfully",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update run verification",
                variant: "destructive",
            });
        },
    });
}