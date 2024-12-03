import { useNavigate, useSearch } from '@tanstack/react-router';
import { SearchIcon, SquarePen } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { NewChatDialog } from './new-chat-dialog';

export function ChatHeader() {
  // hooks
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/messaging/' });

  // Store search state at url
  const debouncedSearchCallback = useDebouncedCallback(
    (val: string) => navigate({ to: '/messaging', search: { ...searchParams, search: val } }),
    500,
  );

  // Handlers
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // prevent reload
    e.preventDefault();
  };

  return (
    <header className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:gap-6">
      <h1 className="text-lg font-semibold">Messaging</h1>

      <div className="flex flex-row items-center gap-3 sm:flex-auto sm:justify-between">
        {/* Search messages */}
        <search className="flex-auto">
          <form className="relative flex flex-1 sm:max-w-64" onSubmit={handleFormSubmit}>
            <label htmlFor="search-messages" className="sr-only"></label>
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              id="search-messages"
              placeholder="Search messages"
              className="h-9 bg-muted pl-9 text-sm"
              onChange={(e) => debouncedSearchCallback(e.target.value)}
            />
          </form>
        </search>

        {/* New chat dialog */}
        <NewChatDialog>
          <Button size="icon-sm" className="rounded-full" variant="ghost">
            <SquarePen className="size-6" />
          </Button>
        </NewChatDialog>
      </div>
    </header>
  );
}
