import { ApiError } from '@phyt/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatSeasonName = (seasonId: string): string => {
    return seasonId
        .replace('season_', 'Season ')
        .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
};
