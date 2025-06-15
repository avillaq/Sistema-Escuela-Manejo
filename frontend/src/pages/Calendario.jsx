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
  
  // Estados para navegacion semanal
  const [fechaActual, setFechaActual] = useState(new Date());
  const [semanaActual, setSemanaActual] = useState(0);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalAccion, setModalAccion] = useState("reservar");

  // obtener las fechas de la semana
  const obtenerFechasSemana = (fecha, offsetSemana = 0) => {
    const fechaBase = new Date(fecha);
    fechaBase.setDate(fechaBase.getDate() + (offsetSemana * 7));
    
    // Obtener el lunes de la semana
    const diaLunes = fechaBase.getDate() - fechaBase.getDay() + 1;
    const primerDia = new Date(fechaBase.setDate(diaLunes));
    
    const fechasSemana = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(primerDia);
      fecha.setDate(primerDia.getDate() + i);
      fechasSemana.push(fecha);
    }
    
    return fechasSemana;
  };

  // verificar si una fecha es anterior a hoy
  const esFechaAnterior = (fecha) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);
    return fecha < hoy;
  };

  // verificar si es el dia actual
  const esDiaActual = (fecha) => {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  // Obtener fechas de la semana actual
  const fechasSemana = obtenerFechasSemana(fechaActual, semanaActual);

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

    // Verificar si es una fecha anterior (solo para reservar)
    if (modo === "reservar") {
      const [dayIndex] = slotId.split('-').map(Number);
      const fechaSlot = fechasSemana[dayIndex];
      
      if (esFechaAnterior(fechaSlot)) {
        addToast({
          title: "Fecha no válida",
          description: "No puedes reservar en fechas anteriores al día actual.",
          severity: "warning",
          color: "warning",
        });
        return;
      }

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

    const [dayIndex] = slotId.split('-').map(Number);
    const fechaSlot = fechasSemana[dayIndex];
    const esFechaVencida = esFechaAnterior(fechaSlot);

    const isUserReservacion = userReservaciones.includes(slotId);
    const isSeleccionado = slotsSeleccionados.includes(slotId);
    const isLleno = slot.reservations >= slot.maxReservations;
    const isClickeable = modo !== "vista" &&
      ((modo === "reservar" && slot.isAvailable && !isUserReservacion && !esFechaVencida) ||
        (modo === "cancelar" && isUserReservacion));

    let bgColor = "bg-default-100";
    let textColor = "text-default-800";
    let borderColor = "border-divider";

    // Estilo para fechas vencidas
    if (esFechaVencida) {
      bgColor = "bg-default-50";
      textColor = "text-default-400";
      borderColor = "border-default-100";
    } else if (isUserReservacion) {
      bgColor = "bg-primary-100";
      textColor = "text-primary-700";
      borderColor = "border-primary-200";
    } else if (isLleno) {
      bgColor = "bg-default-200";
      textColor = "text-default-500";
    }

    if (isSeleccionado) {
      bgColor = modo === "reservar" ? "bg-success-200" : "bg-danger-200";
      textColor = modo === "reservar" ? "text-success-700" : "text-danger-700";
      borderColor = modo === "reservar" ? "border-success-300" : "border-danger-300";
    }

    return (
      <div
        key={slotId}
        className={`
        p-1 sm:p-2 border transition-all duration-200 h-14 sm:h-14 md:h-16
        ${bgColor} ${textColor} ${borderColor}
        ${isClickeable ? 'cursor-pointer hover:brightness-95' : 'cursor-default'}
        ${isSeleccionado ? 'shadow-sm' : ''}
        ${esFechaVencida ? 'opacity-50' : ''}
        flex flex-col sm:flex-row items-center justify-center sm:justify-between
      `}
        onClick={() => handleSlotClick(slotId)}
      >
        {/* Capacidad siempre visible */}
        <span className="text-xs sm:text-sm font-medium">
          {slot.reservations}/{slot.maxReservations}
        </span>

        {isUserReservacion && (
          <Icon icon="lucide:check" width={10} height={10} className="sm:w-4 sm:h-4 mt-0.5 sm:mt-0" />
        )}
      </div>
    );
  };

  // Navegacion de semanas
  const irSemanaAnterior = () => {
    if (semanaActual > 0) {
      setSemanaActual(prev => prev - 1);
      setSlotsSeleccionados([]);
    }
  };

  const irSemanaProxima = () => {
    setSemanaActual(prev => prev + 1);
    setSlotsSeleccionados([]);
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fecha) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${fecha.getDate()} ${meses[fecha.getMonth()]}`;
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
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold">Horario Semanal</h3>
            
            {/* Navegacion de semanas */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="flat"
                isIconOnly
                onPress={irSemanaAnterior}
                isDisabled={semanaActual === 0}
              >
                <Icon icon="lucide:chevron-left" width={16} height={16} />
              </Button>
              
              <span className="text-sm font-medium text-default-600 min-w-[120px] text-center">
                {semanaActual === 0 ? 'Semana Actual' : `Semana +${semanaActual}`}
              </span>
              
              <Button
                size="sm"
                variant="flat"
                isIconOnly
                onPress={irSemanaProxima}
              >
                <Icon icon="lucide:chevron-right" width={16} height={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0 px-1 sm:px-6">
          <div className="w-full overflow-x-auto">
            <div className="grid grid-cols-8 min-w-[295px] w-full">
              {/* Columna del tiempo */}
              <div className="col-span-1 bg-default-50 min-w-[35px] sm:min-w-[40px]">
                <div className="h-8 sm:h-10 flex items-center justify-center font-semibold text-xs sm:text-sm text-default-600 border-b border-default-200">
                  <span className="hidden sm:inline">Hora</span>
                  <span className="sm:hidden text-[10px]">H</span>
                </div>
                {HOURS.map(hour => (
                  <div
                    key={`hour-${hour}`}
                    className="h-14 sm:h-14 md:h-16 flex flex-col items-center justify-center text-xs font-medium text-default-600 border-b border-default-200"
                  >
                    <span className="font-semibold text-[10px] sm:text-xs">
                      {hour < 12
                        ? `${hour}:00`
                        : hour === 12
                          ? "12:00"
                          : `${hour - 12}:00`
                      }
                    </span>
                    <span className="text-[9px] sm:text-[11px] opacity-70">
                      {hour < 12 ? 'AM' : 'PM'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Columnas de los dias con fechas */}
              {DAYS.map((dia, diaIndex) => {
                const fechaDia = fechasSemana[diaIndex];
                const esHoy = esDiaActual(fechaDia);
                
                return (
                  <div key={dia} className="col-span-1 min-w-[35px] sm:min-w-[40px]">
                    <div className={`
                      h-8 sm:h-10 flex flex-col items-center justify-center font-semibold text-xs sm:text-sm border-b border-default-200
                      ${esHoy ? 'bg-primary-100 text-primary-700' : 'bg-default-25 text-default-700'}
                    `}>
                      <span className="block sm:hidden text-[10px]">{dia.slice(0, 1)}</span>
                      <span className="hidden sm:block text-[10px]">{dia}</span>
                      
                      {/* Fecha */}
                      <span className={`text-[9px] sm:text-[10px] ${esHoy ? 'text-primary-600' : 'text-default-500'}`}>
                        {formatearFecha(fechaDia)}
                      </span>
                    </div>
                    {HOURS.map(hour => {
                      if (diaIndex === 6 && hour >= 12) {
                        return <div key={`${dia}-${hour}`} className="h-16 sm:h-16 md:h-16 bg-default-50 border-b border-default-200"></div>;
                      }

                      const slotId = `${diaIndex}-${hour}`;
                      return (
                        <div key={`${dia}-${hour}`} className="h-14 sm:h-14 md:h-16 border-b border-default-200">
                          {renderSlotTiempo(slotId, dia, hour)}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
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