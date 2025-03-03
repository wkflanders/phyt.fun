import { useQuery } from '@tanstack/react-query';
import { Competition, ApiError } from '@phyt/types';
import { getCompetitions, getMajorCompetitions, getCompetitionsQueryKey } from '@/queries/competitions';
import { usePrivy } from '@privy-io/react-auth';

export function useGetCompetitions() {
    const { getAccessToken } = usePrivy();

    return useQuery<Competition[], ApiError>({
        queryKey: getCompetitionsQueryKey(),
        queryFn: async () => {
            const token = await getAccessToken();
            return getCompetitions(token);
        },
    });
}

export function useGetMajorCompetitions() {
    const { getAccessToken } = usePrivy();

    return useQuery<Competition[], ApiError>({
        queryKey: [...getCompetitionsQueryKey(), 'major'],
        queryFn: async () => {
            const token = await getAccessToken();
            return getMajorCompetitions(token);
        },
    });
}