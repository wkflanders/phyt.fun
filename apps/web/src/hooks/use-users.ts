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
import { User, ApiError, CardWithMetadata, CreateUserInput, Transaction } from '@phyt/types';

export function useGetUser() {
    const { user: privyUser, ready, getAccessToken } = usePrivy();

    return useQuery<User, ApiError>({
        queryKey: [USER_QUERY_KEY, privyUser?.id],
        queryFn: async () => {
            if (!privyUser?.id) {
                throw new Error("No authenticated user");
            }
            const token = await getAccessToken();

            const userData = await getUser(privyUser.id, token);
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
    const { getAccessToken } = usePrivy();

    return useMutation<User, ApiError, CreateUserInput>({
        mutationFn: async ({ formData }) => {
            const token = await getAccessToken();
            return createUser({ formData }, token);
        },
        onSuccess: (data: User, { formData }) => {
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
    const { user: privyUser, ready, getAccessToken } = usePrivy();

    return useQuery<Transaction[], ApiError>({
        queryKey: [TRANSACTIONS_QUERY_KEY, privyUser?.id],
        queryFn: async () => {
            if (!privyUser?.id) {
                throw new Error("No authenticated user");
            }
            const token = await getAccessToken();

            const transactionData = await getUserTransactions(privyUser.id, token);
            return transactionData;
        },
        enabled: Boolean(ready && privyUser?.id),
        staleTime: 300000, // 5 minutes
        gcTime: 3600000,  // 1 hour
    });
}

export function useGetUserCards() {
    const { user: privyUser, ready, getAccessToken } = usePrivy();

    return useQuery<CardWithMetadata[], ApiError>({
        queryKey: ["userCards", privyUser?.id],
        queryFn: async () => {
            if (!privyUser?.id) {
                throw new Error("No authenticated user");
            }
            const token = await getAccessToken();

            return getUserCards(privyUser.id, token);
        },
        initialData: [],
        enabled: Boolean(ready && privyUser?.id),
    });
}