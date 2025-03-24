import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { ApiError } from "@phyt/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleApiError = async (response: Response): Promise<ApiError> => {
  const errorData = await response.json();
  return {
    name: 'ApiError',
    message: errorData.error || 'An unexpected error has occurred',
    error: errorData.error,
    status: response.status
  };
};

export const formatSeasonName = (seasonId: string): string => {
  return seasonId
    .replace('season_', 'Season ')
    .replace(/(^|\s)\S/g, letter => letter.toUpperCase());
};