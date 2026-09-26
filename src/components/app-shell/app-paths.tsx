"use client";

import { createContext, useContext, type ReactNode } from "react";

type AppPaths = { basePath: string; signInHref: string };

const AppPathsContext = createContext<AppPaths>({
  basePath: "/app",
  signInHref: "/app/sign-in",
});

/** The server layout resolves the host-specific base path once; links read it from here. */
export function AppPathsProvider({
  basePath,
  children,
}: {
  basePath: string;
  children: ReactNode;
}) {
  return (
    <AppPathsContext.Provider
      value={{ basePath, signInHref: `${basePath}/sign-in` }}
    >
      {children}
    </AppPathsContext.Provider>
  );
}

export function useAppPaths() {
  return useContext(AppPathsContext);
}

/** Builds an in-app href: `appHref("/reminders")`, `appHref("/")`. */
export function useAppHref() {
  const { basePath } = useAppPaths();
  return (path: string) =>
    path === "/" ? basePath || "/" : `${basePath}${path}`;
}

/** Pathname relative to the app root, identical on the consumer host and under `/app`. */
export function appSegment(pathname: string) {
  return pathname.replace(/^\/app(?=\/|$)/, "") || "/";
}
