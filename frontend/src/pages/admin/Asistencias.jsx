import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Switch,
  addToast,
  Chip,
  Divider,
  Autocomplete,
  AutocompleteItem
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { reservasService, asistenciasService, instructoresService, autosService } from '@/service/apiService';

export const Asistencias = () => {
  // Estados principales
  const [reservasActuales, setReservasActuales] = useState([]);
  const [reservasHoy, setReservasHoy] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [autos, setAutos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    id_reserva: '',
    asistio: true,
    id_instructor: '',
    id_auto: ''
  });

  // Estados de validación
  const [errors, setErrors] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [reservasActualesResult, reservasResult, instructoresResult, autosResult] = await Promise.all([
          reservasService.getActuales(),
          reservasService.getHoy(),
          instructoresService.getAll(),
          autosService.getAll()
        ]);

        if (reservasActualesResult.success) {
          setReservasActuales(reservasActualesResult.data);
        } else {
          addToast({
            title: "Error al cargar reservas actuales",
            description: reservasActualesResult.error || "No se pudieron cargar las reservas actuales.",
            severity: "danger",
            color: "danger",
          });
        }

        if (reservasResult.success) {
          setReservasHoy(reservasResult.data);
        } else {
          addToast({
            title: "Error al cargar reservas",
            description: reservasResult.error || "No se pudieron cargar las reservas de hoy.",
            severity: "danger",
            color: "danger",
          });
        }

        if (instructoresResult.success) {
          setInstructores(instructoresResult.data.filter(instructor => instructor.activo));
        } else {
          addToast({
            title: "Error al cargar instructores",
            description: instructoresResult.error || "No se pudieron cargar los instructores.",
            severity: "danger",
            color: "danger",
          });
        }

        if (autosResult.success) {
          // Filtrar solo autos activos
          setAutos(autosResult.data.filter(auto => auto.activo));
        } else {
          addToast({
            title: "Error al cargar autos",
            description: autosResult.error || "No se pudieron cargar los autos.",
            severity: "danger",
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "Ha ocurrido un error al cargar los datos.",
          severity: "danger",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Formatear hora para mostrar
  const formatearHora = (hora) => {
    return hora.slice(0, 5); // HH:MM
  };

  // Preparar datos para los Autocomplete
  const reservasParaAutocomplete = useMemo(() => {
    return reservasActuales
      .filter(reserva => !reserva.asistencia?.id)
      .map(reserva => ({
        key: reserva.id.toString(),
        label: `${reserva.matricula?.alumno?.nombre} ${reserva.matricula?.alumno?.apellidos}`,
        description: `DNI: ${reserva.matricula?.alumno?.dni} • ${formatearHora(reserva.bloque?.hora_inicio)} - ${formatearHora(reserva.bloque?.hora_fin)}`,
        data: reserva
      }));
  }, [reservasActuales]);

  const instructoresParaAutocomplete = useMemo(() => {
    return instructores.map(instructor => ({
      key: instructor.id.toString(),
      label: `${instructor.nombre} ${instructor.apellidos}`,
      description: `DNI: ${instructor.dni}`,
      data: instructor
    }));
  }, [instructores]);

  const autosParaAutocomplete = useMemo(() => {
    return autos.map(auto => ({
      key: auto.id.toString(),
      label: auto.placa,
      description: `${auto.marca} ${auto.modelo} • ${auto.color}`,
      data: auto
    }));
  }, [autos]);

  // Obtener información de la reserva seleccionada
  const reservaSeleccionada = useMemo(() => {
    return reservasActuales.find(r => r.id.toString() === formData.id_reserva);
  }, [reservasActuales, formData.id_reserva]);

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar errores al cambiar valores
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Si cambia a "no asistió", limpiar instructor y auto
    if (field === 'asistio' && !value) {
      setFormData(prev => ({
        ...prev,
        id_instructor: '',
        id_auto: ''
      }));
    }
  };

  // Validar formulario
  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.id_reserva) {
      newErrors.id_reserva = 'Debe seleccionar una reserva';
    }

    if (formData.asistio) {
      if (!formData.id_instructor) {
        newErrors.id_instructor = 'Debe seleccionar un instructor';
      }
      if (!formData.id_auto) {
        newErrors.id_auto = 'Debe seleccionar un auto';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    setIsSubmitting(true);
    try {
      const dataEnviar = {
        id_reserva: parseInt(formData.id_reserva),
        asistio: formData.asistio,
        ...(formData.asistio && {
          id_instructor: parseInt(formData.id_instructor),
          id_auto: parseInt(formData.id_auto)
        })
      };

      const result = await asistenciasService.create(dataEnviar);

      if (result.success) {
        const mensaje = formData.asistio
          ? `Asistencia registrada correctamente. ${result.data.ticket ? `Ticket #${result.data.ticket.id} generado.` : ''}`
          : 'Falta registrada correctamente.';

        addToast({
          title: "Asistencia registrada",
          description: mensaje,
          severity: "success",
          color: "success",
        });

        // Resetear formulario
        setFormData({
          id_reserva: '',
          asistio: true,
          id_instructor: '',
          id_auto: ''
        });

        // Recargar reservas para actualizar la lista
        const [reservasActualesResult, reservasHoyResult] = await Promise.all([
          reservasService.getActuales(),
          reservasService.getHoy()
        ]);

        if (reservasActualesResult.success) {
          setReservasActuales(reservasActualesResult.data);
        }

        if (reservasHoyResult.success) {
          setReservasHoy(reservasHoyResult.data);
        }

      } else {
        addToast({
          title: "Error al registrar asistencia",
          description: result.error || "No se pudo registrar la asistencia.",
          severity: "danger",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Ha ocurrido un error al registrar la asistencia.",
        severity: "danger",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear formulario
  const handleReset = () => {
    setFormData({
      id_reserva: '',
      asistio: true,
      id_instructor: '',
      id_auto: ''
    });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Registro de Asistencias"
        subtitle="Gestiona las asistencias de las clases programadas para hoy."
        emoji=""
      />

      {/* Estadísticas del día */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon="lucide:clock"
          title="Disponibles para Registro"
          value={reservasActuales.filter(r => !r.asistencia?.id).length || 0}
          subtitle="Con tolerancia de 15 min"
          color="warning"
          size="large"
        />
        <StatCard
          icon="lucide:check"
          title="Asistencias Hoy"
          value={reservasHoy.filter(r => r.asistencia?.asistio === true).length || 0}
          subtitle="Clases completadas"
          color="success"
          size="large"
        />
        <StatCard
          icon="lucide:user-x"
          title="Faltas Hoy"
          value={reservasHoy.filter(r => r.asistencia?.asistio === false).length || 0}
          subtitle="No asistieron"
          color="danger"
          size="large"
        />
      </div>

      {!isLoading && reservasActuales.length === 0 && (
        <Card className="border-info-200 bg-info-50">
          <CardBody className="py-3">
            <div className="flex items-center gap-2 text-info-700">
              <Icon icon="lucide:info" width={16} height={16} />
              <p className="text-sm">
                <strong>No hay clases disponibles para registro.</strong>
                {reservasHoy.length > 0
                  ? ` Se registraron ${reservasHoy.filter(r => r.asistencia?.id).length} de ${reservasHoy.length} clases de hoy.`
                  : " No hay reservas programadas para hoy."
                }
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de registro */}

        {isLoading ?
          (
            <div className='col-span-3'>
              <LoadingSpinner mensaje="Cargando datos..." />
            </div>
          )
          :
          (<><div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:clipboard-check" width={20} height={20} />
                    <h3 className="text-lg font-semibold">Registrar Asistencia</h3>
                  </div>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={handleReset}
                    startContent={<Icon icon="lucide:refresh-cw" width={14} height={14} />}
                  >
                    Limpiar
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Selección de reserva */}
                <div className="space-y-3">
                  <Autocomplete
                    label="Reserva Disponible"
                    placeholder="Buscar reserva por alumno, DNI o horario..."
                    defaultItems={reservasParaAutocomplete}
                    selectedKey={formData.id_reserva}
                    onSelectionChange={(key) => handleChange('id_reserva', key || '')}
                    isRequired
                    isInvalid={!!errors.id_reserva}
                    errorMessage={errors.id_reserva}
                    listboxProps={{
                      emptyContent: "No hay reservas disponibles desde la hora actual",
                    }}
                    startContent={<Icon icon="lucide:calendar" className="text-default-400" width={16} height={16} />}
                  >
                    {(item) => (
                      <AutocompleteItem key={item.key} textValue={item.label}>
                        <div className="flex justify-between items-center w-full">
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-xs text-default-500">{item.description}</p>
                          </div>
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                </div>

                <Divider />

                {/* Switch de asistencia */}
                <div className="flex items-center justify-between p-4 bg-default-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">¿El alumno asistió a la clase?</h4>
                    <p className="text-sm text-default-500">
                      Si no asistió, no es necesario asignar instructor y auto
                    </p>
                  </div>
                  <Switch
                    isSelected={formData.asistio}
                    onValueChange={(value) => handleChange('asistio', value)}
                    color="success"
                    size="lg"
                    thumbIcon={({ isSelected }) =>
                      isSelected ? (
                        <Icon icon="lucide:check" width={16} height={16} />
                      ) : (
                        <Icon icon="lucide:x" width={16} height={16} />
                      )
                    }
                  >
                    {formData.asistio ? "Sí asistió" : "No asistió"}
                  </Switch>
                </div>

                {/* Instructor y Auto (solo si asistió) */}
                {formData.asistio && (
                  <div className="space-y-4">
                    <Divider />

                    {/* Selección de instructor */}
                    <div className="space-y-3">
                      <Autocomplete
                        label="Instructor Asignado"
                        placeholder="Buscar instructor por nombre, apellidos o DNI..."
                        defaultItems={instructoresParaAutocomplete}
                        selectedKey={formData.id_instructor}
                        onSelectionChange={(key) => handleChange('id_instructor', key || '')}
                        isRequired={formData.asistio}
                        isInvalid={!!errors.id_instructor}
                        errorMessage={errors.id_instructor}
                        listboxProps={{
                          emptyContent: "No hay instructores disponibles",
                        }}
                        startContent={<Icon icon="lucide:user-check" className="text-default-400" width={16} height={16} />}
                      >
                        {(item) => (
                          <AutocompleteItem key={item.key} textValue={item.label}>
                            <div>
                              <p className="font-medium">{item.label}</p>
                              <p className="text-xs text-default-500">{item.description}</p>
                            </div>
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                    </div>

                    {/* Selección de auto */}
                    <div className="space-y-3">
                      <Autocomplete
                        label="Auto Asignado"
                        placeholder="Buscar auto por placa, marca o modelo..."
                        defaultItems={autosParaAutocomplete}
                        selectedKey={formData.id_auto}
                        onSelectionChange={(key) => handleChange('id_auto', key || '')}
                        isRequired={formData.asistio}
                        isInvalid={!!errors.id_auto}
                        errorMessage={errors.id_auto}
                        listboxProps={{
                          emptyContent: "No hay autos disponibles",
                        }}
                        startContent={<Icon icon="lucide:car" className="text-default-400" width={16} height={16} />}
                      >
                        {(item) => (
                          <AutocompleteItem key={item.key} textValue={item.label}>
                            <div>
                              <p className="font-medium">{item.label}</p>
                              <p className="text-xs text-default-500">{item.description}</p>
                            </div>
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                    </div>
                  </div>
                )}

                <Divider />

                {/* Botón de envío */}
                <Button
                  color={formData.asistio ? "success" : "warning"}
                  size="lg"
                  className="w-full"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  startContent={
                    formData.asistio ?
                      <Icon icon="lucide:check-circle" width={20} height={20} /> :
                      <Icon icon="lucide:x-circle" width={20} height={20} />
                  }
                >
                  {isSubmitting
                    ? "Registrando..."
                    : formData.asistio
                      ? "Registrar Asistencia"
                      : "Registrar Falta"
                  }
                </Button>
              </CardBody>
            </Card>
          </div>
            {/* Panel de información */}
            <div className="space-y-4">
              {/* Información de la reserva seleccionada */}
              {reservaSeleccionada && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:info" width={18} height={18} />
                      <h4 className="font-semibold">Detalles de la Reserva</h4>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <div>
                      <p className="text-sm text-default-500">Alumno</p>
                      <p className="font-medium">
                        {reservaSeleccionada.matricula?.alumno?.nombre} {reservaSeleccionada.matricula?.alumno?.apellidos}
                      </p>
                      <p className="text-xs text-default-500">
                        DNI: {reservaSeleccionada.matricula?.alumno?.dni}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-default-500">Horario</p>
                      <p className="font-medium">
                        {formatearHora(reservaSeleccionada.bloque?.hora_inicio)} - {formatearHora(reservaSeleccionada.bloque?.hora_fin)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-default-500">Categoría</p>
                      <Chip size="sm" color="primary" variant="flat">
                        {reservaSeleccionada.matricula?.categoria}
                      </Chip>
                    </div>

                    <div>
                      <p className="text-sm text-default-500">Progreso</p>
                      <p className="text-sm">
                        {reservaSeleccionada.matricula?.horas_completadas || 0} horas completadas
                      </p>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Ayuda */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:help-circle" width={18} height={18} />
                    <h4 className="font-semibold">Ayuda</h4>
                  </div>
                </CardHeader>
                <CardBody className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon icon="lucide:clock" className="text-warning-500 mt-0.5" width={14} height={14} />
                      <p className="text-xs text-default-600">
                        <strong>Tolerancia:</strong> 15 minutos después del inicio de clase para registrar asistencia
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon icon="lucide:check" className="text-success-500 mt-0.5" width={14} height={14} />
                      <p className="text-xs text-default-600">
                        Si el alumno <strong>asiste</strong>, se genera un ticket automáticamente
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon icon="lucide:x" className="text-danger-500 mt-0.5" width={14} height={14} />
                      <p className="text-xs text-default-600">
                        Si el alumno <strong>no asiste</strong>, no es necesario asignar instructor ni auto
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </>)
        }
      </div>
    </div>
  );
};