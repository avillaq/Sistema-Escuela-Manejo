import { Card, CardBody, Button } from '@heroui/react';
import { Icon } from '@iconify/react';

export const QuickActions = ({ actions = [], title = "Acciones Rápidas" }) => {
  return (
    <div>
      {title && (
        <h2 className="text-lg font-semibold text-default-700 mb-4 flex items-center gap-2">
          <Icon icon="lucide:zap" width={20} height={20} />
          {title}
        </h2>
      )}
      <Card>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {actions.map((action, index) => (
              <Button
                key={index}
                color={action.color || "primary"}
                variant={action.variant || "flat"}
                className="h-20 flex-col"
                startContent={<Icon icon={action.icon} width={20} height={20} />}
                onPress={action.onPress}
              >
                <span className="text-xs mt-1">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
