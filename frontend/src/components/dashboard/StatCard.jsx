import { Card } from '@heroui/react';
import { Icon } from '@iconify/react';

export const StatCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color = "primary",
  size = "default" 
}) => {
  const colorClasses = {
    primary: "bg-primary-500/20 text-primary-500",
    secondary: "bg-secondary-500/20 text-secondary-500",
    success: "bg-success-500/20 text-success-500",
    warning: "bg-warning-500/20 text-warning-500",
    danger: "bg-danger-500/20 text-danger-500",
    purple: "bg-purple-500/20 text-purple-500",
    orange: "bg-orange-500/20 text-orange-500",
    green: "bg-green-500/20 text-green-500"
  };

  const textColorClasses = {
    primary: "text-primary-700",
    secondary: "text-secondary-700",
    success: "text-success-700",
    warning: "text-warning-700",
    danger: "text-danger-700",
    purple: "text-purple-700",
    orange: "text-orange-700",
    green: "text-green-700"
  };

  const subtitleColorClasses = {
    primary: "text-primary-600",
    secondary: "text-secondary-600",
    success: "text-success-600",
    warning: "text-warning-600",
    danger: "text-danger-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    green: "text-green-600"
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon icon={icon} width={24} height={24} />
        </div>
        <div>
          <p className={`text-sm ${textColorClasses[color]}`}>{title}</p>
          <p className={`${size === 'large' ? 'text-2xl' : 'text-xl'} font-semibold ${textColorClasses[color]}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs ${subtitleColorClasses[color]}`}>{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
};
