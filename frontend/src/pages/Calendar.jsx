import { useState, useEffect} from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  useDisclosure,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/store/auth-store';
import {
  DAYS,
  HOURS,
  generateTimeSlots,
  generateUserReservations
} from '@/data/calendar-data';
import { ConfirmationModal } from '@/pages/ConfirmationModal';

export const Calendar = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 1;

  const [mode, setMode] = useState('view');
  const [timeSlots, setTimeSlots] = useState(generateTimeSlots());
  const [userReservations, setUserReservations] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [modalAction, setModalAction] = useState('reserve');

  // Initialize user reservations
  useEffect(() => {
    const initialReservations = generateUserReservations(userId, timeSlots);

    // Update time slots with the reservations
    const updatedSlots = [...timeSlots];
    initialReservations.forEach(reservation => {
      const slotIndex = updatedSlots.findIndex(slot => slot.id === reservation.timeSlotId);
      if (slotIndex !== -1) {
        updatedSlots[slotIndex].reservations += 1;
        if (updatedSlots[slotIndex].reservations >= updatedSlots[slotIndex].maxReservations) {
          updatedSlots[slotIndex].isAvailable = false;
        }
      }
    });

    setTimeSlots(updatedSlots);
    setUserReservations(initialReservations.map(res => res.timeSlotId));
  }, [userId]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSelectedSlots([]);
  };

  const handleSlotClick = (slotId) => {
    if (mode === 'view') return;

    if (mode === 'reserve') {
      // Only allow selecting available slots that the user hasn't already reserved
      const slot = timeSlots.find(s => s.id === slotId);
      if (!slot || !slot.isAvailable || userReservations.includes(slotId)) return;

      setSelectedSlots(prev =>
        prev.includes(slotId)
          ? prev.filter(id => id !== slotId)
          : [...prev, slotId]
      );
    } else if (mode === 'cancel') {
      // Only allow selecting slots that the user has reserved
      if (!userReservations.includes(slotId)) return;

      setSelectedSlots(prev =>
        prev.includes(slotId)
          ? prev.filter(id => id !== slotId)
          : [...prev, slotId]
      );
    }
  };

  const handleSave = () => {
    if (selectedSlots.length === 0) {
      addToast({
        title: "No hay cambios",
        description: mode === 'reserve'
          ? "No has seleccionado ningún horario para reservar."
          : "No has seleccionado ninguna reserva para cancelar.",
        severity: "warning",
      });
      return;
    }

    setModalAction(mode === 'reserve' ? 'reserve' : 'cancel');
    onOpen();
  };

  const handleCancel = () => {
    setSelectedSlots([]);
    setMode('view');
  };

  const confirmAction = () => {
    const updatedSlots = [...timeSlots];
    let updatedUserReservations = [...userReservations];

    if (modalAction === 'reserve') {
      // Add new reservations
      selectedSlots.forEach(slotId => {
        const slotIndex = updatedSlots.findIndex(slot => slot.id === slotId);
        if (slotIndex !== -1) {
          updatedSlots[slotIndex].reservations += 1;
          if (updatedSlots[slotIndex].reservations >= updatedSlots[slotIndex].maxReservations) {
            updatedSlots[slotIndex].isAvailable = false;
          }
        }
      });

      updatedUserReservations = [...updatedUserReservations, ...selectedSlots];

      addToast({
        title: "Reservas confirmadas",
        description: `Has reservado ${selectedSlots.length} horario(s) exitosamente.`,
        severity: "success",
      });
    } else {
      // Cancel reservations
      selectedSlots.forEach(slotId => {
        const slotIndex = updatedSlots.findIndex(slot => slot.id === slotId);
        if (slotIndex !== -1) {
          updatedSlots[slotIndex].reservations -= 1;
          updatedSlots[slotIndex].isAvailable = true;
        }
      });

      updatedUserReservations = updatedUserReservations.filter(id => !selectedSlots.includes(id));

      addToast({
        title: "Reservas canceladas",
        description: `Has cancelado ${selectedSlots.length} reserva(s) exitosamente.`,
        severity: "danger",
      });
    }

    setTimeSlots(updatedSlots);
    setUserReservations(updatedUserReservations);
    setSelectedSlots([]);
    setMode('view');
  };

  const renderTimeSlot = (slotId, day, hour) => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot) return null;

    const isUserReservation = userReservations.includes(slotId);
    const isSelected = selectedSlots.includes(slotId);
    const isFull = slot.reservations >= slot.maxReservations;

    let bgColor = 'bg-default-100';
    let textColor = 'text-default-800';

    if (isUserReservation) {
      bgColor = 'bg-primary-100';
      textColor = 'text-primary-700';
    }

    if (isFull && !isUserReservation) {
      bgColor = 'bg-default-200';
      textColor = 'text-default-500';
    }

    if (isSelected) {
      bgColor = mode === 'reserve' ? 'bg-success-200' : 'bg-danger-200';
      textColor = mode === 'reserve' ? 'text-success-700' : 'text-danger-700';
    }

    const formattedHour = hour < 12
      ? `${hour}:00 AM`
      : hour === 12
        ? '12:00 PM'
        : `${hour - 12}:00 PM`;

    return (
      <div
        key={slotId}
        className={`p-2 border border-divider rounded-md ${bgColor} ${textColor} transition-colors cursor-pointer hover:opacity-80`}
        onClick={() => handleSlotClick(slotId)}
      >
        <div className="text-xs font-medium">{formattedHour}</div>
        <div className="text-xs mt-1">
          {slot.reservations}/{slot.maxReservations} reservas
        </div>
        {isUserReservation && (
          <div className="mt-1 text-xs font-medium flex items-center gap-1">
            <Icon icon="lucide:check" width={12} height={12} />
            <span>Tu reserva</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Calendario de Reservas</h1>
          <p className="text-default-500">Gestiona tus reservaciones semanales.</p>
        </div>

        <div className="flex gap-2">
          <Button
            color="primary"
            variant={mode === 'reserve' ? 'solid' : 'flat'}
            startContent={<Icon icon="lucide:plus" width={16} height={16} />}
            onPress={() => handleModeChange('reserve')}
          >
            Reservar
          </Button>
          <Button
            color="danger"
            variant={mode === 'cancel' ? 'solid' : 'flat'}
            startContent={<Icon icon="lucide:x" width={16} height={16} />}
            onPress={() => handleModeChange('cancel')}
          >
            Cancelar Reservas
          </Button>
        </div>
      </div>

      {mode !== 'view' && (
        <div className="flex justify-end gap-2">
          <Button
            variant="flat"
            onPress={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            color={mode === 'reserve' ? 'success' : 'danger'}
            onPress={handleSave}
          >
            {mode === 'reserve' ? 'Guardar Reservas' : 'Confirmar Cancelaciones'}
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Horario Semanal</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-8 gap-4">
            {/* Time column */}
            <div className="col-span-1">
              <div className="h-12 flex items-center justify-center font-medium">
                Hora
              </div>
              {HOURS.map(hour => (
                <div
                  key={`hour-${hour}`}
                  className="h-24 flex items-center justify-center text-sm font-medium"
                >
                  {hour < 12
                    ? `${hour}:00 AM`
                    : hour === 12
                      ? '12:00 PM'
                      : `${hour - 12}:00 PM`
                  }
                </div>
              ))}
            </div>

            {/* Days columns */}
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="col-span-1">
                <div className="h-12 flex items-center justify-center font-medium">
                  {day}
                </div>
                {HOURS.map(hour => {
                  // For Sunday, only show slots until 12pm
                  if (dayIndex === 6 && hour >= 12) {
                    return <div key={`${day}-${hour}`} className="h-24 bg-default-50 rounded-md"></div>;
                  }

                  const slotId = `${dayIndex}-${hour}`;
                  return (
                    <div key={`${day}-${hour}`} className="h-24">
                      {renderTimeSlot(slotId, day, hour)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <ConfirmationModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        action={modalAction}
        slotsCount={selectedSlots.length}
        onConfirm={confirmAction}
      />
    </div>
  );
};