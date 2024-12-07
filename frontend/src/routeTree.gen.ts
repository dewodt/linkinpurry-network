/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols
// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.
// Import Routes
import { Route as rootRoute } from './routes/__root';
import { Route as AuthImport } from './routes/_auth';
import { Route as AuthAuthLoginIndexImport } from './routes/_auth/auth/login/index';
import { Route as AuthAuthRegisterIndexImport } from './routes/_auth/auth/register/index';
import { Route as ExploreIndexImport } from './routes/explore/index';
import { Route as FeedFeedIdIndexImport } from './routes/feed/$feedId/index';
import { Route as FeedIndexImport } from './routes/feed/index';
import { Route as IndexImport } from './routes/index';
import { Route as MessagingIndexImport } from './routes/messaging/index';
import { Route as MyNetworkGrowIndexImport } from './routes/my-network/grow/index';
import { Route as MyPostsIndexImport } from './routes/my-posts/index';
import { Route as UsersUserIdConnectionsIndexImport } from './routes/users/$userId/connections/index';
import { Route as UsersUserIdIndexImport } from './routes/users/$userId/index';

// Create/Update Routes

const AuthRoute = AuthImport.update({
  id: '/_auth',
  getParentRoute: () => rootRoute,
} as any);

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any);

const MyPostsIndexRoute = MyPostsIndexImport.update({
  id: '/my-posts/',
  path: '/my-posts/',
  getParentRoute: () => rootRoute,
} as any);

const MessagingIndexRoute = MessagingIndexImport.update({
  id: '/messaging/',
  path: '/messaging/',
  getParentRoute: () => rootRoute,
} as any);

const FeedIndexRoute = FeedIndexImport.update({
  id: '/feed/',
  path: '/feed/',
  getParentRoute: () => rootRoute,
} as any);

const ExploreIndexRoute = ExploreIndexImport.update({
  id: '/explore/',
  path: '/explore/',
  getParentRoute: () => rootRoute,
} as any);

const UsersUserIdIndexRoute = UsersUserIdIndexImport.update({
  id: '/users/$userId/',
  path: '/users/$userId/',
  getParentRoute: () => rootRoute,
} as any);

const MyNetworkGrowIndexRoute = MyNetworkGrowIndexImport.update({
  id: '/my-network/grow/',
  path: '/my-network/grow/',
  getParentRoute: () => rootRoute,
} as any);

const FeedFeedIdIndexRoute = FeedFeedIdIndexImport.update({
  id: '/feed/$feedId/',
  path: '/feed/$feedId/',
  getParentRoute: () => rootRoute,
} as any);

const UsersUserIdConnectionsIndexRoute = UsersUserIdConnectionsIndexImport.update({
  id: '/users/$userId/connections/',
  path: '/users/$userId/connections/',
  getParentRoute: () => rootRoute,
} as any);

const AuthAuthRegisterIndexRoute = AuthAuthRegisterIndexImport.update({
  id: '/auth/register/',
  path: '/auth/register/',
  getParentRoute: () => AuthRoute,
} as any);

