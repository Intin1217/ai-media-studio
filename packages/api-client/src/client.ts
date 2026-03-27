import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { ApiError } from './types';

export function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    // TODO: Add auth token when authentication is implemented
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      const apiError: ApiError = {
        message: error.response?.data?.message ?? error.message ?? 'Unknown error',
        statusCode: error.response?.status ?? 500,
        errors: error.response?.data?.errors,
      };
      return Promise.reject(apiError);
    },
  );

  return client;
}
