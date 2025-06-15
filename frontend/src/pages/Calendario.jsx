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
import { CalendarioModal } from '@/pages/CalendarioModal';

export const Calendario = ({ userId: propUserId, matriculaId, horasRestantes, isAdminModo = false, onReservasChange }) => {
  const { user } = useAuthStore();
  const userId = propUserId || user?.id || 1;

  const [modo, setModo] = useState("vista");
  const [timeSlots, setTimeSlots] = useState(generateTimeSlots());
  const [userReservaciones, setUserReservaciones] = useState([]);
  const [slotsSeleccionados, setSlotsSeleccionados] = useState([]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalAccion, setModalAccion] = useState("reservar");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onReservasChange) {
        onReservasChange(slotsSeleccionados.length, modo);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [slotsSeleccionados, modo, onReservasChange]);

  // Obtenemos las reservas del usuario
  useEffect(() => {
    const reservacionesIniciales = generateUserReservations(userId, timeSlots);

    // Actualizamos los slots con las reservas iniciales
    const slotsActualizados = [...timeSlots];
    reservacionesIniciales.forEach(reservation => {
      const slotIndex = slotsActualizados.findIndex(slot => slot.id === reservation.timeSlotId);
      if (slotIndex !== -1) {
        slotsActualizados[slotIndex].reservations += 1;
        if (slotsActualizados[slotIndex].reservations >= slotsActualizados[slotIndex].maxReservations) {
          slotsActualizados[slotIndex].isAvailable = false;
        }
      }
    });

    setTimeSlots(slotsActualizados);
    setUserReservaciones(reservacionesIniciales.map(res => res.timeSlotId));
  }, [userId]);

  const handleCambiarModo = (newMode) => {
    setModo(newMode);
    setSlotsSeleccionados([]);
    
    // Notificar reset de seleccion
    if (onReservasChange) {
      onReservasChange(0, "vista");
    }
  };

  const handleSlotClick = (slotId) => {
    if (modo === "vista") return;

    if (modo === "reservar") {
      // Verificar si hay horas restantes (solo para modo admin)
      if (isAdminModo && horasRestantes <= 0) {
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
      if (!slot || !slot.isAvailable || userReservaciones.includes(slotId)) return;

      // Verificar limite antes de seleccionar
      if (isAdminModo && !slotsSeleccionados.includes(slotId) && slotsSeleccionados.length >= horasRestantes) {
        addToast({
          title: "Límite alcanzado",
          description: `Solo puedes seleccionar ${horasRestantes} hora(s).`,
          severity: "warning",
          color: "warning",
        });
        return;
      }

      setSlotsSeleccionados(prev =>
        prev.includes(slotId)
          ? prev.filter(id => id !== slotId)
          : [...prev, slotId]
      );
    } else if (modo === "cancelar") {
      // Solo permitir seleccionar horarios que el usuario haya reservado
      if (!userReservaciones.includes(slotId)) return;

      setSlotsSeleccionados(prev =>
        prev.includes(slotId)
          ? prev.filter(id => id !== slotId)
          : [...prev, slotId]
      );
    }
  };

  const handleGuardar = () => {
    if (slotsSeleccionados.length === 0) {
      addToast({
        title: "Selecciona horarios",
        description: modo === "reservar" ? "Selecciona al menos un horario." : "Selecciona las reservas a cancelar.",
        severity: "warning",
        color: "warning"
      });
      return;
    }

    setModalAccion(modo === "reservar" ? "reservar" : "cancelar");
    onOpen();
  };

  const handleCancelar = () => {
    setSlotsSeleccionados([]);
    setModo("vista");
    
    // Notificar cancelacion
    if (onReservasChange) {
      onReservasChange(0, "vista");
    }
  };

  const confirmarAccion = () => {
    const slotsActualizados = [...timeSlots];
    let userReservacionesActualizado = [...userReservaciones];

    if (modalAccion === "reservar") {
      // se añaden nuevas reservaciones
      slotsSeleccionados.forEach(slotId => {
        const slotIndex = slotsActualizados.findIndex(slot => slot.id === slotId);
        if (slotIndex !== -1) {
          slotsActualizados[slotIndex].reservations += 1;
          if (slotsActualizados[slotIndex].reservations >= slotsActualizados[slotIndex].maxReservations) {
            slotsActualizados[slotIndex].isAvailable = false;
          }
        }
      });

      userReservacionesActualizado = [...userReservacionesActualizado, ...slotsSeleccionados];

      addToast({
        title: "Reservas confirmadas",
        description: `Has reservado ${slotsSeleccionados.length} horario(s) exitosamente.`,
        severity: "success",
        color: "success"
      });
    } else {
      // cancelar reservaciones
      slotsSeleccionados.forEach(slotId => {
        const slotIndex = slotsActualizados.findIndex(slot => slot.id === slotId);
        if (slotIndex !== -1) {
          slotsActualizados[slotIndex].reservations -= 1;
          slotsActualizados[slotIndex].isAvailable = true;
        }
      });

      userReservacionesActualizado = userReservacionesActualizado.filter(id => !slotsSeleccionados.includes(id));

      addToast({
        title: "Reservas canceladas",
        description: `Has cancelado ${slotsSeleccionados.length} reserva(s) exitosamente.`,
        severity: "danger",
        color: "danger"
      });
    }

    setTimeSlots(slotsActualizados);
    setUserReservaciones(userReservacionesActualizado);
    setSlotsSeleccionados([]);
    setModo("vista");
    
    // Notificar finalizacion
    if (onReservasChange) {
      onReservasChange(0, "vista");
    }
  };

  const renderSlotTiempo = (slotId, day, hour) => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot) return null;

    const isUserReservacion = userReservaciones.includes(slotId);
    const isSeleccionado = slotsSeleccionados.includes(slotId);
    const isLleno = slot.reservations >= slot.maxReservations;
    const isClickeable = modo !== "vista" && 
      ((modo === "reservar" && slot.isAvailable && !isUserReservacion) ||
       (modo === "cancelar" && isUserReservacion));

    let bgColor = "bg-default-100";
    let textColor = "text-default-800";
    let borderColor = "border-divider";

    if (isUserReservacion) {
      bgColor = "bg-primary-100";
      textColor = "text-primary-700";
      borderColor = "border-primary-200";
    }

    if (isLleno && !isUserReservacion) {
      bgColor = "bg-default-200";
      textColor = "text-default-500";
    }

    if (isSeleccionado) {
      bgColor = modo === "reservar" ? "bg-success-200" : "bg-danger-200";
      textColor = modo === "reservar" ? "text-success-700" : "text-danger-700";
      borderColor = modo === "reservar" ? "border-success-300" : "border-danger-300";
    }

    const horaFormateada = hour < 12
      ? `${hour}:00 AM`
      : hour === 12
        ? "12:00 PM"
        : `${hour - 12}:00 PM`;

    return (
      <div
        key={slotId}
        className={`
          p-2 border-2 transition-all duration-200 h-16
          ${bgColor} ${textColor} ${borderColor}
          ${isClickeable ? 'cursor-pointer hover:scale-105 hover:shadow-sm' : 'cursor-default'}
          ${isSeleccionado ? 'shadow-md' : ''}
        `}
        onClick={() => handleSlotClick(slotId)}
      >
        <div className="text-xs font-medium">{horaFormateada}</div>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-70">
            {slot.reservations}/{slot.maxReservations}
          </span>
          {isUserReservacion && (
            <Icon icon="lucide:check" width={10} height={10} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controles */}
      {(!isAdminModo || horasRestantes > 0) && (
        <>
          {modo === "vista" ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {isAdminModo ? "Gestionar Reservas" : "Calendario de Reservas"}
                </h2>
                <p className="text-default-500 text-sm">
                  {isAdminModo
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
                  onPress={() => handleCambiarModo("reservar")}
                >
                  Reservar
                </Button>
                <Button
                  color="danger"
                  variant="flat"
                  className="w-full sm:w-auto"
                  startContent={<Icon icon="lucide:x" width={14} height={14} />}
                  onPress={() => handleCambiarModo("cancelar")}
                >
                  Cancelar Reservas
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {modo === "reservar" ? "Seleccionar horarios" : "Cancelar reservas"}
                </h2>
                <div className="flex items-center gap-4">
                  <p className="text-default-500 text-sm">
                    {slotsSeleccionados.length > 0 
                      ? `${slotsSeleccionados.length} seleccionado(s)`
                      : "Haz clic en los horarios"
                    }
                  </p>
                  {modo === "reservar" && isAdminModo && (
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
                  onPress={handleCancelar}
                >
                  Cancelar
                </Button>
                <Button
                  color={modo === "reservar" ? "success" : "danger"}
                  className="w-full sm:w-auto"
                  isDisabled={slotsSeleccionados.length === 0}
                  onPress={handleGuardar}
                >
                  {modo === "reservar" ? "Confirmar" : "Eliminar"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Calendario */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold">Horario Semanal</h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 min-w-[700px]">
              {/* Columna del tiempo */}
              <div className="col-span-1 bg-default-50">
                <div className="h-10 flex items-center justify-center font-semibold text-sm text-default-600 border-b border-default-200">
                  Hora
                </div>
                {HOURS.map(hour => (
                  <div
                    key={`hour-${hour}`}
                    className="h-16 flex flex-col items-center justify-center text-xs font-medium text-default-600 border-b border-default-200"
                  >
                    <span className="font-semibold">
                      {hour < 12
                        ? `${hour}:00`
                        : hour === 12
                          ? "12:00"
                          : `${hour - 12}:00`
                      }
                    </span>
                    <span className="text-[10px] opacity-70">
                      {hour < 12 ? 'AM' : 'PM'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Columnas de los dias */}
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="col-span-1">
                  <div className="h-10 flex items-center justify-center font-semibold text-sm text-default-700 border-b border-default-200 bg-default-25">
                    {day}
                  </div>
                  {HOURS.map(hour => {
                    if (dayIndex === 6 && hour >= 12) {
                      return <div key={`${day}-${hour}`} className="h-16 bg-default-50 border-b border-default-200"></div>;
                    }

                    const slotId = `${dayIndex}-${hour}`;
                    return (
                      <div key={`${day}-${hour}`} className="h-16 border-b border-default-200">
                        {renderSlotTiempo(slotId, day, hour)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <CalendarioModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        accion={modalAccion}
        slotsCount={slotsSeleccionados.length}
        onConfirm={confirmarAccion}
      />
    </div>
  );
};