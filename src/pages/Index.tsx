import { useTranslation } from "react-i18next";
import { DashboardStats } from "@/components/DashboardStats";
import { EmptyDashboardState } from "@/components/EmptyDashboardState";
import { useVESExchangeRate } from "@/lib/rates";
import { useDashboardData } from "./dashboard/useDashboardData";
import { useDashboardScope } from "./dashboard/useDashboardScope";
import { useCategoryFilters } from "./dashboard/useCategoryFilters";
import { useDashboardDerived } from "./dashboard/useDashboardDerived";
import { useBalanceSummary } from "./dashboard/useBalanceSummary";
import { useTrendData } from "./dashboard/useTrendData";
import { useDashboardCharts } from "./dashboard/useDashboardCharts";
import { DashboardFiltersSection } from "./dashboard/DashboardFiltersSection";
import { DashboardChartsGrid } from "./dashboard/DashboardChartsGrid";

const Index = () => {
  const { t } = useTranslation();
  const { accounts, categories, transactions, authUser, groups } = useDashboardData();
  const { selectedAccount, setSelectedAccount, selectedGroupId, setSelectedGroupId, selectedGroupNumber } = useDashboardScope();
  const { rate } = useVESExchangeRate();

  const {
    selectedIncomeCats, setSelectedIncomeCats, selectedExpenseCats, setSelectedExpenseCats,
    expenseFilterSet, visibleIncomeCategories, visibleExpenseCategories,
    visibleIncomeCategoryNames, visibleExpenseCategoryNames,
    selectedIncomeCategoryNames, selectedExpenseCategoryNames,
  } = useCategoryFilters(categories, selectedGroupNumber);

  const { txByAccount, monthKey, expensePieData, budgetData } = useDashboardDerived({
    transactions, selectedAccount, categories, accounts, rate, expenseFilterSet, selectedGroupNumber,
  });

  const balanceSummary = useBalanceSummary({ monthKey, selectedAccount, selectedGroupNumber });
  const trendData = useTrendData({
    selectedAccount, selectedGroupNumber, selectedIncomeCats, selectedExpenseCats,
    visibleIncomeCategories, visibleExpenseCategories,
  });
  const charts = useDashboardCharts({
    selectedAccount, monthKey, selectedGroupNumber, categoriesLength: categories.length,
    visibleExpenseCategoryNames, selectedExpenseCategoryNames, selectedExpenseCats,
    visibleIncomeCategoryNames, selectedIncomeCategoryNames, selectedIncomeCats,
  });

  const toggleExpenseCategory = (catId: string) => {
    setSelectedExpenseCats((prev) => (prev.includes(catId) ? prev.filter((x) => x !== catId) : [...prev, catId]));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">{authUser?.username ? t("dashboard.greeting", { name: authUser.username }) : t("dashboard.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
        </div>
      </header>

      {accounts.length === 0 ? (
        <EmptyDashboardState />
      ) : (
        <>
          <DashboardStats transactions={txByAccount} accounts={accounts} rate={rate} balanceSummary={balanceSummary} />

          <section className="space-y-6 rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
            <DashboardFiltersSection
              selectedAccount={selectedAccount} onAccountChange={setSelectedAccount}
              selectedGroupId={selectedGroupId} onGroupChange={setSelectedGroupId} groups={groups}
              visibleIncomeCategories={visibleIncomeCategories} selectedIncomeCats={selectedIncomeCats} onIncomeCatsChange={setSelectedIncomeCats}
              visibleExpenseCategories={visibleExpenseCategories} selectedExpenseCats={selectedExpenseCats} onExpenseCatsChange={setSelectedExpenseCats}
            />
            <DashboardChartsGrid
              expensePieData={expensePieData} onExpenseSliceClick={toggleExpenseCategory} trendData={trendData} budgetData={budgetData}
              netFlowData={charts.netFlowData} forecastData={charts.forecastData}
              heatmapData={charts.heatmapData} incomeHeatmapData={charts.incomeHeatmapData}
              volatilityData={charts.volatilityData} incomeVolatilityData={charts.incomeVolatilityData}
              momData={charts.momData} incomeMomData={charts.incomeMomData}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default Index;
