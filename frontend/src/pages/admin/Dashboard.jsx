import { Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import { StatsCard } from '../../components/stats-card';
import { AreaChartCard } from '../../components/area-chart';
import { BarChartCard } from '../../components/bar-chart';
import { revenueData, visitsData, topProducts } from '../../data/dashboard-data';

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-default-500">Welcome back! Here's an overview of your business.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Revenue" 
          value="$24,780" 
          change={12.5} 
          icon="lucide:dollar-sign" 
          color="primary"
        />
        <StatsCard 
          title="Total Orders" 
          value="1,245" 
          change={8.2} 
          icon="lucide:shopping-cart" 
          color="success"
        />
        <StatsCard 
          title="New Customers" 
          value="356" 
          change={-2.4} 
          icon="lucide:users" 
          color="warning"
        />
        <StatsCard 
          title="Conversion Rate" 
          value="3.2%" 
          change={1.1} 
          icon="lucide:percent" 
          color="secondary"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard 
          title="Revenue Overview" 
          data={revenueData} 
          dataKey="revenue" 
          color="primary"
        />
        <BarChartCard 
          title="Monthly Visits" 
          data={visitsData} 
          dataKey="visits" 
          color="secondary"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex justify-between">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <span className="text-sm text-primary cursor-pointer">View All</span>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((order) => (
                <div key={order} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-default-100 flex items-center justify-center">
                      <Icon icon="lucide:package" width={18} height={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Order #{10000 + order}</p>
                      <p className="text-xs text-default-500">2 items • $149.99</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-default-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Top Products</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-default-100 flex items-center justify-center">
                    <span className="font-medium text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-default-500">{product.category}</p>
                      <p className="text-xs font-medium">${product.revenue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};