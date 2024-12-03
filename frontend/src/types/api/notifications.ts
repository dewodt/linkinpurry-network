import { AxiosError } from 'axios';

import { SuccessResponse } from './common';

export type SubscribePushNotificationSuccessResponse = SuccessResponse<null>;

export type SubscribePushNotificationErrorResponse = AxiosError;
