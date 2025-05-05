import axios, { AxiosError } from 'axios';

import { ApiError } from '@phyt/types';

import { env } from '@/env';

interface ErrorResponse {
    error: string;
}

function isErrorResponse(x: unknown): x is ErrorResponse {
    return (
        typeof x === 'object' &&
        x !== null &&
        typeof (x as Record<string, unknown>).error === 'string'
    );
}

export const api = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
    (resp) => resp,
    (error: unknown) => {
        if (axios.isAxiosError(error)) {
            const rawData: unknown = error.response?.data;

            const errData = isErrorResponse(rawData) ? rawData : undefined;

            const message = errData?.error ?? error.message;
            const status = error.response?.status ?? 503;

            throw new ApiError(message, status, errData);
        }

        const fallbackMsg =
            error instanceof Error ? error.message : 'Unknown error';
        throw new ApiError(fallbackMsg, 503);
    }
);