const AuthAuthLoginIndexRoute = AuthAuthLoginIndexImport.update({
  id: '/auth/login/',
  path: '/auth/login/',
  getParentRoute: () => AuthRoute,
} as any);

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/';
      path: '/';
      fullPath: '/';
      preLoaderRoute: typeof IndexImport;
      parentRoute: typeof rootRoute;
    };
    '/_auth': {
      id: '/_auth';
      path: '';
      fullPath: '';
      preLoaderRoute: typeof AuthImport;
      parentRoute: typeof rootRoute;
    };
    '/explore/': {
      id: '/explore/';
      path: '/explore';
      fullPath: '/explore';
      preLoaderRoute: typeof ExploreIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/feed/': {
      id: '/feed/';
      path: '/feed';
      fullPath: '/feed';
      preLoaderRoute: typeof FeedIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/messaging/': {
      id: '/messaging/';
      path: '/messaging';
      fullPath: '/messaging';
      preLoaderRoute: typeof MessagingIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/my-posts/': {
      id: '/my-posts/';
      path: '/my-posts';
      fullPath: '/my-posts';
      preLoaderRoute: typeof MyPostsIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/feed/$feedId/': {
      id: '/feed/$feedId/';
      path: '/feed/$feedId';
      fullPath: '/feed/$feedId';
      preLoaderRoute: typeof FeedFeedIdIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/my-network/grow/': {
      id: '/my-network/grow/';
      path: '/my-network/grow';
      fullPath: '/my-network/grow';
      preLoaderRoute: typeof MyNetworkGrowIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/users/$userId/': {
      id: '/users/$userId/';
      path: '/users/$userId';
      fullPath: '/users/$userId';
      preLoaderRoute: typeof UsersUserIdIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/_auth/auth/login/': {
      id: '/_auth/auth/login/';
      path: '/auth/login';
      fullPath: '/auth/login';
      preLoaderRoute: typeof AuthAuthLoginIndexImport;
      parentRoute: typeof AuthImport;
    };
    '/_auth/auth/register/': {
      id: '/_auth/auth/register/';
      path: '/auth/register';
      fullPath: '/auth/register';
      preLoaderRoute: typeof AuthAuthRegisterIndexImport;
      parentRoute: typeof AuthImport;
    };
    '/users/$userId/connections/': {
      id: '/users/$userId/connections/';
      path: '/users/$userId/connections';
      fullPath: '/users/$userId/connections';
      preLoaderRoute: typeof UsersUserIdConnectionsIndexImport;
      parentRoute: typeof rootRoute;
    };
  }
}

// Create and export the route tree

interface AuthRouteChildren {
  AuthAuthLoginIndexRoute: typeof AuthAuthLoginIndexRoute;
  AuthAuthRegisterIndexRoute: typeof AuthAuthRegisterIndexRoute;
}

const AuthRouteChildren: AuthRouteChildren = {
  AuthAuthLoginIndexRoute: AuthAuthLoginIndexRoute,
  AuthAuthRegisterIndexRoute: AuthAuthRegisterIndexRoute,
};

const AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren);

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute;
  '': typeof AuthRouteWithChildren;
  '/explore': typeof ExploreIndexRoute;
  '/feed': typeof FeedIndexRoute;
  '/messaging': typeof MessagingIndexRoute;
  '/my-posts': typeof MyPostsIndexRoute;
  '/feed/$feedId': typeof FeedFeedIdIndexRoute;
  '/my-network/grow': typeof MyNetworkGrowIndexRoute;
  '/users/$userId': typeof UsersUserIdIndexRoute;
  '/auth/login': typeof AuthAuthLoginIndexRoute;
  '/auth/register': typeof AuthAuthRegisterIndexRoute;
  '/users/$userId/connections': typeof UsersUserIdConnectionsIndexRoute;
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute;
  '': typeof AuthRouteWithChildren;
  '/explore': typeof ExploreIndexRoute;
  '/feed': typeof FeedIndexRoute;
  '/messaging': typeof MessagingIndexRoute;
  '/my-posts': typeof MyPostsIndexRoute;
  '/feed/$feedId': typeof FeedFeedIdIndexRoute;
  '/my-network/grow': typeof MyNetworkGrowIndexRoute;
  '/users/$userId': typeof UsersUserIdIndexRoute;
  '/auth/login': typeof AuthAuthLoginIndexRoute;
  '/auth/register': typeof AuthAuthRegisterIndexRoute;
  '/users/$userId/connections': typeof UsersUserIdConnectionsIndexRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRoute;
  '/': typeof IndexRoute;
  '/_auth': typeof AuthRouteWithChildren;
  '/explore/': typeof ExploreIndexRoute;
  '/feed/': typeof FeedIndexRoute;
  '/messaging/': typeof MessagingIndexRoute;
  '/my-posts/': typeof MyPostsIndexRoute;
  '/feed/$feedId/': typeof FeedFeedIdIndexRoute;
  '/my-network/grow/': typeof MyNetworkGrowIndexRoute;
  '/users/$userId/': typeof UsersUserIdIndexRoute;
  '/_auth/auth/login/': typeof AuthAuthLoginIndexRoute;
  '/_auth/auth/register/': typeof AuthAuthRegisterIndexRoute;
  '/users/$userId/connections/': typeof UsersUserIdConnectionsIndexRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths:
    | '/'
    | ''
    | '/explore'
    | '/feed'
    | '/messaging'
    | '/my-posts'
    | '/feed/$feedId'
    | '/my-network/grow'
    | '/users/$userId'
    | '/auth/login'
    | '/auth/register'
    | '/users/$userId/connections';
  fileRoutesByTo: FileRoutesByTo;
  to:
    | '/'
    | ''
    | '/explore'
    | '/feed'
    | '/messaging'
    | '/my-posts'
    | '/feed/$feedId'
    | '/my-network/grow'
    | '/users/$userId'
    | '/auth/login'
    | '/auth/register'
    | '/users/$userId/connections';
  id:
    | '__root__'
    | '/'
    | '/_auth'
    | '/explore/'
    | '/feed/'
    | '/messaging/'
    | '/my-posts/'
    | '/feed/$feedId/'
    | '/my-network/grow/'
    | '/users/$userId/'
    | '/_auth/auth/login/'
    | '/_auth/auth/register/'
    | '/users/$userId/connections/';
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute;
  AuthRoute: typeof AuthRouteWithChildren;
  ExploreIndexRoute: typeof ExploreIndexRoute;
  FeedIndexRoute: typeof FeedIndexRoute;
  MessagingIndexRoute: typeof MessagingIndexRoute;
  MyPostsIndexRoute: typeof MyPostsIndexRoute;
  FeedFeedIdIndexRoute: typeof FeedFeedIdIndexRoute;
  MyNetworkGrowIndexRoute: typeof MyNetworkGrowIndexRoute;
  UsersUserIdIndexRoute: typeof UsersUserIdIndexRoute;
  UsersUserIdConnectionsIndexRoute: typeof UsersUserIdConnectionsIndexRoute;
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthRoute: AuthRouteWithChildren,
  ExploreIndexRoute: ExploreIndexRoute,
  FeedIndexRoute: FeedIndexRoute,
  MessagingIndexRoute: MessagingIndexRoute,
  MyPostsIndexRoute: MyPostsIndexRoute,
  FeedFeedIdIndexRoute: FeedFeedIdIndexRoute,
  MyNetworkGrowIndexRoute: MyNetworkGrowIndexRoute,
  UsersUserIdIndexRoute: UsersUserIdIndexRoute,
  UsersUserIdConnectionsIndexRoute: UsersUserIdConnectionsIndexRoute,
};

export const routeTree = rootRoute._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>();

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/_auth",
        "/explore/",
        "/feed/",
        "/messaging/",
        "/my-posts/",
        "/feed/$feedId/",
        "/my-network/grow/",
        "/users/$userId/",
        "/users/$userId/connections/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_auth": {
      "filePath": "_auth.tsx",
      "children": [
        "/_auth/auth/login/",
        "/_auth/auth/register/"
      ]
    },
    "/explore/": {
      "filePath": "explore/index.tsx"
    },
    "/feed/": {
      "filePath": "feed/index.tsx"
    },
    "/messaging/": {
      "filePath": "messaging/index.tsx"
    },
    "/my-posts/": {
      "filePath": "my-posts/index.tsx"
    },
    "/feed/$feedId/": {
      "filePath": "feed/$feedId/index.tsx"
    },
    "/my-network/grow/": {
      "filePath": "my-network/grow/index.tsx"
    },
    "/users/$userId/": {
      "filePath": "users/$userId/index.tsx"
    },
    "/_auth/auth/login/": {
      "filePath": "_auth/auth/login/index.tsx",
      "parent": "/_auth"
    },
    "/_auth/auth/register/": {
      "filePath": "_auth/auth/register/index.tsx",
      "parent": "/_auth"
    },
    "/users/$userId/connections/": {
      "filePath": "users/$userId/connections/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
