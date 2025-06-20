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
import { CalendarioModal } from '@/pages/CalendarioModal';
import { bloquesService, reservasService } from '@/service/apiService';

// Dias de la semana
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
// Horas de 7am a 6pm (domingo hasta 12pm)
const HORAS = Array.from({ length: 12 }, (_, i) => i + 7);

export const Calendario = ({ userId, matriculaId, horasRestantes: horasRestantesProps, isAdminModo = false, onReservasChange }) => {
  const [modo, setModo] = useState("vista");
  const [bloques, setBloques] = useState([]);
  const [reservasUsuario, setReservasUsuario] = useState([]);
  const [slotsSeleccionados, setSlotsSeleccionados] = useState([]);
  const [isLoadingBloques, setIsLoadingBloques] = useState(true);
  const [isLoadingReservas, setIsLoadingReservas] = useState(true);
  const [horasRestantes, setHorasRestantes] = useState(horasRestantesProps);

  // Estados para navegacion semanal
  const [fechaActual, setFechaActual] = useState(new Date());
  const [semanaActual, setSemanaActual] = useState(0); // -1, 0, 1

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalAccion, setModalAccion] = useState("reservar");

  // Actualizar horas restantes cuando cambien las props
  useEffect(() => {
    setHorasRestantes(horasRestantesProps);
  }, [horasRestantesProps]);

  // obtener las fechas de la semana
  const obtenerFechasSemana = (fecha, offsetSemana = 0) => {
    const fechaBase = new Date(fecha);
    fechaBase.setDate(fechaBase.getDate() + (offsetSemana * 7));

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
    const fechaComparar = new Date(fecha);
    fechaComparar.setHours(0, 0, 0, 0);
    return fechaComparar < hoy;
  };

  // verificar si es el dia actual
  const esDiaActual = (fecha) => {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  // Obtener fechas de la semana actual
  const fechasSemana = obtenerFechasSemana(fechaActual, semanaActual);

  // Cargar bloques disponibles desde el backend
  useEffect(() => {
    const fetchBloquesDisponibles = async () => {
      setIsLoadingBloques(true);
      try {
        const result = await bloquesService.getDisponibles();
        if (result.success) {
          setBloques(result.data);
        } else {
          addToast({
            title: "Error al cargar horarios",
            description: result.error || "No se pudieron cargar los horarios disponibles.",
            severity: "danger",
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "Ha ocurrido un error al cargar los horarios.",
          severity: "danger",
          color: "danger",
        });
      } finally {
        setIsLoadingBloques(false);
      }
    };

    fetchBloquesDisponibles();
  }, [semanaActual]); // Recargar cuando cambia la semana

  // Cargar reservas del usuario
  useEffect(() => {
    const fetchReservasUsuario = async () => {
      if (!matriculaId) return;

      setIsLoadingReservas(true);
      try {
        const result = await reservasService.getByAlumno(userId);

        if (result.success) {
          // Filtrar reservas de la matrícula actual
          const reservasMatricula = result.data.filter(r => r.id_matricula === parseInt(matriculaId));
          console.log(result.data, reservasMatricula);
          setReservasUsuario(reservasMatricula);
        } else {
          console.error('Error al cargar reservas:', result.error);
        }
      } catch (error) {
        console.error('Error al cargar reservas:', error);
      } finally {
        setIsLoadingReservas(false);
      }
    };

    fetchReservasUsuario();
  }, [matriculaId, userId, isAdminModo, semanaActual]);

  // Notificar cambios en las reservas seleccionadas
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onReservasChange) {
        onReservasChange(slotsSeleccionados.length, modo);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [slotsSeleccionados, modo, onReservasChange]);

  // Obtener bloque para una fecha y hora especifica
  const obtenerBloque = (fecha, hora) => {
    return bloques.find(bloque => {
      // Convertir fecha del backend (YYYY-MM-DD) a objeto Date para comparar
      const fechaBloque = new Date(bloque.fecha + 'T00:00:00');
      const horaBloque = parseInt(bloque.hora_inicio.split(':')[0]);

      return fechaBloque.toDateString() === fecha.toDateString() && horaBloque === hora;

    });
  };

  // Verificar si el usuario tiene una reserva en un bloque específico
  const tieneReservaEnBloque = (bloqueId) => {
    return reservasUsuario.some(reserva => reserva.id_bloque === bloqueId);
  };

  // Obtener reserva del usuario para un bloque específico
  const obtenerReservaEnBloque = (bloqueId) => {
    return reservasUsuario.find(reserva => reserva.id_bloque === bloqueId);
  };

  const handleCambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setSlotsSeleccionados([]);

    // Notificar reset de seleccion
    if (onReservasChange) {
      onReservasChange(0, "vista");
    }
  };

  const handleSlotClick = (bloqueId, fecha, hora) => {
    if (modo === "vista") return;

    // Verificar si es una fecha anterior (solo para reservar)
    if (modo === "reservar") {
      if (esFechaAnterior(fecha)) {
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

      const bloque = obtenerBloque(fecha, hora);
      if (!bloque || bloque.reservas_actuales >= bloque.capacidad_max) {
        addToast({
          title: "Horario no disponible",
          description: "Este horario está completo o no está disponible.",
          severity: "warning",
          color: "warning",
        });
        return;
      }

      // No permitir seleccionar si ya tiene reserva
      if (tieneReservaEnBloque(bloqueId)) {
        addToast({
          title: "Ya tienes reserva",
          description: "Ya tienes una reserva en este horario.",
          severity: "warning",
          color: "warning",
        });
        return;
      }

      // Verificar limite antes de seleccionar
      if (isAdminModo && !slotsSeleccionados.includes(bloqueId) && slotsSeleccionados.length >= horasRestantes) {
        addToast({
          title: "Límite alcanzado",
          description: `Solo puedes seleccionar ${horasRestantes} hora(s).`,
          severity: "warning",
          color: "warning",
        });
        return;
      }

      setSlotsSeleccionados(prev =>
        prev.includes(bloqueId)
          ? prev.filter(id => id !== bloqueId)
          : [...prev, bloqueId]
      );
    } else if (modo === "cancelar") {
      // Solo permitir seleccionar horarios que el usuario haya reservado
      if (!tieneReservaEnBloque(bloqueId)) return;

      setSlotsSeleccionados(prev =>
        prev.includes(bloqueId)
          ? prev.filter(id => id !== bloqueId)
          : [...prev, bloqueId]
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

  const confirmarAccion = async () => {
    try {
      if (modalAccion === "reservar") {
        // Crear reservas
        const reservasData = {
          id_matricula: parseInt(matriculaId),
          reservas: slotsSeleccionados.map(bloqueId => ({ id_bloque: bloqueId }))
        };

        const result = await reservasService.create(reservasData);
        if (result.success) {
          addToast({
            title: "Reservas confirmadas",
            description: `Has reservado ${slotsSeleccionados.length} horario(s) exitosamente.`,
            severity: "success",
            color: "success"
          });

          // Recargar datos
          await Promise.all([cargarBloques(), cargarReservas()]);
        } else {
          addToast({
            title: "Error al reservar",
            description: result.error || "No se pudieron crear las reservas.",
            severity: "danger",
            color: "danger"
          });
        }
      } else {
        // Cancelar reservas
        const reservasACancelar = slotsSeleccionados.map(bloqueId => {
          const reserva = obtenerReservaEnBloque(bloqueId);
          return reserva?.id;
        }).filter(Boolean);

        const cancelarData = {
          id_matricula: parseInt(matriculaId),
          ids_reservas: reservasACancelar
        };

        const result = await reservasService.delete(cancelarData);
        if (result.success) {
          addToast({
            title: "Reservas canceladas",
            description: `Has cancelado ${slotsSeleccionados.length} reserva(s) exitosamente.`,
            severity: "success",
            color: "success"
          });

          // Recargar datos
          await Promise.all([cargarBloques(), cargarReservas()]);
        } else {
          addToast({
            title: "Error al cancelar",
            description: result.error || "No se pudieron cancelar las reservas.",
            severity: "danger",
            color: "danger"
          });
        }
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Ha ocurrido un error al procesar la solicitud.",
        severity: "danger",
        color: "danger"
      });
    }

    setSlotsSeleccionados([]);
    setModo("vista");

    if (onReservasChange) {
      onReservasChange(0, "vista");
    }
  };

  // Funciones para recargar datos
  const cargarBloques = async () => {
    const result = await bloquesService.getDisponibles();
    if (result.success) {
      setBloques(result.data);
    }
  };

  const cargarReservas = async () => {
    if (!matriculaId) return;

    const result = await reservasService.getByAlumno(userId);

    if (result.success) {
      const reservasMatricula = result.data.filter(r => r.id_matricula === parseInt(matriculaId));
      setReservasUsuario(reservasMatricula);
    }
  };


  const renderSlotTiempo = (fecha, hora) => {
    const bloque = obtenerBloque(fecha, hora);
    const bloqueId = bloque?.id;
    const esFechaVencida = esFechaAnterior(fecha);
    const tieneReserva = tieneReservaEnBloque(bloqueId);
    const isSeleccionado = slotsSeleccionados.includes(bloqueId);

    // Si no hay bloque disponible
    if (!bloque) {
      return (
        <div className="h-14 sm:h-14 md:h-16 border-b border-default-200 bg-default-50 flex items-center justify-center">
          <span className="text-xs text-default-400 hidden sm:block">No disponible</span>
          <span className="text-[8px] text-default-400 block sm:hidden">No disp.</span>
        </div>
      );
    }

    const isLleno = bloque.reservas_actuales >= bloque.capacidad_max;
    const isDisponible = bloque.reservas_actuales < bloque.capacidad_max;

    const isClickeable = modo !== "vista" &&
      ((modo === "reservar" && isDisponible && !tieneReserva && !esFechaVencida) ||
        (modo === "cancelar" && tieneReserva));

    let bgColor = "bg-default-100";
    let textColor = "text-default-800";
    let borderColor = "border-divider";

    // Estilo para fechas vencidas
    if (esFechaVencida) {
      bgColor = "bg-default-50";
      textColor = "text-default-400";
      borderColor = "border-default-100";
    } else if (tieneReserva) {
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
        className={`
          p-1 sm:p-2 border transition-all duration-200 h-14 sm:h-14 md:h-16
          ${bgColor} ${textColor} ${borderColor}
          ${isClickeable ? 'cursor-pointer hover:brightness-95' : 'cursor-default'}
          ${isSeleccionado ? 'shadow-sm' : ''}
          ${esFechaVencida ? 'opacity-50' : ''}
          flex flex-col sm:flex-row items-center justify-center sm:justify-between
        `}
        onClick={() => isClickeable && handleSlotClick(bloqueId, fecha, hora)}
      >
        {/* Capacidad */}
        <span className="text-xs sm:text-sm font-medium">
          {bloque.reservas_actuales}/{bloque.capacidad_max}
        </span>

        {tieneReserva && (
          <Icon icon="lucide:check" width={10} height={10} className="sm:w-4 sm:h-4 mt-0.5 sm:mt-0" />
        )}
      </div>
    );
  };

  // Navegacion de semanas
  const irSemanaAnterior = () => {
    if (semanaActual > -1) {
      setSemanaActual(prev => prev - 1);
      setSlotsSeleccionados([]);
    }
  };

  const irSemanaProxima = () => {
    if (semanaActual < 1) {
      setSemanaActual(prev => prev + 1);
      setSlotsSeleccionados([]);
    }
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fecha) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${fecha.getDate()} ${meses[fecha.getMonth()]}`;
  };

  // Obtener texto para mostrar la semana actual
  const obtenerTextoSemana = () => {
    if (semanaActual === -1) return 'Semana Anterior';
    if (semanaActual === 0) return 'Semana Actual';
    if (semanaActual === 1) return 'Semana Siguiente';
  };

  if (isLoadingBloques || isLoadingReservas) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <Icon icon="lucide:loader-2" className="animate-spin mx-auto mb-4" width={32} height={32} />
          <p>Cargando horarios y reservas..</p>
        </div>
      </div>
    );
  }

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
                isDisabled={semanaActual === -1}
              >
                <Icon icon="lucide:chevron-left" width={16} height={16} />
              </Button>

              <span className="text-sm font-medium text-default-600 min-w-[120px] text-center">
                {obtenerTextoSemana()}
              </span>

              <Button
                size="sm"
                variant="flat"
                isIconOnly
                onPress={irSemanaProxima}
                isDisabled={semanaActual === 1}
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
                {HORAS.map(hour => (
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
              {DIAS.map((dia, diaIndex) => {
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
                    {HORAS.map(hora => {
                      if (diaIndex === 6 && hora >= 12) {
                        return <div key={`${dia}-${hora}`} className="h-14 sm:h-14 md:h-16 bg-default-50 border-b border-default-200"></div>;
                      }

                      return (
                        <div key={`${dia}-${hora}`} className="h-14 sm:h-14 md:h-16 border-b border-default-200">
                          {renderSlotTiempo(fechaDia, hora)}
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