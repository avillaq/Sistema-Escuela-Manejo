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
  SelectItem
} from '@heroui/react';


const DataTipoAuto = [{
  id: 1,
  tipo: "Mecánico"

},
{
  id: 2,
  tipo: "Automático"
}
]
export const PaqueteFormModal = ({
  isOpen,
  onOpenChange,
  onAddPaquete,
  editMode = false,
  dataInicial,
  tipo = "Paquete",
  service,

}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    id_tipo_auto: '',
    horas_total: '',
    costo_total: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editMode && dataInicial) {
      setFormData({
        nombre: dataInicial.nombre,
        id_tipo_auto: String(dataInicial.id_tipo_auto),
        horas_total: String(dataInicial.horas_total),
        costo_total: String(dataInicial.costo_total)
      });
    } else {
      resetForm();
    }
  }, [editMode, dataInicial, isOpen]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validarForm = () => {
    const newErrors = {};
    const opcionesValidas = ['basico', 'intermedio', 'avanzado', 'por_hora'];

    if (!formData.nombre || !opcionesValidas.includes(formData.nombre)) {
      newErrors.nombre = 'Nombre debe ser: basico, intermedio, avanzado o por_hora';
    }
    if (!formData.id_tipo_auto) {
      newErrors.id_tipo_auto = 'Debe seleccionar un tipo de auto';
    }
    if (!formData.horas_total || isNaN(formData.horas_total) || Number(formData.horas_total) < 1) {
      newErrors.horas_total = 'Horas totales debe ser al menos 1';
    }
    if (!formData.costo_total || isNaN(formData.costo_total) || Number(formData.costo_total) < 1) {
      newErrors.costo_total = 'Costo total debe ser al menos 1 sol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!validarForm()) {
      setIsLoading(false);
      return;
    }

    const dataEnviar = {
      ...formData,
      horas_total: Number(formData.horas_total),
      costo_total: parseFloat(formData.costo_total),
      id_tipo_auto: Number(formData.id_tipo_auto)
    };
    let result;
    if (editMode && dataInicial) {
      result = await service.update(dataInicial.id, dataEnviar);
    } else

      if (result.success) {
        onAddPaquete(result.data || dataEnviar);
        onOpenChange(false);
      } else {
        alert(result.message || 'Ocurrió un error');
      }

    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      id_tipo_auto: '',
      horas_total: '',
      costo_total: ''
    });
    setErrors({});
    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {editMode ? `Editar ${tipo}` : `Añadir Nuevo ${tipo}`}
            </ModalHeader>
            <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Nombre del Paquete"
                selectedKeys={formData.nombre ? [formData.nombre] : []}
                onSelectionChange={(keys) => handleChange('nombre', Array.from(keys)[0])}
                isRequired
                isInvalid={!!errors.nombre}
                errorMessage={errors.nombre}
              >
                {['basico', 'intermedio', 'avanzado'].map((tipo) => (
                  <SelectItem key={tipo}>
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Tipo de Auto"
                selectedKeys={formData.id_tipo_auto ? [formData.id_tipo_auto] : []}
                onSelectionChange={(keys) => handleChange('id_tipo_auto', Array.from(keys)[0])}
                isRequired
                isInvalid={!!errors.id_tipo_auto}
                errorMessage={errors.id_tipo_auto}
              >
                {DataTipoAuto.map((auto) => (
                  <SelectItem key={auto.id} textValue={auto.tipo}>
                    {auto.tipo}
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Horas Totales"
                type="number"
                placeholder="Ej. 10"
                value={formData.horas_total}
                onValueChange={(value) => handleChange('horas_total', value)}
                isRequired
                isInvalid={!!errors.horas_total}
                errorMessage={errors.horas_total}
              />
              <Input
                label="Costo Total (S/.)"
                type="number"
                placeholder="Ej. 150"
                value={formData.costo_total}
                onValueChange={(value) => handleChange('costo_total', value)}
                isRequired
                isInvalid={!!errors.costo_total}
                errorMessage={errors.costo_total}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>Cancelar</Button>
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
