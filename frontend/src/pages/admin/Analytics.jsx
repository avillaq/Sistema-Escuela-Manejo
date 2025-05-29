import { Card, CardBody, CardHeader, Divider, Tabs, Tab } from '@heroui/react';
import { AreaChartCard } from '../../components/area-chart';
import { BarChartCard } from '../../components/bar-chart';
import { 
  trafficData, 
  deviceData, 
  conversionData, 
  channelData 
} from '../../data/analytics-data';
import { useState } from 'react';

export const Analytics = () => {
  const [selectedTab, setSelectedTab] = useState("traffic");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-default-500">Detailed metrics and performance insights.</p>
      </div>
      
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Performance Overview</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <Tabs 
            aria-label="Analytics tabs" 
            selectedKey={selectedTab} 
            onSelectionChange={setSelectedTab}
          >
            <Tab key="traffic" title="Traffic">
              <div className="mt-4">
                <AreaChartCard 
                  title="Website Traffic" 
                  data={trafficData} 
                  dataKey="visitors" 
                  color="primary"
                />
              </div>
            </Tab>
            <Tab key="conversion" title="Conversion">
              <div className="mt-4">
                <BarChartCard 
                  title="Conversion Rate" 
                  data={conversionData} 
                  dataKey="rate" 
                  color="success"
                />
              </div>
            </Tab>
            <Tab key="sources" title="Sources">
              <div className="mt-4">
                <BarChartCard 
                  title="Traffic Sources" 
                  data={channelData} 
                  dataKey="visitors" 
                  color="warning"
                  xAxisKey="channel"
                />
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Device Distribution</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {deviceData.map((device) => (
                <div key={device.name} className="text-center p-4 rounded-lg bg-default-50">
                  <p className="text-2xl font-semibold">{device.percentage}%</p>
                  <p className="text-sm text-default-600">{device.name}</p>
                </div>
              ))}
            </div>
            <BarChartCard 
              title="" 
              data={deviceData} 
              dataKey="percentage" 
              color="secondary"
              xAxisKey="name"
            />
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Top Pages</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-4">
              {[
                { url: "/products", views: 12540, time: "2:45" },
                { url: "/home", views: 8320, time: "1:32" },
                { url: "/blog", views: 6210, time: "3:17" },
                { url: "/about", views: 4150, time: "1:05" },
                { url: "/contact", views: 2980, time: "0:45" }
              ].map((page, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{page.url}</p>
                    <p className="text-xs text-default-500">{page.views.toLocaleString()} views</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{page.time}</p>
                    <p className="text-xs text-default-500">Avg. time</p>
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