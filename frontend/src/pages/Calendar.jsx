import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  useDisclosure,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/store/auth-store';
import {
  DAYS,
  HOURS,
  generateTimeSlots,
  generateUserReservations
} from '@/data/calendar-data';
import { ConfirmationModal } from '@/pages/ConfirmationModal';

export const Calendar = ({ userId: propUserId, matriculaId, horasRestantes, isAdminMode = false,onReservasChange }) => {
  const { user } = useAuthStore();
  const userId = propUserId || user?.id || 1;

  const [mode, setMode] = useState("vista");
  const [timeSlots, setTimeSlots] = useState(generateTimeSlots());
  const [userReservations, setUserReservations] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalAction, setModalAction] = useState("reservar");

  const [selectedSlotsTemp, setSelectedSlotsTemp] = useState([]);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onReservasChange) {
        onReservasChange(selectedSlots.length, mode);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedSlots, mode, onReservasChange]);

  // Obtenemos las reservas del usuario
  useEffect(() => {
    const initialReservations = generateUserReservations(userId, timeSlots);

    //  Actualizamos los slots con las reservas iniciales
    const updatedSlots = [...timeSlots];
    initialReservations.forEach(reservation => {
      const slotIndex = updatedSlots.findIndex(slot => slot.id === reservation.timeSlotId);
      if (slotIndex !== -1) {
        updatedSlots[slotIndex].reservations += 1;
        if (updatedSlots[slotIndex].reservations >= updatedSlots[slotIndex].maxReservations) {
          updatedSlots[slotIndex].isAvailable = false;
        }
      }
    });

    setTimeSlots(updatedSlots);
    setUserReservations(initialReservations.map(res => res.timeSlotId));
  }, [userId]);

  // Notificar cambios en las reservas seleccionadas
  useEffect(() => {
    if (onReservasChange) {
      onReservasChange(selectedSlots.length, mode);
    }
  }, [selectedSlots, mode, onReservasChange]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSelectedSlots([]);
    
    // Notificar reset de selección
    if (onReservasChange) {
      onReservasChange(0, "vista");
    }
  };

  const handleSlotClick = (slotId) => {
    if (mode === "vista") return;

    if (mode === "reservar") {
      // Verificar si hay horas restantes (solo para modo admin)
      if (isAdminMode && horasRestantes <= 0) {
        addToast({
          title: "Sin horas disponibles",
          description: "El alumno no tiene horas restantes para reservar.",
          severity: "warning",
          color: "warning",
        });
        return;
      }

      // Solo permitir seleccionar horarios disponibles que el usuario no haya reservado
      const slot = timeSlots.find(s => s.id === slotId);
      if (!slot || !slot.isAvailable || userReservations.includes(slotId)) return;

      // Verificar límite antes de seleccionar
      if (isAdminMode && !selectedSlots.includes(slotId) && selectedSlots.length >= horasRestantes) {
        addToast({
          title: "Límite alcanzado",
          description: `Solo puedes seleccionar ${horasRestantes} hora(s).`,
          severity: "warning",
          color: "warning",
        });
        return;
      }

      setSelectedSlots(prev =>
        prev.includes(slotId)
          ? prev.filter(id => id !== slotId)
          : [...prev, slotId]
      );
    } else if (mode === "cancelar") {
      // Solo permitir seleccionar horarios que el usuario haya reservado
      if (!userReservations.includes(slotId)) return;

      setSelectedSlots(prev =>
        prev.includes(slotId)
          ? prev.filter(id => id !== slotId)
          : [...prev, slotId]
      );
    }
  };

  const handleSave = () => {
    if (selectedSlots.length === 0) {
      addToast({
        title: "Selecciona horarios",
        description: mode === "reservar" ? "Selecciona al menos un horario." : "Selecciona las reservas a cancelar.",
        severity: "warning",
        color: "warning"
      });
      return;
    }

    setModalAction(mode === "reservar" ? "reservar" : "cancelar");
    onOpen();
  };

  const handleCancel = () => {
    setSelectedSlots([]);
    setMode("vista");
    
    // Notificar cancelación
    if (onReservasChange) {
      onReservasChange(0, "vista");
    }
  };

  const confirmAction = () => {
    const updatedSlots = [...timeSlots];
    let updatedUserReservations = [...userReservations];

    if (modalAction === "reservar") {
      // Add new reservations
      selectedSlots.forEach(slotId => {
        const slotIndex = updatedSlots.findIndex(slot => slot.id === slotId);
        if (slotIndex !== -1) {
          updatedSlots[slotIndex].reservations += 1;
          if (updatedSlots[slotIndex].reservations >= updatedSlots[slotIndex].maxReservations) {
            updatedSlots[slotIndex].isAvailable = false;
          }
        }
      });

      updatedUserReservations = [...updatedUserReservations, ...selectedSlots];

      addToast({
        title: "Reservas confirmadas",
        description: `Has reservado ${selectedSlots.length} horario(s) exitosamente.`,
        severity: "success",
        color: "success"
      });
    } else {
      // Cancel reservations
      selectedSlots.forEach(slotId => {
        const slotIndex = updatedSlots.findIndex(slot => slot.id === slotId);
        if (slotIndex !== -1) {
          updatedSlots[slotIndex].reservations -= 1;
          updatedSlots[slotIndex].isAvailable = true;
        }
      });

      updatedUserReservations = updatedUserReservations.filter(id => !selectedSlots.includes(id));

      addToast({
        title: "Reservas canceladas",
        description: `Has cancelado ${selectedSlots.length} reserva(s) exitosamente.`,
        severity: "danger",
        color: "danger"
      });
    }

    setTimeSlots(updatedSlots);
    setUserReservations(updatedUserReservations);
    setSelectedSlots([]);
    setMode("vista");
    
    // Notificar finalización
    if (onReservasChange) {
      onReservasChange(0, "vista");
    }
  };

  const renderTimeSlot = (slotId, day, hour) => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot) return null;

    const isUserReservation = userReservations.includes(slotId);
    const isSelected = selectedSlots.includes(slotId);
    const isFull = slot.reservations >= slot.maxReservations;
    const isClickable = mode !== "vista" && 
      ((mode === "reservar" && slot.isAvailable && !isUserReservation) ||
       (mode === "cancelar" && isUserReservation));

    let bgColor = "bg-default-100";
    let textColor = "text-default-800";
    let borderColor = "border-divider";

    if (isUserReservation) {
      bgColor = "bg-primary-100";
      textColor = "text-primary-700";
      borderColor = "border-primary-200";
    }

    if (isFull && !isUserReservation) {
      bgColor = "bg-default-200";
      textColor = "text-default-500";
    }

    if (isSelected) {
      bgColor = mode === "reservar" ? "bg-success-200" : "bg-danger-200";
      textColor = mode === "reservar" ? "text-success-700" : "text-danger-700";
      borderColor = mode === "reservar" ? "border-success-300" : "border-danger-300";
    }

    // Mostrar menos información para reducir la carga visual
    const formattedHour = hour < 12
      ? `${hour}:00 AM`
      : hour === 12
        ? "12:00 PM"
        : `${hour - 12}:00 PM`;

    return (
      <div
        key={slotId}
        className={`
          p-2 border-2 rounded-lg transition-all duration-200 
          ${bgColor} ${textColor} ${borderColor}
          ${isClickable ? 'cursor-pointer hover:scale-101 hover:shadow-sm' : 'cursor-default'}
          ${isSelected ? 'shadow-md' : ''}
        `}
        onClick={() => handleSlotClick(slotId)}
      >
        <div className="text-xs font-medium">{formattedHour}</div>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-70">
            {slot.reservations}/{slot.maxReservations}
          </span>
          {isUserReservation && (
            <Icon icon="lucide:check" width={10} height={10} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controles */}
      {(!isAdminMode || horasRestantes > 0) && (
        <>
          {mode === "vista" ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {isAdminMode ? "Gestionar Reservas" : "Calendario de Reservas"}
                </h2>
                <p className="text-default-500 text-sm">
                  {isAdminMode
                    ? `${horasRestantes} horas disponibles`
                    : "Gestiona tus reservaciones semanales."
                  }
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  color="primary"
                  className="w-full sm:w-auto"
                  startContent={<Icon icon="lucide:plus" width={14} height={14} />}
                  onPress={() => handleModeChange("reservar")}
                >
                  Reservar
                </Button>
                <Button
                  color="danger"
                  variant="flat"
                  className="w-full sm:w-auto"
                  startContent={<Icon icon="lucide:x" width={14} height={14} />}
                  onPress={() => handleModeChange("cancelar")}
                >
                  Cancelar Reservas
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {mode === "reservar" ? "Seleccionar horarios" : "Cancelar reservas"}
                </h2>
                <div className="flex items-center gap-4">
                  <p className="text-default-500 text-sm">
                    {selectedSlots.length > 0 
                      ? `${selectedSlots.length} seleccionado(s)`
                      : "Haz clic en los horarios"
                    }
                  </p>
                  {mode === "reservar" && isAdminMode && (
                    <p className="text-xs text-warning-600">
                      Límite: {horasRestantes} horas
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de accion */}
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="flat"
                  className="w-full sm:w-auto"
                  onPress={handleCancel}
                >
                  Cancelar
                </Button>
                <Button
                  color={mode === "reservar" ? "success" : "danger"}
                  className="w-full sm:w-auto"
                  isDisabled={selectedSlots.length === 0}
                  onPress={handleSave}
                >
                  {mode === "reservar" ? "Confirmar" : "Eliminar"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold">Horario Semanal</h3>
            {mode !== "vista" && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-success-600">
                  <div className="w-3 h-3 bg-success-200 rounded border"></div>
                  <span>Seleccionado</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary-600">
                  <div className="w-3 h-3 bg-primary-100 rounded border"></div>
                  <span>Tus reservas</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-1 min-w-[700px]">
              {/* Columna del tiempo */}
              <div className="col-span-1">
                <div className="h-10 flex items-center justify-center font-medium text-xs">
                  Hora
                </div>
                {HOURS.map(hour => (
                  <div
                    key={`hour-${hour}`}
                    className="h-16 flex items-center justify-center text-xs font-medium"
                  >
                    {hour < 12
                      ? `${hour}:00 AM`
                      : hour === 12
                        ? "12:00 PM"
                        : `${hour - 12}:00 PM`
                    }
                  </div>
                ))}
              </div>

              {/* Columnas de los días */}
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="col-span-1">
                  <div className="h-10 flex items-center justify-center font-medium text-xs">
                    {day}
                  </div>
                  {HOURS.map(hour => {
                    if (dayIndex === 6 && hour >= 12) {
                      return <div key={`${day}-${hour}`} className="h-16 bg-default-50 rounded-md"></div>;
                    }

                    const slotId = `${dayIndex}-${hour}`;
                    return (
                      <div key={`${day}-${hour}`} className="h-16">
                        {renderTimeSlot(slotId, day, hour)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <ConfirmationModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        action={modalAction}
        slotsCount={selectedSlots.length}
        onConfirm={confirmAction}
      />
    </div>
  );
};