import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import "./styles/global.css";

import { Toaster } from "~/components/ui/sonner";

import { Skeleton } from "~/components/ui/skeleton";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="min-h-full h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex,nofollow" />
        <meta name="title" content="Gym gym gym !!!" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-full cross-grid-light">
        {children}
        <Toaster richColors visibleToasts={4} expand={true} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return (
    <div className="flex justify-center items-center flex-col space-y-10 h-svh">
      <div className="flex flex-col space-y-3 ">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <div className="flex flex-col space-y-3 ">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </div>
  );
}
