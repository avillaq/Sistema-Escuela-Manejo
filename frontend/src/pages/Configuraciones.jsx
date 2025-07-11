import { Card, CardBody, Tabs, Tab } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CambioContrasenaForm } from '@/components/CambioContrasenaForm';

export const Configuraciones = () => {
  const [selectedTab, setSelectedTab] = useState("seguridad");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuraciones"
        subtitle="Maneja la configuracion de tu cuenta."
        emoji=""
      />

      <Card>
        <CardBody className="p-0">
          <Tabs
            aria-label="Tabs de configuración"
            selectedKey={selectedTab}
            onSelectionChange={setSelectedTab}
            className="w-full"
          >
            <Tab
              key="seguridad"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:shield" width={18} height={18} />
                  <span>Seguridad</span>
                </div>
              }
            >
              <div className="p-6">
                <CambioContrasenaForm />
              </div>
            </Tab>
            {/* <Tab
              key="notificaciones"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:bell" width={18} height={18} />
                  <span>Notificaciones</span>
                </div>
              }
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Preferencias</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificaciones por correo</p>
                      <p className="text-sm text-default-500">Recibe notificaciones de tus actividades al correo </p>
                    </div>
                    <Switch defaultSelected />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="flat">Cancelar</Button>
                  <Button color="primary">Guardar</Button>
                </div>
              </div>
            </Tab> */}
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};