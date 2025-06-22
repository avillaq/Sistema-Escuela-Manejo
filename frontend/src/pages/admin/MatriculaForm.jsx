import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem,
  Input,
  addToast,
  Divider,
  Chip
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { alumnosService } from '@/service/apiService';
import { paquetesService } from '@/service/apiService';
import { matriculasService } from '@/service/apiService';
import { pagosService } from '@/service/apiService';

export const MatriculaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    alumno: null,
    categoria: '',
    tipo_contratacion: '',
    paquete: null,
    horas_contratadas: '',
    tarifa_por_hora: '',
    monto_pago: ''
  });
  const [alumnosDisponibles, setAlumnosDisponibles] = useState([]);
  const [paquetesDisponibles, setPaquetesDisponibles] = useState([]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Calcular costo total
  const costoTotal = formData.tipo_contratacion === 'paquete'
    ? formData.paquete?.costo_total || 0
    : (parseFloat(formData.horas_contratadas) || 0) * (parseFloat(formData.tarifa_por_hora) || 0);

  // Cargar usuarios disponibles y paquetes al montar el componente
  useEffect(() => {
    const fetchAlumnosDisponibles = async () => {
      const result = await alumnosService.getSinMatricula();
      if (result.success) {
        setAlumnosDisponibles(result.data);
      } else {
        addToast({
          title: "Error al cargar usuarios",
          description: result.error || "No se pudieron cargar los usuarios.",
          severity: "danger",
          color: "danger",
        });
      }
    }
    const fetchPaquetes = async () => {
      const result = await paquetesService.getAll();
      if (result.success) {
        setPaquetesDisponibles(result.data);
      } else {
        addToast({
          title: "Error al cargar paquetes",
          description: result.error || "No se pudieron cargar los paquetes.",
          severity: "danger",
          color: "danger",
        });
      }
    }
    fetchAlumnosDisponibles();
    fetchPaquetes();
  }, []);


  useEffect(() => {
    if (isEditing) {
      // Cargar datos de la matrícula para editar
      // TODO: Analiza si en el sistema deberá editar una matrícula existente
    }
  }, [id, isEditing]);

  // prevenir el scroll wheel
  const preventWheel = (e) => {
    e.target.blur();
  };

  const handleChange = (field, value) => {
    const numValue = Number(value);
    if (numValue < 0) return; // No negativos

    if (field === "alumno") {
      const selectedAlumno = alumnosDisponibles.find(a => a.id.toString() === value);
      setFormData({ ...formData, alumno: selectedAlumno });
    } else if (field === "paquete") {
      const selectedPaquete = paquetesDisponibles.find(p => p.id.toString() === value);
      setFormData({ ...formData, paquete: selectedPaquete });
    } else if (field === "tipo_contratacion") {
      // Reset campos relacionados cuando cambia el tipo
      setFormData({
        ...formData,
        tipo_contratacion: value,
        paquete: null,
        horas_contratadas: "",
        tarifa_por_hora: ""
      });
    } else if (field === "categoria") {
      // Reset paquete cuando cambia la categoría
      setFormData({
        ...formData,
        categoria: value,
        paquete: null
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar alumno
    if (!formData.alumno) {
      newErrors.alumno = "Debe seleccionar un alumno";
    }

    // Validar categoria
    if (!formData.categoria) {
      newErrors.categoria = "Debe seleccionar una categoría";
    }

    // Validar tipo de contratacion
    if (!formData.tipo_contratacion) {
      newErrors.tipo_contratacion = "Debe seleccionar un tipo de contratación";
    }

    // Validaciones especificas por tipo
    if (formData.tipo_contratacion === "paquete") {
      if (!formData.paquete) {
        newErrors.paquete = "Debe seleccionar un paquete";
      }
      if (formData.categoria === "A-II") {
        newErrors.tipo_contratacion = "Los alumnos A-II solo pueden contratar por horas";
      }
    } else if (formData.tipo_contratacion === "por_hora") {
      if (!formData.horas_contratadas || formData.horas_contratadas <= 0) {
        newErrors.horas_contratadas = "Debe especificar las horas contratadas (minimo 1)";
      }
      if (!formData.tarifa_por_hora || formData.tarifa_por_hora <= 0) {
        newErrors.tarifa_por_hora = "Debe especificar la tarifa por hora (minimo 1.0)";
      }
    }

    // Validar pago inicial
    const montoPago = parseFloat(formData.monto_pago);
    if (!formData.monto_pago || montoPago <= 0) {
      newErrors.monto_pago = "Debe ingresar un monto de pago inicial valido";
    } else if (montoPago > costoTotal) {
      newErrors.monto_pago = "El monto no puede ser mayor al costo total";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Preparar datos para enviar al backend
      const matriculaData = {
        id_alumno: formData.alumno.id,
        categoria: formData.categoria,
        tipo_contratacion: formData.tipo_contratacion,
        ...(formData.tipo_contratacion === 'paquete'
          ? { id_paquete: formData.paquete.id }
          : {
            horas_contratadas: parseInt(formData.horas_contratadas),
            tarifa_por_hora: parseFloat(formData.tarifa_por_hora)
          }
        ),
      };
      console.log('Datos de matrícula:', matriculaData);
      

      const matriculaResult = await matriculasService.create(matriculaData);
      if (matriculaResult.success) {
        console.log('Matrícula creada:', matriculaResult.data);
        const pagoData = {
          id_matricula: matriculaResult.data.id,
          monto: parseFloat(formData.monto_pago)
        }

        const pagoResult = await pagosService.create(pagoData);
        if (pagoResult.success) {
          console.log('Pago registrado:', pagoResult.data);
        } else {
          addToast({
            title: "Error al registrar pago",
            description: pagoResult.error || "No se pudo registrar el pago.",
            severity: "danger",
            color: "danger",
          });
          return;
        }
      } else {
        addToast({
          title: "Error al crear matrícula",
          description: matriculaResult.error || "No se pudo crear la matrícula.",
          severity: "danger",
          color: "danger",
        });
        return;
      }

      addToast({
        title: isEditing ? "Matrícula actualizada" : "Matrícula creada",
        description: `La matrícula para ${formData.alumno.nombre} ${formData.alumno.apellidos} ha sido ${isEditing ? 'actualizada' : 'creada'} correctamente.`,
        severity: "success",
        color: "success",
      });

      navigate('/matriculas');
    } catch (error) {
      console.log('Error al procesar matrícula:', error);
      
      addToast({
        title: "Error",
        description: "Ha ocurrido un error al procesar la matrícula.",
        severity: "danger",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate('/matriculas')}
        >
          <Icon icon="lucide:arrow-left" width={20} height={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Matrícula' : 'Nueva Matrícula'}
          </h1>
          <p className="text-default-500">
            {isEditing ? 'Modifica los datos de la matrícula' : 'Completa la información para crear una nueva matrícula'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selección de Alumno */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:user" width={20} height={20} />
                <h3 className="text-lg font-semibold">Información del Alumno</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <Select
                label="Alumno"
                placeholder="Seleccione un alumno"
                selectedKeys={formData.alumno ? [formData.alumno.id.toString()] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0];
                  handleChange('alumno', selectedKey);
                }}
                isRequired
                isInvalid={!!errors.alumno}
                errorMessage={errors.alumno}
                isDisabled={isEditing}
              >
                {alumnosDisponibles.filter(a => a.activo).map((alumno) => (
                  <SelectItem key={alumno.id.toString()} textValue={`${alumno.nombre} ${alumno.apellidos} (DNI: ${alumno.dni})`}>
                    {alumno.nombre} {alumno.apellidos} (DNI: {alumno.dni})
                  </SelectItem>
                ))}
              </Select>
            </CardBody>
          </Card>

          {/* Información de la Matrícula */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:graduation-cap" width={20} height={20} />
                <h3 className="text-lg font-semibold">Información de la Matrícula</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <Select
                label="Categoría"
                placeholder="Seleccione la categoría"
                selectedKeys={formData.categoria ? [formData.categoria] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0];
                  handleChange('categoria', selectedKey);
                }}
                isRequired
                isInvalid={!!errors.categoria}
                errorMessage={errors.categoria}
              >
                <SelectItem key="A-I" value="A-I">A-I</SelectItem>
                <SelectItem key="A-II" value="A-II">A-II</SelectItem>
              </Select>

              <Select
                label="Tipo de Contratación"
                placeholder="Seleccione el tipo"
                selectedKeys={formData.tipo_contratacion ? [formData.tipo_contratacion] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0];
                  handleChange('tipo_contratacion', selectedKey);
                }}
                isRequired
                isInvalid={!!errors.tipo_contratacion}
                errorMessage={errors.tipo_contratacion}
              >
                <SelectItem key="paquete" value="paquete">Paquete (Solo A-I)</SelectItem>
                <SelectItem key="por_hora" value="por_hora">Por Horas</SelectItem>
              </Select>

              {/* Campos específicos por tipo */}
              {formData.tipo_contratacion === 'paquete' && (
                <Select
                  label="Paquete"
                  placeholder="Seleccione un paquete"
                  selectedKeys={formData.paquete ? [formData.paquete.id.toString()] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    handleChange('paquete', selectedKey);
                  }}
                  isRequired
                  isInvalid={!!errors.paquete}
                  errorMessage={errors.paquete}
                  isDisabled={!formData.categoria}
                >
                  {paquetesDisponibles.map((paquete) => (
                    <SelectItem key={paquete.id} textValue={`${paquete.nombre} - ${paquete.tipo_auto.tipo} (${paquete.horas_total}h - S/ ${paquete.costo_total})`}>
                      {paquete.nombre} - {paquete.tipo_auto.tipo} ({paquete.horas_total}h - S/ {paquete.costo_total})
                    </SelectItem>
                  ))}
                </Select>
              )}

              {formData.tipo_contratacion === 'por_hora' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Horas Contratadas"
                    placeholder="Ej: 10"
                    type="number"
                    min="1"
                    value={formData.horas_contratadas}
                    onValueChange={(value) => handleChange('horas_contratadas', value)}
                    onWheel={preventWheel}
                    isRequired
                    isInvalid={!!errors.horas_contratadas}
                    errorMessage={errors.horas_contratadas}
                  />
                  <Input
                    label="Tarifa por Hora"
                    placeholder="Ej: 48.00"
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.tarifa_por_hora}
                    onValueChange={(value) => handleChange('tarifa_por_hora', value)}
                    onWheel={preventWheel}
                    startContent={<span className="text-default-400">S/</span>}
                    isRequired
                    isInvalid={!!errors.tarifa_por_hora}
                    errorMessage={errors.tarifa_por_hora}
                  />
                </div>
              )}
            </CardBody>
          </Card>

          {/* Pago Inicial */}
          {costoTotal > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:credit-card" width={20} height={20} />
                  <h3 className="text-lg font-semibold">Pago Inicial</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="Monto del Pago"
                  placeholder={`Máximo: S/ ${costoTotal.toFixed(2)}`}
                  type="number"
                  min="0.01"
                  max={costoTotal}
                  step="0.01"
                  value={formData.monto_pago}
                  onValueChange={(value) => handleChange('monto_pago', value)}
                  onWheel={preventWheel}
                  startContent={<span className="text-default-400">S/</span>}
                  isRequired
                  isInvalid={!!errors.monto_pago}
                  errorMessage={errors.monto_pago}
                />
              </CardBody>
            </Card>
          )}
        </div>

        {/* Resumen */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <h3 className="text-lg font-semibold">Resumen</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {formData.alumno && (
                <div>
                  <h4 className="font-medium text-sm text-default-600 mb-2">Alumno</h4>
                  <p className="font-medium">{formData.alumno.nombre} {formData.alumno.apellidos}</p>
                  <p className="text-sm text-default-500">DNI: {formData.alumno.dni}</p>
                </div>
              )}

              {formData.categoria && (
                <div>
                  <h4 className="font-medium text-sm text-default-600 mb-2">Categoría</h4>
                  <Chip size="sm" color="primary" variant="flat">{formData.categoria}</Chip>
                </div>
              )}

              {formData.tipo_contratacion && (
                <div>
                  <h4 className="font-medium text-sm text-default-600 mb-2">Tipo de Contratación</h4>
                  <p className="capitalize">{formData.tipo_contratacion.replace('_', ' ')}</p>
                </div>
              )}

              {formData.paquete && (
                <div>
                  <h4 className="font-medium text-sm text-default-600 mb-2">Paquete</h4>
                  <p className="font-medium">{formData.paquete.nombre}</p>
                  <p className="text-sm text-default-500">
                    {formData.paquete.tipo_auto.tipo} • {formData.paquete.horas_total} horas
                  </p>
                </div>
              )}

              {formData.tipo_contratacion === 'por_hora' && formData.horas_contratadas && formData.tarifa_por_hora && (
                <div>
                  <h4 className="font-medium text-sm text-default-600 mb-2">Contratación por Horas</h4>
                  <p>{formData.horas_contratadas} horas × S/ {formData.tarifa_por_hora}</p>
                </div>
              )}

              {costoTotal > 0 && (
                <>
                  <Divider />
                  <div>
                    <h4 className="font-medium text-sm text-default-600 mb-2">Costo Total</h4>
                    <p className="text-xl font-bold text-primary">S/ {costoTotal.toFixed(2)}</p>
                  </div>

                  {formData.monto_pago && (
                    <div>
                      <h4 className="font-medium text-sm text-default-600 mb-2">Pago Inicial</h4>
                      <p className="font-medium text-success-600">S/ {parseFloat(formData.monto_pago || 0).toFixed(2)}</p>
                      <p className="text-sm text-danger-500">
                        Saldo: S/ {(costoTotal - parseFloat(formData.monto_pago || 0)).toFixed(2)}
                      </p>
                    </div>
                  )}
                </>
              )}

              <Divider />

              <div className="flex gap-2">
                <Button
                  variant="flat"
                  onPress={() => navigate('/matriculas')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  isDisabled={!costoTotal || !formData.monto_pago}
                  className="flex-1"
                >
                  {isEditing ? 'Actualizar' : 'Crear Matrícula'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};