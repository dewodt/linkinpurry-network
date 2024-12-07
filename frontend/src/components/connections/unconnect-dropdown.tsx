import React from 'react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { LinkedInTrashIcon } from '../icons/linkedin-icons';
import { UnConnectDialog } from './unconnect-dialog';

interface UnconnectDropdownProps {
  //
  children: React.ReactNode;

  // user data
  currentSeenUserId?: string | undefined;

  unConnectToUserId: string;
  unConnectToUsername: string;
}

export function UnConnectDropdown({ children, currentSeenUserId, unConnectToUserId, unConnectToUsername }: UnconnectDropdownProps) {
  // state
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [unConnectOpen, setUnConnectOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="font-medium text-muted-foreground focus:text-muted-foreground"
            onSelect={() => {
              setDropdownOpen(false);
              setUnConnectOpen(true);
            }}
          >
            <LinkedInTrashIcon className="size-5 text-muted-foreground" />
            <span>Remove connection</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UnConnectDialog
        unConnectOpen={unConnectOpen}
        setUnConnectOpen={setUnConnectOpen}
        currentSeenUserId={currentSeenUserId}
        unConnectToUserId={unConnectToUserId}
        unConnectToUsername={unConnectToUsername}
      />
    </>
  );
}
