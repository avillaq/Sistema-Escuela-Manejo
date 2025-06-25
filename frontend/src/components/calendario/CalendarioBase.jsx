import { useState, useEffect, useMemo, useCallback } from 'react';
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
const HORAS = Array.from({ length: 11 }, (_, i) => i + 7); // 7 am a 5 pm

export const CalendarioBase = ({
  modo = "alumno", // "alumno", "matricula", "global"
  userId,
  matriculaId,
  horasRestantes: horasRestantesProps = 0,
  estadoClases = "pendiente",
  categoria = "A-I",
  onReservasChange
}) => {
  const [modoCalendario, setModoCalendario] = useState("vista");

  // Estados de trabajo
  const [bloques, setBloques] = useState([]);
  const [reservasUsuario, setReservasUsuario] = useState([]);

  const [slotsSeleccionados, setSlotsSeleccionados] = useState([]);
  const [isLoadingBloques, setIsLoadingBloques] = useState(false);
  const [isLoadingReservas, setIsLoadingReservas] = useState(false);
  const [horasRestantes, setHorasRestantes] = useState(horasRestantesProps);
  const [semanaActual, setSemanaActual] = useState(0);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalAccion, setModalAccion] = useState("reservar");
  const [isConfirmandoAccion, setIsConfirmandoAccion] = useState(false);

  // Configuracion según el modo
  const config = useMemo(() => ({
    isAdminModo: modo === "matricula" || modo === "global",
    canReservar: (modo === "alumno" && estadoClases !== "completado" && estadoClases !== "vencido") ||
      (modo === "matricula" && estadoClases !== "completado" && estadoClases !== "vencido")
  }), [modo, estadoClases]);

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

  // Verificar si una fecha requiere anticipación para A-II
  const requiereAnticipacion = useCallback((fecha) => {
    if (config.isAdminModo) return false;
    if (categoria !== "A-II") return false;

    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999); // Fin del día actual

    const fechaBloque = new Date(fecha);
    fechaBloque.setHours(0, 0, 0, 0); // Inicio del día del bloque

    // 24 horas de anticipación
    return fechaBloque <= hoy;
  }, [config.isAdminModo, categoria]);

  // Determinar si una fecha está en el pasado
  const esFechaPasada = useCallback((fecha) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaComparar = new Date(fecha);
    fechaComparar.setHours(0, 0, 0, 0);
    return fechaComparar < hoy;
  }, []);

  // verificar si una hora específica ya pasó
  const esHoraPasada = useCallback((fecha, hora) => {
    const ahora = new Date();
    // Tolerancia de 15 minutos para reservas o cancelaciones
    ahora.setMinutes(ahora.getMinutes() - 15);
    const fechaHora = new Date(fecha);
    fechaHora.setHours(hora, 0, 0, 0);

    return fechaHora < ahora;
  }, []);

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

    if (config.isAdminModo) {
      if (semanaActual < -1) return `${Math.abs(semanaActual)} semanas atrás`;
      if (semanaActual > 1) return `${semanaActual} semanas adelante`;
    }

    return `Semana ${semanaActual > 0 ? '+' : ''}${semanaActual}`;
  };

  // Obtener las fechas de la semana actual
  const fechasSemana = useMemo(() => {
    return obtenerFechasSemana(new Date(), semanaActual);
  }, [semanaActual]);

  // Cargar datos iniciales (solo una vez por semana)
  const cargarDatosIniciales = async () => {
    if (isLoadingBloques || isLoadingReservas) return;
    setIsLoadingBloques(true);
    setIsLoadingReservas(true);

    try {
      const alumnoId = modo === "global" ? null : userId;
      const [bloquesResult, reservasResult] = await Promise.all([
        bloquesService.getSemanal(semanaActual, alumnoId),
        modo !== "global" ? reservasService.getByAlumno(userId, semanaActual) : Promise.resolve({ success: true, data: [] })
      ]);

      if (bloquesResult.success) {
        setBloques(bloquesResult.data);
      } else {
        addToast({
          title: "Error al cargar horarios",
          description: bloquesResult.error || "No se pudieron cargar los horarios disponibles.",
          severity: "danger",
          color: "danger",
        });
      }

      if (reservasResult.success) {
        let reservasFiltradas = reservasResult.data;
        if (modo === "matricula" && matriculaId) {
          reservasFiltradas = reservasResult.data.filter(r => r.id_matricula === parseInt(matriculaId));
        }
        setReservasUsuario(reservasFiltradas);
      } else {
        addToast({
          title: "Error al cargar reservas",
          description: reservasResult.error || "No se pudieron cargar las reservas del usuario.",
          severity: "danger",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      addToast({
        title: "Error",
        description: "Ha ocurrido un error al cargar los datos.",
        severity: "danger",
        color: "danger",
      });
    } finally {
      setIsLoadingBloques(false);
      setIsLoadingReservas(false);
    }
  };
  useEffect(() => {
    cargarDatosIniciales();
  }, [semanaActual, userId, modo]); // Solo cuando cambia la semana o usuario

  // Función para actualizar estado local después de operaciones exitosas
  const actualizarEstadoLocal = (operacion, reservasAfectadas) => {
    if (operacion === "reservar") {
      // Actualizar bloques (incrementar reservas_actuales)
      setBloques(prevBloques =>
        prevBloques.map(bloque => {
          const reservaEnBloque = reservasAfectadas.some(r => r.id_bloque === bloque.id);
          return reservaEnBloque
            ? { ...bloque, reservas_actuales: bloque.reservas_actuales + 1 }
            : bloque;
        })
      );

      // Añadir nuevas reservas al estado
      setReservasUsuario(prevReservas => [...prevReservas, ...reservasAfectadas]);

    } else if (operacion === "cancelar") {
      // Actualizar bloques (decrementar reservas_actuales)
      setBloques(prevBloques =>
        prevBloques.map(bloque => {
          const reservaEnBloque = reservasAfectadas.some(r => r.id_bloque === bloque.id);
          return reservaEnBloque
            ? { ...bloque, reservas_actuales: Math.max(0, bloque.reservas_actuales - 1) }
            : bloque;
        })
      );

      // Remover reservas canceladas
      const idsReservasCanceladas = reservasAfectadas.map(r => r.id);
      setReservasUsuario(prevReservas =>
        prevReservas.filter(r => !idsReservasCanceladas.includes(r.id))
      );
    }
  };

  const actualizarDespuesDeOperacion = async (operacion, datos) => {
    actualizarEstadoLocal(operacion, datos);

    setTimeout(async () => {
      const alumnoId = modo === "global" ? null : userId;
      const bloquesActualizados = await bloquesService.getSemanal(semanaActual, alumnoId);
      if (bloquesActualizados.success) {
        setBloques(bloquesActualizados.data);
      }
    }, 1000);
  };

  // Mapear bloques para acceso rápido
  const bloquesMap = useMemo(() => {
    const map = new Map();
    bloques.forEach(bloque => {
      const fechaBloque = new Date(bloque.fecha + 'T00:00:00');
      const horaBloque = parseInt(bloque.hora_inicio.split(':')[0]);
      const key = `${fechaBloque.toDateString()}-${horaBloque}`;
      map.set(key, bloque);
    });
    return map;
  }, [bloques]);

  // Obtener bloque para una fecha y hora especifica
  const obtenerBloque = useCallback((fecha, hora) => {
    const key = `${fecha.toDateString()}-${hora}`;
    return bloquesMap.get(key);
  }, [bloquesMap]);

  // Mapear reservas del usuario para acceso rápido
  const reservasMap = useMemo(() => {
    const map = new Map();
    reservasUsuario.forEach(reserva => {
      map.set(reserva.id_bloque, reserva);
    });
    return map;
  }, [reservasUsuario]);

  // Verificar si el usuario tiene una reserva en un bloque específico
  const tieneReservaEnBloque = useCallback((bloqueId) => {
    return reservasMap.has(bloqueId);
  }, [reservasMap]);

  // Obtener reserva del usuario para un bloque específico
  const obtenerReservaEnBloque = useCallback((bloqueId) => {
    return reservasMap.get(bloqueId);
  }, [reservasMap]);

  // Manejo de modos
  const handleCambiarModo = (nuevoModo) => {
    setModoCalendario(nuevoModo);
    setSlotsSeleccionados([]);
  };

  const handleCancelar = () => {
    setSlotsSeleccionados([]);
    setModoCalendario("vista");
  };

  // Manejo de slots
  const handleSlotClick = (bloqueId, fecha, hora) => {
    if (modoCalendario === "vista") return;

    if (modoCalendario === "reservar") {
      if (esFechaPasada(fecha) || esHoraPasada(fecha, hora)) {
        addToast({
          title: "Fecha no válida",
          description: "No puedes reservar en horarios que ya han pasado.",
          severity: "warning",
          color: "warning",
        });
        return;
      }

      if (requiereAnticipacion(fecha)) {
        addToast({
          title: "Anticipación requerida",
          description: "Los alumnos de categoría A-II deben reservar con al menos 24 horas de anticipación.",
          severity: "warning",
          color: "warning",
        });
        return;
      }

      if (config.isAdminModo && horasRestantes <= 0) {
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

      if (config.isAdminModo && !slotsSeleccionados.includes(bloqueId) && slotsSeleccionados.length >= horasRestantes) {
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

      // Verificar si la reserva ya tiene asistencia registrada
      const reserva = obtenerReservaEnBloque(bloqueId);
      const asistencia = reserva?.asistencia;
      const tieneAsistenciaRegistrada = asistencia && (asistencia?.asistio === true || asistencia?.asistio === false);

      if (tieneAsistenciaRegistrada) {
        addToast({
          title: "No se puede cancelar",
          description: "No puedes cancelar una reserva que ya tiene asistencia registrada.",
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
    setIsConfirmandoAccion(true);
    try {
      if (modalAccion === "reservar") {
        const reservasData = {
          id_matricula: parseInt(matriculaId),
          reservas: slotsSeleccionados.map(bloqueId => ({ id_bloque: bloqueId }))
        };

        const result = await reservasService.create(reservasData);
        if (result.success) {
          actualizarDespuesDeOperacion("reservar", result.data.reservas);

          if (onReservasChange) {
            onReservasChange("refresh");
          }

          addToast({
            title: "Reservas confirmadas",
            description: `Has reservado ${slotsSeleccionados.length} horario(s) exitosamente.`,
            severity: "success",
            color: "success"
          });
          onOpenChange(false);

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
          actualizarDespuesDeOperacion("cancelar", result.data.reservas);
          if (onReservasChange) {
            onReservasChange("refresh");
          }
          addToast({
            title: "Reservas canceladas",
            description: `Has cancelado ${slotsSeleccionados.length} reserva(s) exitosamente.`,
            severity: "success",
            color: "success"
          });
          onOpenChange(false);

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
      await cargarDatosIniciales();
    } finally {
      setIsConfirmandoAccion(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSlotsSeleccionados([]);
      setModoCalendario("vista");
    }
  }, [isOpen]);

  // Navegación de semanas
  const irSemanaAnterior = () => {
    if (config.isAdminModo) {
      setSemanaActual(prev => prev - 1);
    } else {
      // Alumnos limitados a semana anterior (-1)
      if (semanaActual > -1) {
        setSemanaActual(prev => prev - 1);
      }
    }
    setSlotsSeleccionados([]);
  };

  const irSemanaProxima = () => {
    if (config.isAdminModo) {
      setSemanaActual(prev => prev + 1);
    } else {
      // Alumnos limitados a semana siguiente (+1)
      if (semanaActual < 1) {
        setSemanaActual(prev => prev + 1);
      }
    }
    setSlotsSeleccionados([]);
  };

  const irSemanaActual = () => {
    setSemanaActual(0);
    setSlotsSeleccionados([]);
  };

  // Render del slot de tiempo
  const renderSlotTiempo = (fecha, hora) => {
    const bloque = obtenerBloque(fecha, hora);
    const bloqueId = bloque?.id;
    const esFechaPas = esFechaPasada(fecha);
    const esHoraPas = esHoraPasada(fecha, hora);
    const tieneReserva = tieneReservaEnBloque(bloqueId);
    const isSeleccionado = slotsSeleccionados.includes(bloqueId);
    const necesitaAnticipacion = requiereAnticipacion(fecha);

    // Obtener información de asistencia si existe reserva
    const reserva = obtenerReservaEnBloque(bloqueId);
    const asistencia = reserva?.asistencia;

    // Verificar si ya tiene asistencia registrada (asistió o no asistió)
    const tieneAsistenciaRegistrada = asistencia && (asistencia?.asistio === true || asistencia?.asistio === false);

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

    // Solo se puede hacer clic si:
    // 1. No está en modo vista
    // 2. Para reservar: bloque disponible, sin reserva, no es fecha/hora pasada, cumple anticipación A-II
    // 3. Para cancelar: tiene reserva, no es fecha/hora pasada Y no tiene asistencia registrada
    const isClickeable = modoCalendario !== "vista" &&
      ((modoCalendario === "reservar" && isDisponible && !tieneReserva && !esFechaPas && !esHoraPas && !necesitaAnticipacion) ||
        (modoCalendario === "cancelar" && tieneReserva && !esFechaPas && !esHoraPas && !tieneAsistenciaRegistrada));

    let bgColor = "bg-default-100";
    let textColor = "text-default-800";
    let borderColor = "border-divider";

    // Colores para fechas/horas pasadas
    if (esFechaPas || esHoraPas) {
      if (tieneReserva) {
        if (asistencia?.asistio) {
          bgColor = "bg-success-100";
          textColor = "text-success-700";
          borderColor = "border-success-200";
        } else if (asistencia?.asistio === false) {
          bgColor = "bg-danger-100";
          textColor = "text-danger-700";
          borderColor = "border-danger-200";
        } else {
          // Reserva sin registrar asistencia
          bgColor = "bg-warning-100";
          textColor = "text-warning-700";
          borderColor = "border-warning-200";
        }
      } else {
        bgColor = "bg-default-50";
        textColor = "text-default-400";
        borderColor = "border-default-100";
      }
    }
    // Colores para fechas/horas actuales/futuras
    else {
      if (tieneReserva) {
        bgColor = "bg-primary-100";
        textColor = "text-primary-700";
        borderColor = "border-primary-200";
      } else if (isLleno) {
        bgColor = "bg-default-200";
        textColor = "text-default-500";
      } else if (necesitaAnticipacion) {
        bgColor = "bg-warning-50";
        textColor = "text-warning-600";
        borderColor = "border-warning-200";
      }
    }

    // Colores para selección activa
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
          ${(esFechaPas || esHoraPas) ? 'opacity-75' : ''}
          ${necesitaAnticipacion ? 'opacity-60' : ''}
          flex flex-col sm:flex-row items-center justify-center sm:justify-between
        `}
        onClick={() => isClickeable && handleSlotClick(bloqueId, fecha, hora)}
      >
        <span className="text-xs sm:text-sm font-medium">
          {bloque.reservas_actuales}/{bloque.capacidad_max}
        </span>

        <div className="flex items-center gap-1">
          {/* Indicador de reserva */}
          {tieneReserva && (
            <Icon icon="lucide:check" width={10} height={10} className="sm:w-4 sm:h-4" />
          )}

          {/* Indicador de restricción A-II */}
          {necesitaAnticipacion && !tieneReserva && (
            <Icon icon="lucide:clock-alert" width={8} height={8} className="sm:w-3 sm:h-3 text-warning-600" />
          )}

          {/* Indicador de asistencia para fechas pasadas */}
          {tieneReserva && (esFechaPas || esHoraPas) && asistencia && (
            <>
              {asistencia.asistio ? (
                <Icon icon="lucide:user-check" width={8} height={8} className="sm:w-3 sm:h-3 text-success-600" />
              ) : (
                <Icon icon="lucide:user-x" width={8} height={8} className="sm:w-3 sm:h-3 text-danger-600" />
              )}
            </>
          )}

          {/* Indicador de reserva sin asistencia registrada */}
          {tieneReserva && (esFechaPas || esHoraPas) && !asistencia && (
            <Icon icon="lucide:clock" width={8} height={8} className="sm:w-3 sm:h-3 text-warning-600" />
          )}
        </div>
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
      {config.canReservar && (
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
                isDisabled={!config.isAdminModo && semanaActual === -1}
              >
                <Icon icon="lucide:chevron-left" width={16} height={16} />
              </Button>

              {config.isAdminModo && semanaActual !== 0 && (
                <Button
                  size="sm"
                  variant="flat"
                  onPress={irSemanaActual}
                  className="text-xs px-2"
                >
                  Hoy
                </Button>
              )}

              <span className="text-sm font-medium text-default-600 min-w-[120px] text-center">
                {obtenerTextoSemana()}
              </span>

              <Button
                size="sm"
                variant="flat"
                isIconOnly
                onPress={irSemanaProxima}
                isDisabled={!config.isAdminModo && semanaActual === 1}
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
        isLoading={isConfirmandoAccion}
      />
    </div>
  );
};