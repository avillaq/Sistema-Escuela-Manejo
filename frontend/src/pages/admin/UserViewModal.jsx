import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip
} from '@heroui/react';

export const UserViewModal = ({
  isOpen,
  onOpenChange,
  user
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      size="lg"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Detalles del Usuario
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-2 mb-4">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-500">
                      {user.nombre.charAt(0)}{user.apellidos.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{user.nombre} {user.apellidos}</h3>
                  <Chip
                    color={user.activo ? "success" : "danger"}
                    variant="flat"
                  >
                    {user.activo ? "Activo" : "Inactivo"}
                  </Chip>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-default-500">DNI</p>
                    <p className="font-medium">{user.dni}</p>
                  </div>

                  <div>
                    <p className="text-sm text-default-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-default-500">Género</p>
                    <p className="font-medium">{user.genero}</p>
                  </div>

                  <div>
                    <p className="text-sm text-default-500">Departamento</p>
                    <p className="font-medium">
                      <Chip size="sm" variant="flat" color="primary">
                        {user.departamento}
                      </Chip>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-default-500">Fecha de Registro</p>
                    <p className="font-medium">{new Date(user.fechaRegistro).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};