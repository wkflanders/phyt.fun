import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getUser } from "@/queries/user";

export function useGetUser() {
    const { user: privyUser, ready } = usePrivy();

    return useQuery({
        // Query key includes the user’s ID
        queryKey: ["user", privyUser?.id],
        queryFn: () => {
            if (!privyUser?.id) {
                throw new Error("No authenticated user");
            }
            return getUser(privyUser.id);
        },
        // Only run automatically if Privy is ready and we have a user ID
        enabled: ready && !!privyUser?.id,
        // Other options as needed, e.g. staleTime
        staleTime: 60_000,
    });
}