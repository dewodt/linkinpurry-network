import { api } from '@/lib/api';
import { ListConnectionRequestParams, ListConnectionSuccessResponse } from '@/types/api/connection';

/**
 * Get profile request
 */
export const listConnection = async ({ userId }: ListConnectionRequestParams) => {
  const axiosResponse = await api.get<ListConnectionSuccessResponse>(`/connection/${userId}`);
  return axiosResponse.data;
};
