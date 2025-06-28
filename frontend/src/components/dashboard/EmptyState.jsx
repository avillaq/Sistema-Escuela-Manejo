import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  size = "default" 
}) => {
  const iconSize = size === "large" ? 48 : 32;
  const paddingClass = size === "large" ? "py-12" : "py-8";

  return (
    <div className={`text-center ${paddingClass}`}>
      <Icon 
        icon={icon} 
        className="mx-auto mb-4 text-default-300" 
        width={iconSize} 
        height={iconSize} 
      />
      <p className={`${size === "large" ? "text-lg" : "text-sm"} text-default-500 ${actionLabel ? "mb-2" : ""}`}>
        {title}
      </p>
      {description && (
        <p className="text-sm text-default-400 mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          color="primary"
          variant="flat"
          onPress={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
