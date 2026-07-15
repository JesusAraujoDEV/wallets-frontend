import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthApi } from "@/lib/auth";
import { fetchPendingTransactions, PENDING_TRANSACTIONS_QUERY_KEY } from "@/lib/subscriptions";
import { MobileSidebarHeader } from "./sidebar/MobileSidebarHeader";
import { DesktopSidebar } from "./sidebar/DesktopSidebar";
import { buildNavigationItems } from "./sidebar/navigationItems";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { useOnboarding } from "@/components/onboarding/useOnboarding";

export default function SidebarLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const onboarding = useOnboarding();
  const pendingQuery = useQuery({
    queryKey: PENDING_TRANSACTIONS_QUERY_KEY,
    queryFn: fetchPendingTransactions,
    staleTime: 30_000,
  });
  const pendingCount = pendingQuery.data?.length ?? 0;
  const navigationItems = buildNavigationItems(pendingCount);

  const handleLogout = async () => {
    await AuthApi.logout();
    setMobileOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background md:h-screen md:overflow-hidden">
      <MobileSidebarHeader
        items={navigationItems}
        pendingCount={pendingCount}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={handleLogout}
        onHelp={onboarding.replay}
      />

      <div className="flex h-screen w-full overflow-hidden overflow-x-hidden bg-background md:flex-row">
        <DesktopSidebar items={navigationItems} pendingCount={pendingCount} onLogout={handleLogout} onHelp={onboarding.replay} />

        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-4 md:ml-64 md:h-screen md:overflow-y-auto md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>

      <OnboardingTour open={onboarding.open} onOpenChange={onboarding.setOpen} onFinish={onboarding.finish} />
    </div>
  );
}
