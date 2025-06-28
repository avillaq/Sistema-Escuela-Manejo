import { Card, CardBody, CardHeader, Chip, Progress, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';

export const MatriculaCard = ({ 
  matricula, 
  estadisticas, 
  getEstadoClasesColor, 
  getEstadoPagoColor 
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon icon="lucide:graduation-cap" width={20} height={20} />
          <h3 className="text-lg font-semibold">Mi Matrícula</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-default-500">Categoría</p>
            <Chip color="primary" variant="flat">{matricula.categoria}</Chip>
          </div>
          <div>
            <p className="text-sm text-default-500">Fecha de Matrícula</p>
            <p className="font-medium">
              {new Date(matricula.fecha_matricula).toLocaleDateString('es-PE')}
            </p>
          </div>
          <div>
            <p className="text-sm text-default-500">Estado de Clases</p>
            <Chip
              color={getEstadoClasesColor(matricula.estado_clases)}
              variant="flat"
            >
              {matricula.estado_clases.charAt(0).toUpperCase() + 
               matricula.estado_clases.slice(1).replace('_', ' ')}
            </Chip>
          </div>
          <div>
            <p className="text-sm text-default-500">Estado de Pago</p>
            <Chip
              color={getEstadoPagoColor(matricula.estado_pago)}
              variant="flat"
            >
              {matricula.estado_pago.charAt(0).toUpperCase() + 
               matricula.estado_pago.slice(1)}
            </Chip>
          </div>
        </div>

        <Divider />

        {/* Información del paquete */}
        {matricula.tipo_contratacion === 'paquete' && matricula.paquete ? (
          <div>
            <h4 className="font-semibold mb-3">Tu Paquete</h4>
            <div className="p-4 bg-default-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-default-500">Paquete</p>
                  <p className="font-medium">{matricula.paquete.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Tipo de Auto</p>
                  <p className="font-medium">{matricula.paquete.tipo_auto?.tipo}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="font-semibold mb-3">Contratación por Horas</h4>
            <div className="p-4 bg-default-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-default-500">Horas Contratadas</p>
                  <p className="font-medium">{matricula.horas_contratadas} horas</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Tarifa por Hora</p>
                  <p className="font-medium">S/ {matricula.tarifa_por_hora}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progreso de clases */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Progreso de Clases</span>
            <span className="text-sm text-default-500">
              {estadisticas.horas_completadas}/{estadisticas.horas_total} horas ({estadisticas.progreso}%)
            </span>
          </div>
          <Progress
            value={estadisticas.progreso}
            color="primary"
            className="w-full"
            aria-label="Progreso de Clases"
          />
        </div>
      </CardBody>
    </Card>
  );
};
