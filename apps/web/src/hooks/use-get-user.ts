import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getUser } from "@/queries/user";
import { User } from "@phyt/types";

export function useGetUser() {
    const { user: privyUser, ready } = usePrivy();
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ["user", privyUser?.id],
        queryFn: async () => {
            console.log("Attempting to fetch user data for:", privyUser?.id);

            // Attempt to get data from cache first
            const cachedData = queryClient.getQueryData<User>(["user", privyUser?.id]);

            if (cachedData) {
                console.log("Found cached user data");
                return cachedData;
            }

            if (!privyUser?.id) {
                throw new Error("No authenticated user");
            }

            console.log("Fetching from API");
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