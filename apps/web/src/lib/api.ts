import { env } from '@/env';

import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig
} from 'axios';

export const api = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
    headers: { 'Content-Type': 'application/json' }
});

let accessTokenPromise: Promise<string | null> | null = null;
let getTokenFunction: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (tokenGetter: () => Promise<string | null>) => {
    getTokenFunction = tokenGetter;
};

const getFreshToken = async (): Promise<string | null> => {
    if (!getTokenFunction) {
        console.warn('Token getter function not set');
        return null;
    }

    if (!accessTokenPromise) {
        accessTokenPromise = getTokenFunction();
        // Clear the promise after resolution to allow fresh requests
        accessTokenPromise.finally(() => {
            accessTokenPromise = null;
        });
    }

    return accessTokenPromise;
};

// Request interceptor to add token to requests
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Skip token injection for requests that don't need auth
        if (config.headers['x-skip-auth']) {
            delete config.headers['x-skip-auth'];
            return config;
        }

        const token = await getFreshToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: Error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Force refresh token by clearing cache and getting new one
                accessTokenPromise = null;
                const newToken = await getFreshToken();

                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return await api(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Redirect to login or refresh page
                if (typeof window !== 'undefined') {
                    window.location.href =
                        '/refresh?redirect_uri=' +
                        encodeURIComponent(
                            window.location.pathname + window.location.search
                        );
                }
                return Promise.reject(new Error('Token refresh failed'));
            }
        }

        // For other errors, create proper error response
        if (
            error.response?.data &&
            typeof error.response.data === 'object' &&
            'error' in error.response.data
        ) {
            const errorData = error.response.data as { error: string };
            const errorMessage = errorData.error || error.message;
            const customError = new Error(errorMessage) as Error & {
                status?: number;
            };
            customError.status = error.response.status;
            return Promise.reject(customError);
        }

        return Promise.reject(new Error(error.message));
    }
);
