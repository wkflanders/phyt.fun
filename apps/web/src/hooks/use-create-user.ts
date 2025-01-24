import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser } from '@/queries/user';
import { getUserQueryKey } from '@/queries/user';
import { User } from '@phyt/types';

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUser,
        onSuccess: (data: User, variables) => {
            // Cache the user data using the consistent query key structure
            const queryKey = getUserQueryKey(variables.privy_id);

            // Update the cache with the new user data
            queryClient.setQueryData(queryKey, data);

            // Verify the cache was updated
            const cachedData = queryClient.getQueryData(queryKey);
            console.log('Created user cached successfully:', cachedData);

            // Invalidate any related queries if necessary
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            console.error('Error creating user:', error);
        }
    });
}