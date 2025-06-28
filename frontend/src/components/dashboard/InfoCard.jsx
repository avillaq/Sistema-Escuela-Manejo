import { Card, CardBody, CardHeader, Avatar, Divider, Chip } from '@heroui/react';

export const InfoCard = ({ 
  title, 
  subtitle, 
  avatarName, 
  fields = [], 
  chips = [] 
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar
            size="lg"
            name={avatarName}
            className="bg-primary-100 text-primary-700"
          />
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-default-500">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {fields.map((field, index) => (
          <div key={index}>
            {field.dividerBefore && <Divider />}
            <div>
              <p className="text-sm text-default-500">{field.label}</p>
              <p className={`font-medium ${field.className || ""}`}>
                {field.value}
              </p>
            </div>
            {field.dividerAfter && <Divider />}
          </div>
        ))}
        
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((chip, index) => (
              <Chip
                key={index}
                size={chip.size || "sm"}
                color={chip.color || "primary"}
                variant={chip.variant || "flat"}
              >
                {chip.label}
              </Chip>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
