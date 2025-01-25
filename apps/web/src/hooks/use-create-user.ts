import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser } from '@/queries/user';
import { getUserQueryKey } from '@/queries/user';
import { User } from '@phyt/types';

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUser,
        onSuccess: (data: User, variables) => {
            const queryKey = getUserQueryKey(variables.privy_id);

            queryClient.setQueryData(queryKey, data);

            const cachedData = queryClient.getQueryData(queryKey);
            console.log('Created user cached successfully:', cachedData);

            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Error creating user:', error);
        }
    });
}