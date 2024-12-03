import { api } from '@/lib/api';
import { SubscribePushNotificationSuccessResponse } from '@/types/api/notifications';

export const subscribeNotification = async (data: PushSubscription): Promise<SubscribePushNotificationSuccessResponse> => {
  const axiosResponse = await api.post<SubscribePushNotificationSuccessResponse>('/api/notifications/subscription', JSON.stringify(data));
  return axiosResponse.data;
};
