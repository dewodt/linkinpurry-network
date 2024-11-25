import axios, { AxiosError } from 'axios';

import { Config } from './config';

const api = axios.create({
  baseURL: Config.getInstance().get('VITE_BE_URL'),
  withCredentials: true,
});

api.defaults.headers.common['Content-Type'] = 'application/json';

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // const { response } = error;

    // if (response && response.status === 401) {
    //   const currentPath = window.location.pathname;
    //   if (currentPath !== '/auth/login') {
    //     window.location.href = '/auth/login';
    //   }
    // }

    return Promise.reject(error);
  },
);

export { api };
