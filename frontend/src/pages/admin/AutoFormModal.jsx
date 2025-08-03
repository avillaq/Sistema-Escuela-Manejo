// AutoFormModal.jsx
import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  Select,
  SelectItem,
  addToast
} from '@heroui/react';
const tiposAuto = [
    {
      id: 1,
      tipo: "Mecánico"
    },
    {
      id: 2,
      tipo: "Automático"
    }
  ]
export const AutoFormModal = ({ isOpen, onOpenChange, onAddAuto, editMode = false, dataInicial, tipo = "Auto", service }) => {
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    color: '',
    id_tipo_auto: '',
    activo: true,
    tipo_auto: {},
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Se inicializa el formulario con datos por defecto
  useEffect(() => {
    if (editMode && dataInicial) {
      setFormData({
        placa: dataInicial.placa,
        marca: dataInicial.marca,
        modelo: dataInicial.modelo,
        color: dataInicial.color,
        id_tipo_auto: dataInicial.id_tipo_auto,
        tipo_auto: dataInicial.tipo_auto,
        activo: dataInicial.activo,
      });
    } else {
      resetForm();
    }
  }, [editMode, dataInicial, isOpen]);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validarForm = () => {
    const newErrors = {};

    if (!formData.placa.trim()) {
      newErrors.placa = 'La placa es obligatoria';
    }

    if (!formData.marca.trim()) {
      newErrors.marca = 'La marca es obligatoria';
    }

    if (!formData.modelo.trim()) {
      newErrors.modelo = 'El modelo es obligatorio';
    }

    if (!formData.color.trim()) {
      newErrors.color = 'El color es obligatorio';
    }

    if (!formData.id_tipo_auto) {
      newErrors.id_tipo_auto = 'El tipo de auto es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (validarForm()) {

      let dataEnviar = { ...formData };
      delete dataEnviar.tipo_auto;
      if (editMode && dataInicial) {
        // Actualizar auto existente
        delete dataEnviar.placa;
        const result = await service.update(dataInicial.id, dataEnviar);
        if (result.success) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            ...result.data,
          }));
          onOpenChange(false);
        } else {
          addToast({
            title: "Error al actualizar auto",
            description: result.error,
            severity: "danger",
            color: "danger",
          });
        }
        const updatedAuto = {
          ...dataInicial,
          ...formData,
        };
        onAddAuto(updatedAuto);
      } else {
        // Añadir nuevo auto - crear objeto sin 'activo'
        delete dataEnviar.activo;
        const result = await service.create(dataEnviar);
        if (result.success) {
          onAddAuto(result.data);
          onOpenChange(false);
        } else {
          addToast({
          title: "Error al añadir auto",
          description: result.error,
          severity: "danger",
          color: "danger",
          });
        }
      }
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      placa: '',
      marca: '',
      modelo: '',
      color: '',
      id_tipo_auto: '',
      activo: true,
      tipo_auto: {},
    });
    setErrors({});
    setIsLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      size="lg"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {editMode ? `Editar ${tipo}` : `Añadir Nuevo ${tipo}`}
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Placa"
                  placeholder="Ingrese la placa"
                  value={formData.placa}
                  onValueChange={(value) => handleChange('placa', value)}
                  isRequired
                  isInvalid={!!errors.placa}
                  errorMessage={errors.placa}
                  isDisabled={editMode}
                />

                <Input
                  label="Marca"
                  placeholder="Ingrese la marca"
                  value={formData.marca}
                  onValueChange={(value) => handleChange('marca', value)}
                  isRequired
                  isInvalid={!!errors.marca}
                  errorMessage={errors.marca}
                />

                <Input
                  label="Modelo"
                  placeholder="Ingrese el modelo"
                  value={formData.modelo}
                  onValueChange={(value) => handleChange('modelo', value)}
                  isRequired
                  isInvalid={!!errors.modelo}
                  errorMessage={errors.modelo}
                />

                <Input
                  label="Color"
                  placeholder="Ingrese el color"
                  value={formData.color}
                  onValueChange={(value) => handleChange('color', value)}
                  isRequired
                  isInvalid={!!errors.color}
                  errorMessage={errors.color}
                />

                <Select
                  label="Tipo de Auto"
                  placeholder="Seleccione un tipo"
                  selectedKeys={formData.id_tipo_auto ? [formData.id_tipo_auto.toString()] : []}
                  onSelectionChange={(keys) => {
                    const selected = [...keys][0];
                    handleChange('id_tipo_auto', selected ? parseInt(selected) : '');
                  }}
                  isRequired
                  isInvalid={!!errors.id_tipo_auto}
                  errorMessage={errors.id_tipo_auto}
                  className="md:col-span-2"
                >
                  {tiposAuto.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.tipo}
                    </SelectItem>
                  ))}
                </Select>

                {editMode && (
                  <div className="md:col-span-2">
                    <Checkbox
                      isSelected={formData.activo}
                      onValueChange={(value) => handleChange('activo', value)}
                    >
                      {`${tipo} Activo`}
                    </Checkbox>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="primary" onPress={handleSubmit} isLoading={isLoading}>
                {editMode ? 'Actualizar' : 'Guardar'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};