import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser } from '@/queries/user';
import { User } from '@phyt/types';

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUser,
        onSuccess: (data: User) => {
            queryClient.setQueryData(['user', data.privy_id], data);
        },
    });
}