import { Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';

export const StatsCard = ({ title, value, change, icon, color }) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  const getChangeColor = () => {
    if (isPositive) return 'text-success-500';
    if (isNegative) return 'text-danger-500';
    return 'text-default-500';
  };
  
  const getChangeIcon = () => {
    if (isPositive) return 'lucide:trending-up';
    if (isNegative) return 'lucide:trending-down';
    return 'lucide:minus';
  };

  return (
    <Card shadow="sm" className="dashboard-card">
      <CardBody className="flex justify-between items-center">
        <div>
          <p className="text-default-500 text-sm">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <Icon icon={getChangeIcon()} className={getChangeColor()} width={16} height={16} />
              <span className={`text-xs ${getChangeColor()}`}>
                {Math.abs(change)}% {isPositive ? 'increase' : isNegative ? 'decrease' : ''}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon icon={icon} className={`text-${color}-500`} width={24} height={24} />
        </div>
      </CardBody>
    </Card>
  );
};