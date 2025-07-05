import { Icon } from '@iconify/react';

export const LoadingSpinner = ({ mensaje="" }) => {
  return (
    <div className="flex justify-center items-center min-h-64">
      <div className="text-center">
        <Icon icon="lucide:loader-2" className="animate-spin mx-auto mb-4 text-primary-500" width={32} height={32} />
        <p>{mensaje }</p>
      </div>
    </div>
  );
};
