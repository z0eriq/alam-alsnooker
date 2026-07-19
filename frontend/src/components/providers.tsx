"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#0a1210",
            color: "#f5f2ea",
            border: "1px solid rgba(201,162,39,0.35)",
            fontFamily: "var(--font-cairo), Tahoma, sans-serif",
          },
          success: { iconTheme: { primary: "#d4af37", secondary: "#0a1210" } },
          error: { iconTheme: { primary: "#c45c5c", secondary: "#0a1210" } },
        }}
      />
    </QueryClientProvider>
  );
}
