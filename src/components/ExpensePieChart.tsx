import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ExpenseData {
  id?: string; // optional for backward compatibility
  category: string;
  amount: number;
  color: string;
}

interface ExpensePieChartProps {
  data: ExpenseData[];
  onSliceClick?: (categoryId?: string, categoryName?: string) => void;
}

export const ExpensePieChart = ({ data, onSliceClick }: ExpensePieChartProps) => {
  return (
    <Card className="p-6 shadow-md border-0">
      <h3 className="text-xl font-semibold text-foreground mb-6">Expense Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="amount"
            onClick={(entry) => {
              if (typeof onSliceClick === 'function') {
                // entry can be a Payload object from recharts
                const anyEntry: any = entry;
                onSliceClick(anyEntry?.payload?.id, anyEntry?.payload?.category);
              }
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};
