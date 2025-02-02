import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser } from '@/queries/user';
import { getUserQueryKey } from '@/queries/user';
import { User } from '@phyt/types';

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