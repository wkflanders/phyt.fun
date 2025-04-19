import { Competition, ApiError } from '@phyt/types';

import { env } from '@/env';

const API_URL: string = env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const COMPETITIONS_QUERY_KEY = 'competitions';
export const getCompetitionsQueryKey = () => [COMPETITIONS_QUERY_KEY];

export async function getCompetitions(token: string): Promise<Competition[]> {
    const response = await fetch(`${API_URL}/competitions`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error ?? 'Failed to fetch competition',
            status: response.status
        } as ApiError;
    }

    return response.json();
}

export async function getMajorCompetitions(
    token: string
): Promise<Competition[]> {
    const allCompetitions = await getCompetitions(token);
    return allCompetitions.filter((comp) => comp.event_type === 'major');
}
