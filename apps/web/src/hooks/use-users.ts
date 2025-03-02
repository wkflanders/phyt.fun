import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import {
    getUser,
    getUserCards,
    getUserTransactions,
    createUser,
    getUserQueryKey,
    USER_QUERY_KEY,
    TRANSACTIONS_QUERY_KEY
} from '@/queries/user';
import { User, ApiError, CardWithMetadata, CreateUserInput } from '@phyt/types';

export function useGetUser() {
    const { user: privyUser, ready } = usePrivy();

    return useQuery<User, ApiError>({
        queryKey: [USER_QUERY_KEY, privyUser?.id],
        queryFn: async ({ queryKey }) => {
            if (!privyUser?.id) {
                throw new Error("No authenticated user");
            }

            const userData = await getUser(privyUser.id);
            return userData;
        },
        enabled: Boolean(ready && privyUser?.id),
        staleTime: 300000, // 5 minutes
        gcTime: 3600000,  // 1 hour
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUser,
        onSuccess: (data: User, { formData }) => {
            // Get privy_id from formData
            const privyId = formData.get('privy_id') as string;
            const queryKey = getUserQueryKey(privyId);

            queryClient.setQueryData(queryKey, data);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Error creating user:', error);
        }
    });
}

export function useGetUserTransactions() {
    const { user: privyUser, ready } = usePrivy();

    return useQuery({
        queryKey: [TRANSACTIONS_QUERY_KEY, privyUser?.id],
        queryFn: async ({ queryKey }) => {
            console.log("Query function executing for:", queryKey[1]);

            if (!privyUser?.id) {
                throw new Error("No authenticated user");
            }

            const transactionData = await getUserTransactions(privyUser.id);
            return transactionData;
        },
        enabled: Boolean(ready && privyUser?.id),
        staleTime: 300000, // 5 minutes
        gcTime: 3600000,  // 1 hour
    });
}

export function useGetUserCards() {
    const { user: privyUser, ready } = usePrivy();

    return useQuery({
        queryKey: ["userCards", privyUser?.id],
        queryFn: async (): Promise<CardWithMetadata[]> => {
            if (!privyUser?.id) {
                throw new Error("No authenticated user");
            }
            return getUserCards(privyUser.id);
        },
        enabled: Boolean(ready && privyUser?.id),
    });
}