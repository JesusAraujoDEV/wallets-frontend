import { Suspense, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import RouteFallback from "@/components/RouteFallback";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

// Wraps the whole routing tree with an error boundary that resets on navigation
// and a Suspense fallback for lazy route chunks. The per-page transition fix
// (keying Suspense by pathname) lives in SidebarLayout around the Outlet, so the
// sidebar shell is not remounted on every navigation.
export function RoutedContent({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <AppErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<RouteFallback />}>{children}</Suspense>
    </AppErrorBoundary>
  );
}
