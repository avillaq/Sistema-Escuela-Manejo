import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@heroui/react';

export const PaqueteViewModal = ({ isOpen, onOpenChange, paquete }) => {
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
              Detalles del Paquete
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-2 mb-4">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-500">
                      {paquete.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold capitalize">
                    {paquete.nombre}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-default-500">ID del Paquete</p>
                    <p className="font-medium">{paquete.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Tipo de Auto</p>
                    <p className="font-medium">{paquete.tipo_auto?.tipo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Horas Totales</p>
                    <p className="font-medium">{paquete.horas_total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Costo Total (S/)</p>
                    <p className="font-medium">S/ {paquete.costo_total.toFixed(2)}</p>
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
