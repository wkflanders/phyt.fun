import { Competition } from '@phyt/types';

import { api } from '@/lib/api';

export const COMPETITIONS_QUERY_KEY = 'competitions';
export const getCompetitionsQueryKey = () => [COMPETITIONS_QUERY_KEY];

export async function getCompetitions(token: string): Promise<Competition[]> {
    const response = await api.get<Competition[]>('/competitions`', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

export async function getMajorCompetitions(
    token: string
): Promise<Competition[]> {
    const allCompetitions = await getCompetitions(token);
    return allCompetitions.filter((comp) => comp.eventType === 'major');
}
