import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import TelegramLogin from "./pages/TelegramLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import CategoryGroups from "./pages/CategoryGroups";
import Accounts from "./pages/Accounts";
import Budgets from "./pages/Budgets";
import Profile from "./pages/Profile";
import RequireAuth from "@/components/RequireAuth";
import GlobalLoadingBar from "@/components/GlobalLoadingBar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="platica-theme">
      <TooltipProvider>
        <GlobalLoadingBar />
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              <Route path="categories" element={<Categories />} />
              <Route path="category-groups" element={<CategoryGroups />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
