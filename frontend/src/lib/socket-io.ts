import { io } from 'socket.io-client';

import type { ErrorResponse, SuccessResponse } from '@/types/api/common';

import { Config } from './config';

const chatSocketURL = `${Config.getInstance().get('VITE_BE_URL')}/chat`;

export const socket = io(chatSocketURL, {
  autoConnect: false,
  withCredentials: true,
});

export function emit<T>(eventName: string, data: T) {
  socket.emit(eventName, data);
}

export function emitWithAck<T extends SuccessResponse<any>>(eventName: string, data: any, timeout = 15000): Promise<T> {
  return new Promise((resolve, reject) => {
    // Emit
    socket.emit(eventName, data, (response: T | ErrorResponse) => {
      if (!response.success) {
        // Error
        reject(new Error(response.message));
      } else {
        // Success
        resolve(response);
      }
    });

    setTimeout(() => {
      reject(new Error('Timeout exceeded'));
    }, timeout);
  });
}

export function listenEvent<T>(eventName: string, callback: (data: T) => void) {
  socket.on(eventName, callback);
}
