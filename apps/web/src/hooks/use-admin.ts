import { getAccessToken, usePrivy } from '@privy-io/react-auth';
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
    const { getAccessToken } = usePrivy();
    return useQuery({
        queryKey: [PENDING_RUNNERS_QUERY_KEY],
        queryFn: async () => {
            const token = await getAccessToken();
            return getPendingRunners(token);
        }
    });
}

export function usePendingRuns() {
    const { getAccessToken } = usePrivy();
    return useQuery({
        queryKey: [PENDING_RUNS_QUERY_KEY],
        queryFn: async () => {
            const token = await getAccessToken();
            return getPendingRuns(token);
        }
    });
}

export function useApproveRunner() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { getAccessToken } = usePrivy();

    return useMutation({
        mutationFn: async (runnerId: number) => {
            const token = await getAccessToken();
            return approveRunner(runnerId, token);
        },
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
    const { getAccessToken } = usePrivy();

    return useMutation({
        mutationFn: async ({ runId, status }: { runId: number; status: 'verified' | 'flagged'; }) => {
            const token = await getAccessToken();
            updateRunVerification(runId, status, token);
        },
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