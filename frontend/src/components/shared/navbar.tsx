import { Link, useLocation } from '@tanstack/react-router';
import { ChevronDown, FileText, LogOut, Menu, Search as SearchIcon, UserCircle2, X } from 'lucide-react';

import React from 'react';

import { LinkedInFindUserIcon, LinkedInHomeIcon, LinkedInLogo, LinkedInNetworkIcon } from '@/components/icons/linkedin-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  // const debouncedSearch = useDebounce(searchQuery, 750);

  const session: object | null = null;

  // const { data } = useQuery({
  //   queryKey: ['session'],
  //   // Assuming you have an API endpoint to fetch session
  //   queryFn: async () => {
  //     const res = await fetch('/api/auth/session');
  //     if (!res.ok) throw new Error('Failed to fetch session');
  //     return res.json();
  //   },
  // });

  // const handleSearch = React.useCallback(
  //   e => {
  //     e.preventDefault();
  //     // Handle search logic here
  //     const baseUrl = session?.role === 'COMPANY' ? '/company/jobs' : '/jobs';
  //     window.location.href = `${baseUrl}?search=${encodeURIComponent(debouncedSearch)}`;
  //   },
  //   [debouncedSearch, session],
  // );

  // const handleSignOut = React.useCallback(async () => {
  //   try {
  //     const res = await fetch('/api/auth/sign-out', {
  //       method: 'POST',
  //       credentials: 'include',
  //     });
  //     if (!res.ok) throw new Error('Failed to sign out');
  //     window.location.href = '/';
  //   } catch (error) {
  //     console.error('Sign out failed:', error);
  //   }
  // }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-center border-b bg-background px-6 md:px-16">
      {/* Container */}
      <div className="flex flex-1 items-center justify-between gap-4 md:gap-9 lg:max-w-4xl">
        {/* Search & logo */}
        <div className="flex flex-1 items-center gap-3 md:gap-4">
          {/* Logo */}
          <Link to="/">
            <LinkedInLogo className="size-9 text-primary" />
          </Link>

          {/* Search */}
          <search>
            <form className="relative flex max-w-64 flex-1">
              <label htmlFor="search-people" className="sr-only"></label>
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                id="search-people"
                placeholder="Search for people"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 bg-muted pl-9 text-sm"
              />
            </form>
          </search>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-12 md:flex">
          <ul className="flex items-center gap-9">
            <li>
              <NavLink href="/feed" icon={LinkedInHomeIcon}>
                Home
              </NavLink>
            </li>

            <li>
              <NavLink href="/my-networks" icon={LinkedInNetworkIcon}>
                My Networks
              </NavLink>
            </li>

            <li>
              <NavLink href="/explore" icon={LinkedInFindUserIcon}>
                Explore
              </NavLink>
            </li>
          </ul>

          {/* Login button */}
          {!session && (
            <Link to="/auth/login">
              <Button size="sm" className="px-5">
                Login
              </Button>
            </Link>
          )}
        </nav>

        {session && <UserDropdown />}

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9 p-1 md:hidden">
              <Menu className="size-full" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-[240px] px-8 py-16 md:hidden"
            customClose={
              <SheetClose className="absolute right-7 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                <X className="size-6" />
                <span className="sr-only">Close</span>
              </SheetClose>
            }
          >
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>

            <nav className="mt-5 flex flex-col gap-7">
              <ul className="flex flex-col gap-5">
                {session && (
                  <>
                    <li>
                      <NavLink href="/feed" icon={LinkedInHomeIcon}>
                        Home
                      </NavLink>
                    </li>

                    <li>
                      <NavLink href="/my-network" icon={LinkedInNetworkIcon}>
                        My Network
                      </NavLink>
                    </li>
                  </>
                )}

                <li>
                  <NavLink href="/explore" icon={LinkedInFindUserIcon}>
                    Explore
                  </NavLink>
                </li>
              </ul>

              {!session && (
                <div className="self-center">
                  <Link to="/auth/login">
                    <Button className="px-6">Login</Button>
                  </Link>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

const NavLink = ({
  href,
  icon: Icon,
  children,
  className,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(href);

  return (
    <Link
      to={href}
      className={cn(
        'flex flex-row items-center gap-2.5 text-base font-medium tracking-wide text-muted-foreground transition-colors hover:text-primary md:flex-col md:gap-[1px] md:text-xs',
        isActive && 'font-semibold text-primary',
        className,
      )}
    >
      <Icon className="size-6" />
      <span>{children}</span>
    </Link>
  );
};

function UserDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex flex-col items-center gap-[1px] focus:outline-none">
        <Avatar className="size-6">
          <AvatarImage src="https://github.com/shadcn.png" alt="Profile picture" />
          <AvatarFallback>
            <UserCircle2 className="size-full stroke-gray-500 stroke-[1.5px]" />
          </AvatarFallback>
        </Avatar>

        <div className="hidden flex-row items-center text-muted-foreground hover:text-primary md:flex">
          <p className="text-xs font-medium tracking-wide transition-colors">Me</p>
          <ChevronDown className="size-4" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72" align="end">
        <DropdownMenuGroup>
          <div className="flex items-center gap-3 p-3">
            <Avatar className="size-14">
              <AvatarImage src="https://github.com/shadcn.png" alt="Profile picture" />
              <AvatarFallback>
                <UserCircle2 className="size-full stroke-gray-500 stroke-[1.5px]" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h3 className="font-semibold">Dewantoro Triatmojo</h3>
              <p className="text-sm text-muted-foreground">Student at Bandung Institute of Technology</p>
            </div>
          </div>

          <div className="mt-1 flex w-full px-3.5">
            <Button variant="secondary" size={'sm'} className="flex-auto">
              View Profile
            </Button>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="mt-4" />

        {/* Atur atur sebutuhny delete/tambah/edit */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 font-semibold text-foreground">Manage</DropdownMenuLabel>
          <DropdownMenuItem className="px-3 py-2">
            <FileText className="mr-2 size-4" />
            <span>Posts</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="px-3 py-2">
            <LogOut className="mr-2 size-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Navbar;
