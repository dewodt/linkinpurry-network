import { api } from '@/lib/api';
import {
  ListConnectionRequestParams,
  ListConnectionSuccessResponse,
  ConnectionRequestParams,
  ConnectionRequestSuccessResponse
} from '@/types/api/connection';

/**
 * List Connection request
 */
export const listConnection = async ({ userId }: ListConnectionRequestParams) => {
  const axiosResponse = await api.get<ListConnectionSuccessResponse>(`/connection/${userId}`);
  return axiosResponse.data;
};

/**
 * List Connection request
 */
export const ConnectionRequest = async ({ requestId }: ConnectionRequestParams) => {
  const axiosResponse = await api.get<ConnectionRequestSuccessResponse>(`/connection_request/${requestId}`);
  return axiosResponse.data;
};

