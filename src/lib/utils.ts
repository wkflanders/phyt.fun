import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { ApiError } from "../../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleApiError = async (response: Response): Promise<ApiError> => {
  const errorData = await response.json();
  return {
    error: errorData.error || 'An unexpected error has occurred',
    status: response.status
  };
};