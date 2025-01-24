import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getUser } from '@/queries/user';

export function useGetUser() {
    const { user: privyUser, ready } = usePrivy();
    return useQuery({
        queryKey: ['user', privyUser?.id],
        queryFn: async () => {
            if (!privyUser?.id) {
                throw new Error('No authenticated user');
            }
            return getUser(privyUser.id);
        },
        enabled: ready && !!privyUser?.id,
    });
}