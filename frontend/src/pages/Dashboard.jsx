import { StatCard, ChartCard, SimpleBarChart, DonutChart } from "../components/dashboard/DashboardCards";
import { DataTable } from "../components/dashboard/DataTable";
import { DollarSign, Users, ShoppingCart, Percent } from "lucide-react";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="$45,231.89" 
          change="12.5%" 
          icon={<DollarSign size={20} />} 
          trend="up"
        />
        <StatCard 
          title="Active Users" 
          value="2,342" 
          change="8.1%" 
          icon={<Users size={20} />} 
          trend="up"
        />
        <StatCard 
          title="New Orders" 
          value="1,234" 
          change="5.4%" 
          icon={<ShoppingCart size={20} />} 
          trend="down"
        />
        <StatCard 
          title="Conversion Rate" 
          value="2.83%" 
          change="1.2%" 
          icon={<Percent size={20} />} 
          trend="up"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Weekly Sales">
          <SimpleBarChart />
        </ChartCard>
        <ChartCard title="Traffic Sources">
          <DonutChart />
        </ChartCard>
      </div>
      
      {/* Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Customers</h2>
        <DataTable />
      </div>
    </div>
  );
}







