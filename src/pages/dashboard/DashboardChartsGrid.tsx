import { ExpensePieChart } from "@/components/ExpensePieChart";
import { NetCashFlowChart } from "@/components/NetCashFlowChart";
import { SpendingHeatmap } from "@/components/SpendingHeatmap";
import { IncomeHeatmap } from "@/components/IncomeHeatmap";
import { ExpenseVolatilityBoxPlot } from "@/components/ExpenseVolatilityBoxPlot";
import { IncomeVolatilityBoxPlot } from "@/components/IncomeVolatilityBoxPlot";
import { ComparativeMoM } from "@/components/ComparativeMoM";
import { ComparativeMoMIncome } from "@/components/ComparativeMoMIncome";
import { MonthlyForecastGauge } from "@/components/MonthlyForecastGauge";
import { TrendLineChart } from "@/components/TrendLineChart";
import { BudgetComparisonChart } from "@/components/BudgetComparisonChart";

export function DashboardChartsGrid({ expensePieData, onExpenseSliceClick, trendData, budgetData, netFlowData, forecastData, heatmapData, incomeHeatmapData, volatilityData, incomeVolatilityData, momData, incomeMomData }: {
  expensePieData: any[]; onExpenseSliceClick: (catId: string) => void; trendData: any[]; budgetData: any[];
  netFlowData: { summary?: any; series: any[] }; forecastData: any;
  heatmapData: any; incomeHeatmapData: any; volatilityData: any[]; incomeVolatilityData: any[];
  momData: { summary: any; categories: any[] }; incomeMomData: { summary: any; categories: any[] };
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExpensePieChart data={expensePieData} onSliceClick={(catId) => catId && onExpenseSliceClick(catId)} />
        <TrendLineChart data={trendData} />
      </div>

      <BudgetComparisonChart data={budgetData} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NetCashFlowChart summary={netFlowData.summary} data={netFlowData.series} />
        <MonthlyForecastGauge {...forecastData} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SpendingHeatmap {...heatmapData} />
        <IncomeHeatmap {...incomeHeatmapData} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExpenseVolatilityBoxPlot categories={volatilityData} />
        <IncomeVolatilityBoxPlot categories={incomeVolatilityData} />
      </div>

      {momData?.summary ? <ComparativeMoM summary={momData.summary} categories={momData.categories} /> : null}
      {incomeMomData?.summary ? <ComparativeMoMIncome summary={incomeMomData.summary} categories={incomeMomData.categories} /> : null}
    </>
  );
}
