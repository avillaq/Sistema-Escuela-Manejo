import { Card, CardBody, CardHeader, Progress, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';

export const FinancialCard = ({ matricula, estadisticas }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="lucide:credit-card" width={20} height={20} />
          <h3 className="text-lg font-semibold">Estado de Pagos</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <div>
          <p className="text-sm text-default-500 mb-1">Costo Total</p>
          <p className="text-2xl font-bold">S/ {matricula.costo_total.toFixed(2)}</p>
        </div>

        <Divider />

        <div>
          <p className="text-sm text-default-500 mb-1">Monto Pagado</p>
          <p className="text-lg font-semibold text-success-600">
            S/ {matricula.pagos_realizados.toFixed(2)}
          </p>
        </div>

        {matricula.saldo_pendiente > 0 && (
          <div>
            <p className="text-sm text-default-500 mb-1">Saldo Pendiente</p>
            <p className="text-lg font-semibold text-danger-600">
              S/ {matricula.saldo_pendiente.toFixed(2)}
            </p>
          </div>
        )}

        {/* Progreso de pagos */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progreso de Pagos</span>
            <span className="text-sm text-default-500">
              {estadisticas.progresoPago}%
            </span>
          </div>
          <Progress
            value={estadisticas.progresoPago}
            color="success"
            className="w-full"
            aria-label="Progreso de Pagos"
          />
        </div>

        {matricula.saldo_pendiente > 0 && (
          <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <div className="flex items-center gap-2 text-warning-700">
              <Icon icon="lucide:alert-triangle" width={16} height={16} />
              <p className="text-sm font-medium">Pago Pendiente</p>
            </div>
            <p className="text-xs text-warning-600 mt-1">
              Contacta con administración para completar tu pago
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
