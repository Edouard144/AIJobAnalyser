'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { JobsProvider } from "@/contexts/JobsContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreInitializer } from "@/components/providers/StoreInitializer";
import Navbar from "@/components/Navbar";
import "@/i18n";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <StoreInitializer>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <JobsProvider>
                <TooltipProvider>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      style: { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' },
                      success: { iconTheme: { primary: 'hsl(160, 88%, 30%)', secondary: 'white' } },
                    }}
                  />
                  <Navbar />
                  {children}
                </TooltipProvider>
              </JobsProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </StoreInitializer>
    </Provider>
  );
}