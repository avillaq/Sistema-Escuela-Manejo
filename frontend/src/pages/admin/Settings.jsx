import { Card, CardBody, Tabs, Tab, Input, Button, Switch } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useState } from 'react';

export const Settings = () => {
  const [selectedTab, setSelectedTab] = useState("perfil");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuraciones</h1>
        <p className="text-default-500">Maneja la configuracion de tu cuenta.</p>
      </div>

      <Card>
        <CardBody className="p-0">
          <Tabs
            aria-label="Settings tabs"
            selectedKey={selectedTab}
            onSelectionChange={setSelectedTab}
            className="w-full"
          >
            <Tab
              key="perfil"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:user" width={18} height={18} />
                  <span>Perfil</span>
                </div>
              }
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Informacion del Perfil</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    placeholder="Ingrese su nombre"
                    defaultValue="Admin"
                  />
                  <Input
                    label="Apellidos"
                    placeholder="Ingrese sus apellidos"
                    defaultValue="User"
                  />
                  <Input
                    label="Email"
                    placeholder="Ingrese su correo"
                    defaultValue="admin@example.com"
                    type="email"
                  />
                  <Input
                    label="Telefono"
                    placeholder="Ingrese su telefono"
                    defaultValue="988088793"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="flat">Cancelar</Button>
                  <Button color="primary">Guardar</Button>
                </div>
              </div>
            </Tab>
            <Tab
              key="security"
              title={
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:shield" width={18} height={18} />
                  <span>Seguridad</span>
                </div>
              }
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Cambiar Contraseña</h3>
                <div className="space-y-4">
                  <Input
                    label="Contraseña Actual"
                    placeholder="Ingrese su contraseña actual"
                    type="password"
                  />
                  <Input
                    label="Nueva Contraseña"
                    placeholder="Ingrese su nueva contraseña"
                    type="password"
                  />
                  <Input
                    label="Confirmar Nueva Contraseña"
                    placeholder="Confirme su nueva contraseña"
                    type="password"
                  />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="flat">Cancelar</Button>
                  <Button color="primary">Guardar</Button>
                </div>
              </div>
            </Tab>
            <Tab
              key="notifications"
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
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};