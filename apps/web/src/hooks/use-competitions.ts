import { CompetitionsPageDTO } from '@phyt/dto';

import { APIError } from '@phyt/infra';

import {
    getCompetitions,
    getMajorCompetitions,
    getCompetitionsQueryKey
} from '@/queries/competitionsQueries';

import { useQuery } from '@tanstack/react-query';

export function useGetCompetitions() {
    return useQuery<CompetitionsPageDTO, APIError>({
        queryKey: getCompetitionsQueryKey(),
        queryFn: async () => {
            return getCompetitions();
        }
    });
}

export function useGetMajorCompetitions() {
    return useQuery<CompetitionsPageDTO, APIError>({
        queryKey: ['majorCompetitions'],
        queryFn: async () => {
            return getMajorCompetitions();
        }
    });
}
