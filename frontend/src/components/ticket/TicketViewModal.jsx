import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Divider
} from '@heroui/react';
import { Icon } from '@iconify/react';

export const TicketViewModal = ({ isOpen, onOpenChange, ticket }) => {
  if (!ticket) return null;

  // Formatear fecha y hora
  const formatearFechaHora = (fechaString) => {
    if (!fechaString) return 'N/A';
    const fecha = new Date(fechaString + (fechaString.includes('GMT') ? '' : ' GMT'));
    return fecha.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'GMT'
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary-500/20">
                  <Icon icon="lucide:ticket" className="text-primary-500" width={20} height={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Ticket #{ticket.id}</h2>
                  <p className="text-sm text-default-500">Detalles de la clase completada</p>
                </div>
              </div>
            </ModalHeader>
            
            <ModalBody>
              <div className="space-y-6">
                {/* Información del alumno */}
                <Card>
                  <CardBody className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon icon="lucide:user" width={18} height={18} />
                      <h3 className="font-semibold">Información del Alumno</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-default-500">Nombre Completo</p>
                        <p className="font-medium">{ticket.nombre_alumno}</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Número de Clase</p>
                        <Chip color="primary" variant="flat" size="sm">
                          Clase #{ticket.numero_clase_alumno}
                        </Chip>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Información de la clase */}
                <Card>
                  <CardBody className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon icon="lucide:calendar-check" width={18} height={18} />
                      <h3 className="font-semibold">Detalles de la Clase</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-default-500">Instructor</p>
                        <p className="font-medium">{ticket.nombre_instructor}</p>
                      </div>
                      <div>
                        <p className="text-sm text-default-500">Fecha y Hora</p>
                        <p className="font-medium">{formatearFechaHora(ticket.fecha_asistencia)}</p>
                      </div>
                    </div>

                    <Divider />

                    {/* Información del vehículo */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon icon="lucide:car" width={18} height={18} />
                        <h4 className="font-semibold">Vehículo Utilizado</h4>
                      </div>
                      
                      {ticket.placa_auto ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-default-500">Placa</p>
                            <p className="font-medium font-mono">{ticket.placa_auto}</p>
                          </div>
                          <div>
                            <p className="text-sm text-default-500">Marca/Modelo</p>
                            <p className="font-medium">{ticket.marca_auto} {ticket.modelo_auto}</p>
                          </div>
                          <div>
                            <p className="text-sm text-default-500">Color</p>
                            <p className="font-medium">{ticket.color_auto}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-default-500 italic">No se asignó vehículo específico</p>
                      )}
                    </div>
                  </CardBody>
                </Card>

                {/* Estado del ticket */}
                <Card className="border-success-200 bg-success-50">
                  <CardBody>
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:check-circle-2" className="text-success-600" width={24} height={24} />
                      <div>
                        <h4 className="font-medium text-success-800">Clase Completada</h4>
                        <p className="text-sm text-success-700">
                          El alumno asistió exitosamente a esta clase práctica.
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                color="primary" 
                variant="light" 
                onPress={onClose}
              >
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};