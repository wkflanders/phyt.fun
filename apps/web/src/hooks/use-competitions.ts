import { useQuery } from '@tanstack/react-query';
import { Competition } from '@phyt/types';
import { getCompetitions, getMajorCompetitions, getCompetitionsQueryKey } from '@/queries/competitions';

export function useGetCompetitions() {
    return useQuery<Competition[]>({
        queryKey: getCompetitionsQueryKey(),
        queryFn: getCompetitions,
    });
}

export function useGetMajorCompetitions() {
    return useQuery<Competition[]>({
        queryKey: [...getCompetitionsQueryKey(), 'major'],
        queryFn: getMajorCompetitions,
    });
}