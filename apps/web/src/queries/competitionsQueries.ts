import { CompetitionsPageDTO } from '@phyt/dto';

import { api } from '@/lib/api';

export const COMPETITIONS_QUERY_KEY = 'competitions';
export const MAJOR_COMPETITIONS_QUERY_KEY = 'majorCompetitions';
export const getCompetitionsQueryKey = () => [COMPETITIONS_QUERY_KEY];

export async function getCompetitions(): Promise<CompetitionsPageDTO> {
    const response = await api.get<CompetitionsPageDTO>('/competitions');
    return response.data;
}

export async function getMajorCompetitions(): Promise<CompetitionsPageDTO> {
    const response = await api.get<CompetitionsPageDTO>('/competitions/major');
    return response.data;
}
