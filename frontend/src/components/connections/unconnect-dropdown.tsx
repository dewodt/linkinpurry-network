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
  // dropdown state
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // dialog state
  const [unConnectOpen, setUnConnectOpen] = React.useState(false);

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {/* Unconnect */}
        <UnConnectDialog
          unConnectOpen={unConnectOpen}
          setDropdownOpen={setDropdownOpen}
          setUnConnectOpen={setUnConnectOpen}
          currentSeenUserId={currentSeenUserId}
          unConnectToUserId={unConnectToUserId}
          unConnectToUsername={unConnectToUsername}
        >
          <DropdownMenuItem
            className="font-medium text-muted-foreground focus:text-muted-foreground"
            onSelect={(e) => {
              e.preventDefault();
              setUnConnectOpen(true);
            }}
          >
            <LinkedInTrashIcon className="size-5 text-muted-foreground" />
            <span>Remove connection</span>
          </DropdownMenuItem>
        </UnConnectDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
