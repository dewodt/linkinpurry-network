import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
}

export function LinkedInLogo({ className }: IconProps): React.ReactNode {
  return (
    <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" className={cn(className)} viewBox="0 0 256 256">
      <path
        d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"
        fill="#0A66C2"
      />
    </svg>
  );
}

export function LinkedInHomeIcon({ className }: IconProps): React.ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      data-supported-dps="24x24"
      fill="currentColor"
      className={cn('mercado-match', className)}
      width="24"
      height="24"
      focusable="false"
    >
      <path d="M23 9v2h-2v7a3 3 0 01-3 3h-4v-6h-4v6H6a3 3 0 01-3-3v-7H1V9l11-7 5 3.18V2h3v5.09z"></path>
    </svg>
  );
}

export function LinkedInNetworkIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      data-supported-dps="24x24"
      fill="currentColor"
      className={cn('mercado-match', className)}
      width="24"
      height="24"
      focusable="false"
    >
      <path d="M12 16v6H3v-6a3 3 0 013-3h3a3 3 0 013 3zm5.5-3A3.5 3.5 0 1014 9.5a3.5 3.5 0 003.5 3.5zm1 2h-2a2.5 2.5 0 00-2.5 2.5V22h7v-4.5a2.5 2.5 0 00-2.5-2.5zM7.5 2A4.5 4.5 0 1012 6.5 4.49 4.49 0 007.5 2z"></path>
    </svg>
  );
}

export function LinkedInChatIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      data-supported-dps="24x24"
      fill="currentColor"
      className={cn('mercado-match', className)}
      width="24"
      height="24"
      focusable="false"
    >
      <path d="M16 4H8a7 7 0 000 14h4v4l8.16-5.39A6.78 6.78 0 0023 11a7 7 0 00-7-7zm-8 8.25A1.25 1.25 0 119.25 11 1.25 1.25 0 018 12.25zm4 0A1.25 1.25 0 1113.25 11 1.25 1.25 0 0112 12.25zm4 0A1.25 1.25 0 1117.25 11 1.25 1.25 0 0116 12.25z"></path>
    </svg>
  );
}

export function LinkedInNotificationIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      data-supported-dps="24x24"
      fill="currentColor"
      className={cn('mercado-match', className)}
      width="24"
      height="24"
      focusable="false"
    >
      <path d="M22 19h-8.28a2 2 0 11-3.44 0H2v-1a4.52 4.52 0 011.17-2.83l1-1.17h15.7l1 1.17A4.42 4.42 0 0122 18zM18.21 7.44A6.27 6.27 0 0012 2a6.27 6.27 0 00-6.21 5.44L5 13h14z"></path>
    </svg>
  );
}

export function LinkedInFindUserIcon({ className }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(className)}>
      <path
        d="M10 13C12.7614 13 15 10.7614 15 8C15 5.23858 12.7614 3 10 3C7.23858 3 5 5.23858 5 8C5 10.7614 7.23858 13 10 13Z"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M2 21C2.00012 19.741 2.29739 18.4997 2.86766 17.3772C3.43792 16.2548 4.26506 15.2827 5.28182 14.5402C6.29858 13.7976 7.47624 13.3056 8.71904 13.104C9.96183 12.9024 11.2347 12.9969 12.434 13.38"
        fill="currentColor"
      />
      <path
        d="M2 21C2.00012 19.741 2.29739 18.4997 2.86766 17.3772C3.43792 16.2548 4.26506 15.2827 5.28182 14.5402C6.29858 13.7976 7.47624 13.3056 8.71904 13.104C9.96183 12.9024 11.2347 12.9969 12.434 13.38"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M18 21C19.6569 21 21 19.6569 21 18C21 16.3431 19.6569 15 18 15C16.3431 15 15 16.3431 15 18C15 19.6569 16.3431 21 18 21Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M22 22L20.1 20.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}
