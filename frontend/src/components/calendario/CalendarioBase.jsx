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
import { CalendarioModal } from '@/components/calendario/CalendarioModal';
import { bloquesService, reservasService } from '@/service/apiService';

// Constantes
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORAS = Array.from({ length: 12 }, (_, i) => i + 7);

export const CalendarioBase = ({
  modo = "alumno", // "alumno", "matricula", "global"
  userId,
  matriculaId,
  horasRestantes: horasRestantesProps = 0,
  onReservasChange
}) => {
  const [modoCalendario, setModoCalendario] = useState("vista");
  const [bloques, setBloques] = useState([]);
  const [reservasUsuario, setReservasUsuario] = useState([]);
  const [slotsSeleccionados, setSlotsSeleccionados] = useState([]);
  const [isLoadingBloques, setIsLoadingBloques] = useState(true);
  const [isLoadingReservas, setIsLoadingReservas] = useState(true);
  const [horasRestantes, setHorasRestantes] = useState(horasRestantesProps);
  const [semanaActual, setSemanaActual] = useState(0);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalAccion, setModalAccion] = useState("reservar");

  // Configuración según el modo
  const isAdminModo = modo === "matricula" || modo === "global";
  const canReservar = (modo === "alumno" && horasRestantes > 0) ||
    (modo === "matricula" && horasRestantes > 0);

  // Actualizar horas restantes cuando cambien las props
  useEffect(() => {
    setHorasRestantes(horasRestantesProps);
  }, [horasRestantesProps]);

  // Funciones de fecha y navegación
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

  const esFechaAnterior = (fecha) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaComparar = new Date(fecha);
    fechaComparar.setHours(0, 0, 0, 0);
    return fechaComparar < hoy;
  };

  const esDiaActual = (fecha) => {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  };

  const formatearFecha = (fecha) => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${fecha.getDate()} ${meses[fecha.getMonth()]}`;
  };

  const obtenerTextoSemana = () => {
    if (semanaActual === -1) return 'Semana Anterior';
    if (semanaActual === 0) return 'Semana Actual';
    if (semanaActual === 1) return 'Semana Siguiente';
  };

  const fechasSemana = obtenerFechasSemana(new Date(), semanaActual);

  // Cargar bloques disponibles
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
  }, [semanaActual]);

  // Cargar reservas del usuario
  useEffect(() => {
    const fetchReservasUsuario = async () => {
      // En modo global, no cargar reservas
      if (modo === "global") {
        setReservasUsuario([]);
        setIsLoadingReservas(false);
        return;
      }

      if (!userId || (modo === "matricula" && !matriculaId)) {
        setIsLoadingReservas(false);
        return;
      }

      setIsLoadingReservas(true);
      try {
        const result = await reservasService.getByAlumno(userId);

        if (result.success) {
          let reservasFiltradas = result.data;

          // Filtrar por matrícula si es modo matricula
          if (modo === "matricula" && matriculaId) {
            reservasFiltradas = result.data.filter(r => r.id_matricula === parseInt(matriculaId));
          }

          setReservasUsuario(reservasFiltradas);
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
  }, [matriculaId, userId, modo, semanaActual]);

  // Notificar cambios en las reservas seleccionadas
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onReservasChange) {
        onReservasChange(slotsSeleccionados.length, modoCalendario);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [slotsSeleccionados, modoCalendario, onReservasChange]);

  // Obtener bloque para una fecha y hora especifica
  const obtenerBloque = (fecha, hora) => {
    return bloques.find(bloque => {
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

  // Manejo de modos
  const handleCambiarModo = (nuevoModo) => {
    setModoCalendario(nuevoModo);
    setSlotsSeleccionados([]);

    if (onReservasChange) {
      onReservasChange(0, "vista");
    }
  };

  const handleCancelar = () => {
    setSlotsSeleccionados([]);
    setModoCalendario("vista");

    if (onReservasChange) {
      onReservasChange(0, "vista");
    }
  };

  // Manejo de slots
  const handleSlotClick = (bloqueId, fecha, hora) => {
    if (modoCalendario === "vista") return;

    if (modoCalendario === "reservar") {
      if (esFechaAnterior(fecha)) {
        addToast({
          title: "Fecha no válida",
          description: "No puedes reservar en fechas anteriores al día actual.",
          severity: "warning",
          color: "warning",
        });
        return;
      }

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

      if (tieneReservaEnBloque(bloqueId)) {
        addToast({
          title: "Ya tienes reserva",
          description: "Ya tienes una reserva en este horario.",
          severity: "warning",
          color: "warning",
        });
        return;
      }

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
    } else if (modoCalendario === "cancelar") {
      if (!tieneReservaEnBloque(bloqueId)) return;

      setSlotsSeleccionados(prev =>
        prev.includes(bloqueId)
          ? prev.filter(id => id !== bloqueId)
          : [...prev, bloqueId]
      );
    }
  };

  // Guardar cambios
  const handleGuardar = () => {
    if (slotsSeleccionados.length === 0) {
      addToast({
        title: "Selecciona horarios",
        description: modoCalendario === "reservar" ? "Selecciona al menos un horario." : "Selecciona las reservas a cancelar.",
        severity: "warning",
        color: "warning"
      });
      return;
    }

    setModalAccion(modoCalendario === "reservar" ? "reservar" : "cancelar");
    onOpen();
  };

  // Confirmar acción
  const confirmarAccion = async () => {
    try {
      if (!matriculaId) {
        addToast({
          title: "Error",
          description: "No se pudo identificar la matrícula.",
          severity: "danger",
          color: "danger"
        });
        return;
      }

      if (modalAccion === "reservar") {
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
    setModoCalendario("vista");

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
    if (!userId) return;

    const result = await reservasService.getByAlumno(userId);

    if (result.success) {
      let reservasFiltradas = result.data;

      if (modo === "matricula" && matriculaId) {
        reservasFiltradas = result.data.filter(r => r.id_matricula === parseInt(matriculaId));
      }

      setReservasUsuario(reservasFiltradas);
    }
  };

  // Navegación de semanas
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

  // Render del slot de tiempo
  const renderSlotTiempo = (fecha, hora) => {
    const bloque = obtenerBloque(fecha, hora);
    const bloqueId = bloque?.id;
    const esFechaVencida = esFechaAnterior(fecha);
    const tieneReserva = tieneReservaEnBloque(bloqueId);
    const isSeleccionado = slotsSeleccionados.includes(bloqueId);

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

    const isClickeable = modoCalendario !== "vista" &&
      ((modoCalendario === "reservar" && isDisponible && !tieneReserva && !esFechaVencida) ||
        (modoCalendario === "cancelar" && tieneReserva));

    let bgColor = "bg-default-100";
    let textColor = "text-default-800";
    let borderColor = "border-divider";

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
      bgColor = modoCalendario === "reservar" ? "bg-success-200" : "bg-danger-200";
      textColor = modoCalendario === "reservar" ? "text-success-700" : "text-danger-700";
      borderColor = modoCalendario === "reservar" ? "border-success-300" : "border-danger-300";
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
        <span className="text-xs sm:text-sm font-medium">
          {bloque.reservas_actuales}/{bloque.capacidad_max}
        </span>

        {tieneReserva && (
          <Icon icon="lucide:check" width={10} height={10} className="sm:w-4 sm:h-4 mt-0.5 sm:mt-0" />
        )}
      </div>
    );
  };

  if (isLoadingBloques || isLoadingReservas) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <Icon icon="lucide:loader-2" className="animate-spin mx-auto mb-4" width={32} height={32} />
          <p>Cargando horarios y reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles - Solo mostrar si puede reservar */}
      {canReservar && (
        <>
          {modoCalendario === "vista" ? (
            <div className="flex gap-2 justify-end">
              <Button
                color="primary"
                startContent={<Icon icon="lucide:plus" width={14} height={14} />}
                onPress={() => handleCambiarModo("reservar")}
              >
                Reservar
              </Button>
              <Button
                color="danger"
                variant="flat"
                startContent={<Icon icon="lucide:x" width={14} height={14} />}
                onPress={() => handleCambiarModo("cancelar")}
              >
                Cancelar Reservas
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 justify-end">
              <Button
                variant="flat"
                onPress={handleCancelar}
              >
                Cancelar
              </Button>
              <Button
                color={modoCalendario === "reservar" ? "success" : "danger"}
                isDisabled={slotsSeleccionados.length === 0}
                onPress={handleGuardar}
              >
                {modoCalendario === "reservar" ? "Confirmar" : "Eliminar"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Calendario */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold">Horario Semanal</h3>

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

              {/* Columnas de los días */}
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