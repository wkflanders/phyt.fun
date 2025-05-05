import { usePrivy } from '@privy-io/react-auth';

import { useQuery } from '@tanstack/react-query';

import { Competition, ApiError, AuthenticationError } from '@phyt/types';

import {
    getCompetitions,
    getMajorCompetitions,
    getCompetitionsQueryKey
} from '@/queries/competitions';

export function useGetCompetitions() {
    const { getAccessToken } = usePrivy();

    return useQuery<Competition[], ApiError>({
        queryKey: getCompetitionsQueryKey(),
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return getCompetitions(token);
        }
    });
}

export function useGetMajorCompetitions() {
    const { getAccessToken } = usePrivy();

    return useQuery<Competition[], ApiError>({
        queryKey: [...getCompetitionsQueryKey(), 'major'],
        queryFn: async () => {
            const token = await getAccessToken();
            if (!token) {
                throw new AuthenticationError(
                    'No token available. Is user logged in with privy?'
                );
            }
            return getMajorCompetitions(token);
        }
    });
}
