import { Card, CardBody, CardHeader, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

export const ActivityCard = ({ 
  title, 
  children, 
  actionLabel, 
  onAction, 
  actionIcon,
  headerIcon
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {headerIcon && <Icon icon={headerIcon} width={20} height={20} />}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          {actionLabel && onAction && (
            <Button
              size="sm"
              variant="flat"
              startContent={actionIcon && <Icon icon={actionIcon} width={14} height={14} />}
              onPress={onAction}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {children}
      </CardBody>
    </Card>
  );
};

export const ActivityItem = ({ 
  icon, 
  title, 
  subtitle, 
  rightContent, 
  isHighlighted = false,
  color = "default" 
}) => {
  const bgColorClasses = {
    primary: "bg-primary-50 border-primary-200",
    success: "bg-success-50 border-success-200",
    warning: "bg-warning-50 border-warning-200",
    danger: "bg-danger-50 border-danger-200",
    default: "bg-default-50 border-default-200"
  };

  const iconBgClasses = {
    primary: "bg-primary-100 text-primary-600",
    success: "bg-success-100 text-success-600",
    warning: "bg-warning-100 text-warning-600",
    danger: "bg-danger-100 text-danger-600",
    default: "bg-default-100 text-default-600"
  };

  return (
    <div className={`p-3 rounded-lg border ${
      isHighlighted ? bgColorClasses[color] : bgColorClasses.default
    }`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`p-2 rounded-full ${
              isHighlighted ? iconBgClasses[color] : iconBgClasses.default
            }`}>
              <Icon icon={icon} width={16} height={16} />
            </div>
          )}
          <div>
            <p className="font-medium text-sm">{title}</p>
            {subtitle && (
              <p className="text-xs text-default-500">{subtitle}</p>
            )}
          </div>
        </div>
        {rightContent}
      </div>
    </div>
  );
};
