import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { MoreHorizontal, Search, UserCircle2 } from 'lucide-react'
import * as React from 'react'

import { ErrorPage } from '@/components/shared/error-page'
import { LoadingPage } from '@/components/shared/loading-page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConnectionRequest } from '@/services/connection'

export const Route = createFileRoute('/my-networks/connectin-request/$userId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { userId } = Route.useParams()
  const [searchQuery, setSearchQuery] = React.useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['connection-request', userId],
    queryFn: () => ConnectionRequest({ requestId: userId }),
  })

  if (isLoading) return <LoadingPage />
  if (isError) return <ErrorPage />

  const connections = data?.data?.requestsList || []
  const filteredConnections = connections.filter((requestsList) =>
    requestsList.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center gap-6 p-8">
      <Tabs defaultValue="grow" className="w-full max-w-3xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grow">Grow</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex w-full max-w-3xl flex-col gap-4 rounded-lg bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">No pending invitations</h2>
          <Button variant="ghost">Manage</Button>
        </div>
      </div>
    </div>
  )

  const ConnectionsList = () => (
    <div className="flex flex-col items-center gap-6 p-8">
      <Tabs defaultValue="grow" className="w-full max-w-3xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grow">Grow</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="w-full max-w-3xl">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col gap-4 rounded-lg bg-white p-4">
          {filteredConnections.map((requestsList) => (
            <div
              key={requestsList.requestId}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={requestsList.profile_photo} />
                  <AvatarFallback>
                    <UserCircle2 className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{requestsList.name}</h3>
                  <p className="text-sm text-gray-500">
                    {requestsList.work_history}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => console.log('Ignore', requestsList.requestId)}
                >
                  Ignore
                </Button>
                <Button
                  onClick={() => console.log('Accept', requestsList.requestId)}
                >
                  Accept
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Block</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-auto flex-col items-center gap-5 bg-muted p-6 py-12 sm:p-12">
      {connections.length === 0 ? <EmptyState /> : <ConnectionsList />}
    </main>
  )
}

export default RouteComponent
