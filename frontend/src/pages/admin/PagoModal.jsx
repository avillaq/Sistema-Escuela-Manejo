import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Divider,
  Chip
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { pagosService } from '@/service/apiService';

export const PagoModal = ({ isOpen, onOpenChange, matricula, onPagoRegistrado }) => {
  const [monto, setMonto] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset form cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setMonto('');
      setErrors({});
    }
  }, [isOpen]);

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};
    const montoNum = parseFloat(monto);

    // Validar monto
    if (!monto || montoNum <= 0) {
      newErrors.monto = 'Debe ingresar un monto válido mayor a 0';
    } else if (montoNum > matricula.saldo_pendiente) {
      newErrors.monto = `El monto no puede ser mayor al saldo pendiente (S/ ${matricula.saldo_pendiente.toFixed(2)})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el monto
  const handleMontoChange = (value) => {
    setMonto(value);

    if (errors.monto) {
      setErrors({ ...errors, monto: '' });
    }
  };

  // Enviar el pago
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const pagoData = {
        id_matricula: matricula.id,
        monto: parseFloat(monto)
      }
      const pagoResult = await pagosService.create(pagoData);
      if (pagoResult.success) {
        onPagoRegistrado(pagoData);
        // Cerrar modal
        onOpenChange(false);
      } else {
        addToast({
          title: "Error al registrar pago",
          description: pagoResult.error || "No se pudo registrar el pago.",
          severity: "danger",
          color: "danger",
        });
        return;
      }
    } catch (error) {
      console.error('Error al registrar pago:', error);
      setErrors({ general: 'Ha ocurrido un error al registrar el pago. Intente nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular nuevo saldo despues del pago
  const nuevoSaldo = matricula.saldo_pendiente - (parseFloat(monto) || 0);
  const montoPago = parseFloat(monto) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      size="md"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:credit-card" width={24} height={24} />
                <span>Registrar Pago</span>
              </div>
              <p className="text-sm text-default-500 font-normal">
                Matrícula #{matricula.id} - {matricula.alumno.nombre} {matricula.alumno.apellidos}
              </p>
            </ModalHeader>

            <ModalBody>
              <div className="space-y-6">
                {/* Información de la matrícula */}
                <div className="p-4 bg-default-50 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon icon="lucide:info" width={16} height={16} />
                    Información de la Matrícula
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-default-500">Categoría:</span>
                      <Chip size="sm" color="primary" variant="flat" className="ml-2">
                        {matricula.categoria}
                      </Chip>
                    </div>
                    <div>
                      <span className="text-default-500">Tipo:</span>
                      <span className="ml-2 capitalize">{matricula.tipo_contratacion.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-default-500">Costo Total:</span>
                      <span className="ml-2 font-medium">S/ {matricula.costo_total.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-default-500">Pagado:</span>
                      <span className="ml-2 font-medium text-success-600">S/ {matricula.pagos_realizados.toFixed(2)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-default-500">Saldo Pendiente:</span>
                      <span className="ml-2 font-semibold text-danger-600">S/ {matricula.saldo_pendiente.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Input del monto */}
                <div className="space-y-4">
                  <Input
                    label="Monto del Pago"
                    placeholder="0.00"
                    type="number"
                    min="0.01"
                    max={matricula.saldo_pendiente}
                    step="0.01"
                    value={monto}
                    onValueChange={handleMontoChange}
                    startContent={<span className="text-default-400 text-small">S/</span>}
                    isRequired
                    isInvalid={!!errors.monto}
                    errorMessage={errors.monto}
                    description={`Máximo: S/ ${matricula.saldo_pendiente.toFixed(2)}`}
                    size="lg"
                  />
                </div>

                {/* Resumen del pago */}
                {montoPago > 0 && (
                  <>
                    <Divider />
                    <div className="p-4 bg-success-50 rounded-lg">
                      <h4 className="font-semibold mb-3 text-success-700 flex items-center gap-2">
                        <Icon icon="lucide:calculator" width={16} height={16} />
                        Resumen del Pago
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Monto a pagar:</span>
                          <span className="font-semibold">S/ {montoPago.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saldo actual:</span>
                          <span>S/ {matricula.saldo_pendiente.toFixed(2)}</span>
                        </div>
                        <Divider />
                        <div className="flex justify-between text-base">
                          <span className="font-medium">Nuevo saldo:</span>
                          <span className={`font-semibold ${nuevoSaldo === 0 ? 'text-success-600' : 'text-danger-600'}`}>
                            S/ {nuevoSaldo.toFixed(2)}
                            {nuevoSaldo === 0 && (
                              <Chip size="sm" color="success" variant="flat" className="ml-2">
                                ¡Pagado completamente!
                              </Chip>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Error general */}
                {errors.general && (
                  <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                    <p className="text-danger-600 text-sm">{errors.general}</p>
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="flat"
                onPress={onClose}
                isDisabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                color="success"
                onPress={handleSubmit}
                isLoading={isLoading}
                isDisabled={!monto || parseFloat(monto) <= 0}
                startContent={!isLoading && <Icon icon="lucide:credit-card" width={16} height={16} />}
              >
                {isLoading ? 'Registrando...' : 'Registrar Pago'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};