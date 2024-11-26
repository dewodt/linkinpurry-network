import { api } from '@/lib/api';
import { RegisterRequestBody } from '@/lib/schemas/auth';
import { LoginRequestBody, LoginSuccessResponse, LogoutSuccessResponse, RegisterSuccessResponse, SessionSuccessResponse } from '@/types/api/auth';

/**
 * Session service
 */
export const getSession = async (): Promise<SessionSuccessResponse> => {
  const axiosResponse = await api.get<SessionSuccessResponse>('/api/session');
  return axiosResponse.data;
};

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
export const logout = async (): Promise<LogoutSuccessResponse> => {
  const axiosResponse = await api.post<LogoutSuccessResponse>('/api/logout');
  return axiosResponse.data;
};
