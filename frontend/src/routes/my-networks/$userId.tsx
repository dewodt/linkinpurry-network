import { useQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { MoreHorizontal, Search, UserCircle2 } from 'lucide-react';
import * as React from 'react';

import { ErrorPage } from '@/components/shared/error-page';
import { LoadingPage } from '@/components/shared/loading-page';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ListConnectionErrorResponse, ListConnectionSuccessResponse, ListConnectionResponseBody } from '@/types/api/connection';
import { listConnection } from '@/services/connection';

export const Route = createFileRoute('/my-networks/$userId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { userId } = Route.useParams();
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['connections', userId],
    queryFn: () => listConnection({ userId }),
  });

  if (isLoading) return <LoadingPage />;
  if (isError) return <ErrorPage />;

  const filteredConnections = data?.data.connections?.filter(connection =>
    connection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
      <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {data?.data.connections?.length || 0} Connections
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search by name"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">Search with filters</Button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b pb-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Button variant="ghost" size="sm">
            Recently added
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          {filteredConnections?.map((connection: ListConnectionResponseBody['connections'][number]) => (
            <div key={connection.name} className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={connection.profile_photo} alt={connection.name} />
                  <AvatarFallback>
                    <UserCircle2 className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{connection.name}</h3>
                  <p className="text-sm text-gray-600">{connection.work_history || 'No work history'}</p>
                  {/* <p className="mt-1 text-xs text-gray-500">
                    {connection.connection_count} connections
                  </p> */}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button>Message</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Remove connection</DropdownMenuItem>
                    <DropdownMenuItem>Block</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}


export default RouteComponent;