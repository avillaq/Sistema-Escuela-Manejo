import { ArrowUpRight, ArrowDownRight, DollarSign, Users, ShoppingCart, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({ title, value, change, icon, trend }) {
  const isPositive = trend === 'up';

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={cn(
          "p-3 rounded-full",
          isPositive ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
            "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        )}>
          {icon}
        </div>
      </div>
      <div className="flex items-center mt-4">
        <div className={cn(
          "flex items-center text-sm",
          isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span className="ml-1">{change}</span>
        </div>
        <span className="text-sm text-muted-foreground ml-1.5">from last month</span>
      </div>
    </div>
  );
}

export function ChartCard({ title, children }) {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

export function SimpleBarChart() {
  // Simplified chart display - in real app, use a chart library like Chart.js or Recharts
  const values = [35, 55, 40, 70, 60, 80, 65];
  const max = Math.max(...values);

  return (
    <div className="flex items-end h-full space-x-2 pt-5 pb-5">
      {values.map((value, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div
            className="w-full bg-primary/80 rounded-t-sm"
            style={{ height: `${(value / max) * 100}%` }}
          ></div>
          <span className="text-xs mt-2">{`Day ${i + 1}`}</span>
        </div>
      ))}
    </div>
  );
}

export function DonutChart() {
  // Simplified donut chart
  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#eee" strokeWidth="3"></circle>
          <circle
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="var(--color-chart-1)"
            strokeWidth="3"
            strokeDasharray="60, 100"
            strokeDashoffset="25"
          ></circle>
          <circle
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="var(--color-chart-2)"
            strokeWidth="3"
            strokeDasharray="25, 100"
            strokeDashoffset="-35"
          ></circle>
          <circle
            cx="18"
            cy="18"
            r="15.91549430918954"
            fill="transparent"
            stroke="var(--color-chart-3)"
            strokeWidth="3"
            strokeDasharray="15, 100"
            strokeDashoffset="-60"
          ></circle>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">60%</div>
      </div>
    </div>
  );
}