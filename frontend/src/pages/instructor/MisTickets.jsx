import { TicketBase } from '@/components/ticket/TicketBase';
import { useAuthStore } from '@/store/auth-store';

export const MisTickets = () => {
  const { id } = useAuthStore();
  return (
    <TicketBase 
      id_instructor={id}
      titulo="Mis Tickets"
      descripcion="Registro de todas las clases que has impartido."
    />
  );
};