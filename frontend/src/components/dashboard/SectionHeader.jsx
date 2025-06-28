import { Icon } from '@iconify/react';

export const SectionHeader = ({ 
  icon, 
  title, 
  className = "text-lg font-semibold text-default-700 mb-4" 
}) => {
  return (
    <h2 className={`${className} flex items-center gap-2`}>
      {icon && <Icon icon={icon} width={20} height={20} />}
      {title}
    </h2>
  );
};
