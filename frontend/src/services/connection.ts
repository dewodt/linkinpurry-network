import { api } from '@/lib/api';
import {
  ConnectUserRequestBody,
  ConnectUserSuccessResponse,
  DecideConnectionReqRequestBody,
  DecideConnectionReqRequestParams,
  DecideConnectionReqSuccessResponse,
  GetConnectionReqsRequestQuery,
  GetConnectionReqsSuccessResponse,
  GetConnectionsRequestParams,
  GetConnectionsRequestQuery,
  GetConnectionsSuccessResponse,
  UnConnectUserRequestParams,
  UnConnectUserSuccessResponse,
} from '@/types/api/connection';

/**
 * Connect to user
 */
export async function connectUser(body: ConnectUserRequestBody): Promise<ConnectUserSuccessResponse> {
  const axiosResponse = await api.post<ConnectUserSuccessResponse>('/api/connections/requests', body);
  return axiosResponse.data;
}

/**
 * Get connection lists
 */
export async function getConnectionLists(
  params: GetConnectionsRequestParams,
  query: GetConnectionsRequestQuery,
): Promise<GetConnectionsSuccessResponse> {
  const axiosResponse = await api.get<GetConnectionsSuccessResponse>(`/api/users/${params.userId}/connections`, {
    params: query,
  });
  return axiosResponse.data;
}

/**
 * Get connection requests
 */
export async function getConnectionRequests(query: GetConnectionReqsRequestQuery): Promise<GetConnectionReqsSuccessResponse> {
  const axiosResponse = await api.get<GetConnectionReqsSuccessResponse>('/api/connections/requests/pending', {
    params: query,
  });
  return axiosResponse.data;
}

/**
 * Decide conneciton request
 */
export async function decideConnection(
  params: DecideConnectionReqRequestParams,
  body: DecideConnectionReqRequestBody,
): Promise<DecideConnectionReqSuccessResponse> {
  const axiosResponse = await api.post<DecideConnectionReqSuccessResponse>(`/api/connections/requests/${params.fromUserId}/decision`, body);
  return axiosResponse.data;
}

/**
 * Unconnect a user
 */
export async function unConnectUser(params: UnConnectUserRequestParams): Promise<UnConnectUserSuccessResponse> {
  const axiosResponse = await api.delete<UnConnectUserSuccessResponse>(`/api/connections/${params.toUserId}`);
  return axiosResponse.data;
}
