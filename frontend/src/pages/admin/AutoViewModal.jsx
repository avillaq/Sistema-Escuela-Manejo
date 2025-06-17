// AutoViewModal.jsx
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip
} from '@heroui/react';

export const AutoViewModal = ({ isOpen, onOpenChange, auto, tipo = "Auto" }) => {
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
              {`Detalles del ${tipo}`}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-2 mb-4">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-500">
                      {auto.placa.substring(0, 2)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{auto.marca} {auto.modelo}</h3>
                  <p className="text-default-500">{auto.placa}</p>
                  <Chip
                    color={auto.activo ? "success" : "danger"}
                    variant="flat"
                  >
                    {auto.activo ? "Activo" : "Inactivo"}
                  </Chip>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-default-500">Placa</p>
                    <p className="font-medium">{auto.placa}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Marca</p>
                    <p className="font-medium">{auto.marca}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Modelo</p>
                    <p className="font-medium">{auto.modelo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Color</p>
                    <p className="font-medium">{auto.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Tipo de Auto</p>
                    <p className="font-medium">{auto.tipo_auto?.tipo || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Fecha de Registro</p>
                    <p className="font-medium">{new Date(auto.fecha_creado).toLocaleDateString()}</p>
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