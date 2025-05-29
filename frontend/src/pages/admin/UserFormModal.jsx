import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Checkbox
} from '@heroui/react';

export const UserFormModal = ({
  isOpen,
  onOpenChange,
  onAddUser,
  editMode = false,
  initialData
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    dni: '',
    genero: 'No especificado',
    activo: true,
    departamento: 'IT'
  });

  const [errors, setErrors] = useState({});

  // Initialize form with data if in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        nombre: initialData.nombre,
        apellidos: initialData.apellidos,
        dni: initialData.dni,
        genero: initialData.genero,
        activo: initialData.activo,
        departamento: initialData.departamento
      });
    } else {
      resetForm();
    }
  }, [editMode, initialData, isOpen]);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });

    // Clear error when field is edited
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!/^\d{8}[A-Za-z]$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener 8 números y una letra';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (editMode && initialData) {
        // Update existing user
        const updatedUser = {
          ...initialData,
          ...formData
        };
        onAddUser(updatedUser);
      } else {
        // Add new user
        onAddUser(formData);
      }
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellidos: '',
      dni: '',
      genero: 'No especificado',
      activo: true,
      departamento: 'IT'
    });
    setErrors({});
  };

  useEffect(() => {
    if (!isOpen && !editMode) {
      resetForm();
    }
  }, [isOpen, editMode]);

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
              {editMode ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  placeholder="Ingrese el nombre"
                  value={formData.nombre}
                  onValueChange={(value) => handleChange('nombre', value)}
                  isRequired
                  isInvalid={!!errors.nombre}
                  errorMessage={errors.nombre}
                />

                <Input
                  label="Apellidos"
                  placeholder="Ingrese los apellidos"
                  value={formData.apellidos}
                  onValueChange={(value) => handleChange('apellidos', value)}
                  isRequired
                  isInvalid={!!errors.apellidos}
                  errorMessage={errors.apellidos}
                />

                <Input
                  label="DNI"
                  placeholder="Formato: 12345678A"
                  value={formData.dni}
                  onValueChange={(value) => handleChange('dni', value)}
                  isRequired
                  isInvalid={!!errors.dni}
                  errorMessage={errors.dni}
                />

                <Select
                  label="Género"
                  placeholder="Seleccione el género"
                  selectedKeys={[formData.genero]}
                  onChange={(e) => handleChange('genero', e.target.value)}
                >
                  <SelectItem key="Masculino" value="Masculino">Masculino</SelectItem>
                  <SelectItem key="Femenino" value="Femenino">Femenino</SelectItem>
                  <SelectItem key="No especificado" value="No especificado">No especificado</SelectItem>
                </Select>

                <Select
                  label="Departamento"
                  placeholder="Seleccione el departamento"
                  selectedKeys={[formData.departamento]}
                  onChange={(e) => handleChange('departamento', e.target.value)}
                  className="md:col-span-2"
                >
                  <SelectItem key="IT" value="IT">IT</SelectItem>
                  <SelectItem key="Ventas" value="Ventas">Ventas</SelectItem>
                  <SelectItem key="Marketing" value="Marketing">Marketing</SelectItem>
                  <SelectItem key="Recursos Humanos" value="Recursos Humanos">Recursos Humanos</SelectItem>
                  <SelectItem key="Finanzas" value="Finanzas">Finanzas</SelectItem>
                </Select>

                <div className="md:col-span-2">
                  <Checkbox
                    isSelected={formData.activo}
                    onValueChange={(value) => handleChange('activo', value)}
                  >
                    Usuario Activo
                  </Checkbox>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                {editMode ? 'Actualizar' : 'Guardar'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};