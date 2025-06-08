import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@heroui/react';
import { Icon } from '@iconify/react';

export const MatriculaDeleteModal = ({ isOpen, onOpenChange, matricula, onConfirmDelete }) => {
  const handleDelete = () => {
    onConfirmDelete(matricula.id);
    onOpenChange(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      size="md"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Eliminar Matrícula
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-danger-100">
                  <Icon icon="lucide:trash" className="text-danger" width={28} height={28} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">¿Eliminar Matrícula?</h3>
                  <p className="text-default-500 mt-1">
                    ¿Estás seguro de que deseas eliminar la matrícula de{' '}
                    <span className="font-medium">
                      {matricula.alumno.nombre} {matricula.alumno.apellidos}
                    </span>?
                  </p>
                  <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                    <p className="text-sm text-warning-700">
                      <strong>Advertencia:</strong> Esta acción eliminará todos los registros asociados 
                      a esta matrícula, incluyendo pagos y progreso académico.
                    </p>
                  </div>
                  <p className="text-danger-500 text-sm mt-2">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="danger" onPress={handleDelete}>
                Eliminar Matrícula
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};