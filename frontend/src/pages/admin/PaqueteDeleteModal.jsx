import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@heroui/react';
import { Icon } from '@iconify/react';

export const PaqueteDeleteModal = ({ isOpen, onOpenChange, paquete, onConfirmDelete, service }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await service.delete(paquete.id);
    if (result.success) {
      onConfirmDelete(paquete.id);
      onOpenChange(false);
    } else {
      alert(result.error || 'Error al eliminar el paquete');
    }
    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-danger">Confirmar Eliminación</ModalHeader>
            <ModalBody>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-danger-100 flex items-center justify-center">
                  <Icon icon="lucide:trash" className="text-danger" width={28} height={28} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">¿Eliminar Paquete?</h3>
                  <p className="text-default-500 mt-1">
                    ¿Estás seguro de que deseas eliminar el paquete <span className="font-medium">{paquete.nombre}</span>?
                  </p>
                  <p className="text-danger-500 text-sm mt-2">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>Cancelar</Button>
              <Button color="danger" onPress={handleDelete} isLoading={isLoading}>Eliminar</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
