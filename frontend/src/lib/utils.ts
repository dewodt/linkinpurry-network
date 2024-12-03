import { type ClassValue, clsx } from 'clsx';
import { differenceInDays } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get formatted time in 12 hours format
 *
 * @param datetime
 * @returns
 */
export const getFormattedTime = (datetime: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(datetime);
};

/**
 * Get relative time from now
 *
 * @param datetime
 * @returns
 */
export const getRelativeTime = (datetime: Date): string => {
  // Get now
  const now = new Date();

  if (differenceInDays(now, datetime) === 0) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(datetime);
  } else if (differenceInDays(now, datetime) < 7) {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
    }).format(datetime);
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    }).format(datetime);
  }
};

/**
 * Grouping by date
 *
 * @param datetime
 * @returns
 */
export const getGrouppedMessageKey = (datetime: Date): string => {
  // Get now
  const now = new Date();

  if (differenceInDays(now, datetime) === 0) {
    return 'Today';
  } else if (differenceInDays(now, datetime) === 1) {
    return 'Yesterday';
  } else if (differenceInDays(now, datetime) < 7) {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
    }).format(datetime);
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    }).format(datetime);
  }
};
