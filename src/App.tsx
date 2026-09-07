import { Suspense } from "react";
import { lazyWithTimeout as lazy } from "@/lib/lazyWithTimeout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { ThemeProvider } from "@/components/theme-provider";
import RequireAuth from "@/components/RequireAuth";
import GlobalLoadingBar from "@/components/GlobalLoadingBar";
import RouteFallback from "@/components/RouteFallback";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

// Route-level code splitting: each page ships as its own chunk, fetched on
// navigation instead of bloating the single main bundle (was ~2.5MB).
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const TelegramLogin = lazy(() => import("./pages/TelegramLogin"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Categories = lazy(() => import("./pages/Categories"));
const CategoryGroups = lazy(() => import("./pages/CategoryGroups"));
const Accounts = lazy(() => import("./pages/Accounts"));
const Budgets = lazy(() => import("./pages/Budgets"));
const Debts = lazy(() => import("./pages/Debts"));
const Rates = lazy(() => import("./pages/Rates"));
const Statistics = lazy(() => import("./pages/Statistics"));
const Savings = lazy(() => import("./pages/Savings"));
const CalendarView = lazy(() => import("./pages/CalendarView"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="platica-theme">
        <TooltipProvider>
          <GlobalLoadingBar />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/telegram-login" element={<TelegramLogin />} />
                <Route
                  element={
                    <RequireAuth>
                      <SidebarLayout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Index />} />
                  <Route path="dashboard" element={<Navigate to="/" replace />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="subscriptions" element={<Subscriptions />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="category-groups" element={<CategoryGroups />} />
                  <Route path="accounts" element={<Accounts />} />
                  <Route path="budgets" element={<Budgets />} />
                  <Route path="debts" element={<Debts />} />
                  <Route path="rates" element={<Rates />} />
                  <Route path="statistics" element={<Statistics />} />
                  <Route path="savings" element={<Savings />} />
                  <Route path="calendar" element={<CalendarView />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
