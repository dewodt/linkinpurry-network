import { api } from '@/lib/api';
import {
  GetProfileRequestParams,
  GetProfileSuccessResponse,
  UpdateProfileRequestBody,
  UpdateProfileRequestParams,
  UpdateProfileSuccessResponse,
} from '@/types/api/user';

/**
 * Get profile request
 */
export const getProfile = async ({ userId }: GetProfileRequestParams) => {
  const axiosResponse = await api.get<GetProfileSuccessResponse>(`/api/profile/${userId}`);
  return axiosResponse.data;
};

/**
 * Update profile request
 */
export const updateProfile = async ({ userId }: UpdateProfileRequestParams, body: UpdateProfileRequestBody) => {
  // create form data
  const formData = new FormData();
  formData.set('username', body.username);
  formData.set('name', body.name);
  if (body.profile_photo) {
    formData.set('profile_photo', body.profile_photo);
  }
  if (body.work_history) {
    formData.set('work_history', body.work_history);
  }
  if (body.skills) {
    formData.set('skills', body.skills);
  }

  const axiosResponse = await api.put<UpdateProfileSuccessResponse>(`/api/profile/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return axiosResponse.data;
};
