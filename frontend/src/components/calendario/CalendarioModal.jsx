import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@heroui/react';
import { Icon } from '@iconify/react';

export const CalendarioModal = ({ isOpen, onOpenChange, accion, slotsCount, onConfirm, isLoading = false }) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const isReservar = accion === "reservar";

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      size="md"
      isDismissable={!isLoading}
      hideCloseButton={isLoading}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className={`flex flex-col gap-1 ${isReservar ? "text-success" : "text-danger"}`}>
              {isReservar ? "Confirmar Reservas" : "Confirmar Cancelación"}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className={`w-16 h-16 rounded-full ${isReservar ? "bg-success-100" : "bg-danger-100"} flex items-center justify-center`}>
                  <Icon
                    icon={isReservar ? "lucide:calendar-check" : "lucide:calendar-x"}
                    className={isReservar ? "text-success" : "text-danger"}
                    width={28}
                    height={28}
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {isReservar
                      ? "¿Confirmar tus reservas?"
                      : "¿Cancelar tus reservas?"
                    }
                  </h3>
                  <p className="text-default-500 mt-1">
                    {isReservar
                      ? `Estás a punto de reservar ${slotsCount} horario(s).`
                      : `Estás a punto de cancelar ${slotsCount} reserva(s).`
                    }
                  </p>
                  {!isReservar && (
                    <p className="text-danger-500 text-sm mt-2">
                      Esta acción no se puede deshacer.
                    </p>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose} isDisabled={isLoading}>
                Cancelar
              </Button>
              <Button
                color={isReservar ? "success" : "danger"}
                onPress={handleConfirm}
                isLoading={isLoading}
              >
                {isReservar ? "Confirmar Reservas" : "Confirmar Cancelación"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};