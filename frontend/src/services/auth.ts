import { api } from '@/lib/api';
import { RegisterRequestBody } from '@/lib/schemas/auth';
import { LoginRequestBody, LoginSuccessResponse, RegisterSuccessResponse } from '@/types/api/auth';

/**
 * Login service
 */
export const login = async (data: LoginRequestBody): Promise<LoginSuccessResponse> => {
  const axiosResponse = await api.post<LoginSuccessResponse>('/api/login', data);
  return axiosResponse.data;
};

/**
 * Register service
 */
export const register = async (data: RegisterRequestBody): Promise<RegisterSuccessResponse> => {
  const axiosResponse = await api.post<RegisterSuccessResponse>('/api/register', data);
  return axiosResponse.data;
};

/**
 * Logout service
 */
export const logout = async (): Promise<void> => {
  await api.post('/api/logout');
};
