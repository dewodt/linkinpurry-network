/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root';
import { Route as TestImport } from './routes/test';
import { Route as AboutImport } from './routes/about';
import { Route as IndexImport } from './routes/index';
import { Route as AuthRegisterImport } from './routes/auth/register';
import { Route as AuthLoginImport } from './routes/auth/login';

// Create/Update Routes

const TestRoute = TestImport.update({
  id: '/test',
  path: '/test',
  getParentRoute: () => rootRoute,
} as any);

const AboutRoute = AboutImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRoute,
} as any);

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any);

const AuthRegisterRoute = AuthRegisterImport.update({
  id: '/auth/register',
  path: '/auth/register',
  getParentRoute: () => rootRoute,
} as any);

const AuthLoginRoute = AuthLoginImport.update({
  id: '/auth/login',
  path: '/auth/login',
  getParentRoute: () => rootRoute,
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
    '/about': {
      id: '/about';
      path: '/about';
      fullPath: '/about';
      preLoaderRoute: typeof AboutImport;
      parentRoute: typeof rootRoute;
    };
    '/test': {
      id: '/test';
      path: '/test';
      fullPath: '/test';
      preLoaderRoute: typeof TestImport;
      parentRoute: typeof rootRoute;
    };
    '/auth/login': {
      id: '/auth/login';
      path: '/auth/login';
      fullPath: '/auth/login';
      preLoaderRoute: typeof AuthLoginImport;
      parentRoute: typeof rootRoute;
    };
    '/auth/register': {
      id: '/auth/register';
      path: '/auth/register';
      fullPath: '/auth/register';
      preLoaderRoute: typeof AuthRegisterImport;
      parentRoute: typeof rootRoute;
    };
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute;
  '/about': typeof AboutRoute;
  '/test': typeof TestRoute;
  '/auth/login': typeof AuthLoginRoute;
  '/auth/register': typeof AuthRegisterRoute;
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute;
  '/about': typeof AboutRoute;
  '/test': typeof TestRoute;
  '/auth/login': typeof AuthLoginRoute;
  '/auth/register': typeof AuthRegisterRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRoute;
  '/': typeof IndexRoute;
  '/about': typeof AboutRoute;
  '/test': typeof TestRoute;
  '/auth/login': typeof AuthLoginRoute;
  '/auth/register': typeof AuthRegisterRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths: '/' | '/about' | '/test' | '/auth/login' | '/auth/register';
  fileRoutesByTo: FileRoutesByTo;
  to: '/' | '/about' | '/test' | '/auth/login' | '/auth/register';
  id: '__root__' | '/' | '/about' | '/test' | '/auth/login' | '/auth/register';
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute;
  AboutRoute: typeof AboutRoute;
  TestRoute: typeof TestRoute;
  AuthLoginRoute: typeof AuthLoginRoute;
  AuthRegisterRoute: typeof AuthRegisterRoute;
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AboutRoute: AboutRoute,
  TestRoute: TestRoute,
  AuthLoginRoute: AuthLoginRoute,
  AuthRegisterRoute: AuthRegisterRoute,
};

export const routeTree = rootRoute._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>();

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/about",
        "/test",
        "/auth/login",
        "/auth/register"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/about": {
      "filePath": "about.tsx"
    },
    "/test": {
      "filePath": "test.tsx"
    },
    "/auth/login": {
      "filePath": "auth/login.tsx"
    },
    "/auth/register": {
      "filePath": "auth/register.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
