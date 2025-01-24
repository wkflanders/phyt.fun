import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getUser } from "@/queries/user";

import { getUserQueryKey, USER_QUERY_KEY } from '@/queries/user';

export function useGetUser() {
    const { user: privyUser, ready } = usePrivy();

    return useQuery({
        queryKey: [USER_QUERY_KEY, privyUser?.id],
        queryFn: async ({ queryKey }) => {
            console.log("Query function executing for:", queryKey[1]);

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