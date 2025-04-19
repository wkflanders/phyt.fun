import { Competition, ApiError } from '@phyt/types';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';

import { getCompetitions, getMajorCompetitions, getCompetitionsQueryKey } from '@/queries/competitions';


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