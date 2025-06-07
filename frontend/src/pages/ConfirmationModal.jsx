import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button
} from '@heroui/react';
import { Icon } from '@iconify/react';

export const ConfirmationModal = ({ 
  isOpen, 
  onOpenChange,
  action,
  slotsCount,
  onConfirm
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };
  
  const isReserve = action === 'reserve';
  
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
            <ModalHeader className={`flex flex-col gap-1 ${isReserve ? 'text-success' : 'text-danger'}`}>
              {isReserve ? 'Confirmar Reservas' : 'Confirmar Cancelación'}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className={`w-16 h-16 rounded-full ${isReserve ? 'bg-success-100' : 'bg-danger-100'} flex items-center justify-center`}>
                  <Icon 
                    icon={isReserve ? 'lucide:calendar-check' : 'lucide:calendar-x'} 
                    className={isReserve ? 'text-success' : 'text-danger'} 
                    width={28} 
                    height={28} 
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {isReserve 
                      ? '¿Confirmar tus reservas?' 
                      : '¿Cancelar tus reservas?'
                    }
                  </h3>
                  <p className="text-default-500 mt-1">
                    {isReserve 
                      ? `Estás a punto de reservar ${slotsCount} horario(s).` 
                      : `Estás a punto de cancelar ${slotsCount} reserva(s).`
                    }
                  </p>
                  {!isReserve && (
                    <p className="text-danger-500 text-sm mt-2">
                      Esta acción no se puede deshacer.
                    </p>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancelar
              </Button>
              <Button 
                color={isReserve ? 'success' : 'danger'} 
                onPress={handleConfirm}
              >
                {isReserve ? 'Confirmar Reservas' : 'Confirmar Cancelación'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};