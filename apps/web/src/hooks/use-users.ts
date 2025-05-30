import { UserDTO, CreateUserDTO, TransactionsPageDTO } from '@phyt/dto';

import { APIError } from '@phyt/infra';

import {
    getUser,
    getUserTransactions,
    createUser,
    getUserQueryKey,
    USER_QUERY_KEY,
    TRANSACTIONS_QUERY_KEY
} from '@/queries/usersQueries';

import { usePrivy } from '@privy-io/react-auth';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useGetUser() {
    const { user: privyUser, ready } = usePrivy();

    return useQuery<UserDTO, APIError>({
        queryKey: [USER_QUERY_KEY, privyUser?.id],
        queryFn: async () => {
            if (!privyUser?.id) {
                throw new Error('No authenticated user');
            }
            const userData = await getUser(privyUser.id);
            return userData;
        },
        enabled: Boolean(ready && privyUser?.id),
        staleTime: 300000, // 5 minutes
        gcTime: 3600000, // 1 hour
        refetchOnMount: false,
        refetchOnWindowFocus: false
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation<UserDTO, APIError, CreateUserDTO>({
        mutationFn: async (userData) => {
            return createUser(userData);
        },
        onSuccess: (returnedUser, inputData) => {
            const privyId = inputData.privyId;
            const queryKey = getUserQueryKey(privyId);

            queryClient.setQueryData(queryKey, returnedUser);
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Error creating user:', error);
        }
    });
}

export function useGetUserTransactions() {
    const { user: privyUser, ready } = usePrivy();

    return useQuery<TransactionsPageDTO, APIError>({
        queryKey: [TRANSACTIONS_QUERY_KEY, privyUser?.id],
        queryFn: async () => {
            if (!privyUser?.id) {
                throw new Error('No authenticated user');
            }
            const transactionData = await getUserTransactions(privyUser.id);
            return transactionData;
        },
        enabled: Boolean(ready && privyUser?.id),
        staleTime: 300000, // 5 minutes
        gcTime: 3600000 // 1 hour
    });
}

// export function useGetUserCards() {
//     const { user: privyUser, ready, getAccessToken } = usePrivy();

//     return useQuery<CardWithMetadata[], APIError>({
//         queryKey: ['userCards', privyUser?.id],
//         queryFn: async () => {
//             if (!privyUser?.id) {
//                 throw new Error('No authenticated user');
//             }
//             const token = await getAccessToken();
//             if (!token) {
//                 throw new AuthenticationError(
//                     'No token available. Is user logged in with privy?'
//                 );
//             }
//             return getUserCards(privyUser.id, token);
//         },
//         enabled: Boolean(ready && privyUser?.id)
//     });
// }
