"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import type { AppRouter } from "~/server/api/root";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

function crearQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { staleTime: 5_000 } } });
}

let browserQueryClient: QueryClient | undefined;
function getQueryClient() {
  if (typeof window === "undefined") return crearQueryClient();
  return (browserQueryClient ??= crearQueryClient());
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({ enabled: (op) => process.env.NODE_ENV === "development" && op.direction === "down" && op.result instanceof Error }),
        httpBatchLink({ url: "/api/trpc", transformer: superjson }),
      ],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
