import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { getUserCards } from "@/queries/user";

export function useGetUserCards() {
    const { user: privyUser, ready } = usePrivy();

    return useQuery({
        queryKey: ["userCards", privyUser?.id],
        queryFn: async () => {
            if (!privyUser?.id) {
                throw new Error("No authenticated user");
            }
            return getUserCards(privyUser.id);
        },
        enabled: Boolean(ready && privyUser?.id),
    });
}