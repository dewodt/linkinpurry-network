import { Link } from '@tanstack/react-router';
import { Eye, MoreHorizontal, SquarePen, Trash2 } from 'lucide-react';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn, getRelativeTime } from '@/lib/utils';

import { AvatarUser } from '../shared/avatar-user';
import { DeleteFeedDialog } from './delete-feed-dialog';

export interface CardFeedProps {
  className?: string;

  // Relevant data
  feedId: string;
  userId: string;
  fullName: string;
  username: string;
  profilePhoto: string;
  content: string;
  createdAt: Date;
  editedAt: Date;
  currentUserId: string;

  // Component options
  isDetailOptionVisible?: boolean;
  onSuccessfullDelete?: () => void;
  onSuccessfullEdit?: () => void;
}

export default function CardFeed({
  className = '',
  feedId,
  userId,
  fullName,
  username,
  profilePhoto,
  content,
  createdAt,
  editedAt,
  currentUserId,
  isDetailOptionVisible = true,
  onSuccessfullDelete,
  onSuccessfullEdit,
}: CardFeedProps) {
  // States
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 px-6 pb-3 pt-6">
        <Link to="/users/$userId" params={{ userId }}>
          <AvatarUser classNameAvatar="size-12" src={profilePhoto} alt={`${fullName}'s Avatar`} />
        </Link>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/users/$userId" params={{ userId }}>
                <p className="text-sm font-semibold decoration-2 underline-offset-2 hover:text-primary hover:underline">{fullName}</p>
              </Link>

              <Link to="/users/$userId" params={{ userId }}>
                <p className="text-sm font-medium text-muted-foreground">@{username}</p>
              </Link>

              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <span>{getRelativeTime(new Date(createdAt))}</span>

                {new Date(editedAt).getTime() != new Date(createdAt).getTime() && (
                  <>
                    <span>•</span>
                    <span>Edited</span>
                  </>
                )}
              </div>
            </div>

            {(userId === currentUserId || isDetailOptionVisible) && (
              <>
                {/* Dropdowns */}
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 self-start p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isDetailOptionVisible && (
                      <Link to="/feed/$feedId" params={{ feedId }}>
                        <DropdownMenuItem>
                          <Eye className="size-4" />
                          Detail
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {userId === currentUserId && (
                      <>
                        <DropdownMenuItem>
                          <SquarePen className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => {
                            setIsDropdownOpen(false);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Dialogs */}
                <DeleteFeedDialog
                  feedId={feedId}
                  isDeleteDialogOpen={isDeleteDialogOpen}
                  setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                  onSuccess={onSuccessfullDelete}
                />
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-0 px-6 pb-6 text-sm">
        <p className="break-words">{content}</p>
      </CardContent>
    </Card>
  );
}
