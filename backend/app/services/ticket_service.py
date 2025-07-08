from app.models import Ticket, Asistencia, Reserva, Matricula, Alumno, Instructor
from sqlalchemy.orm import joinedload
from sqlalchemy import func, or_, desc
from datetime import timedelta
from app.datetime_utils import now_peru

def listar_tickets_admin(
    page=1,
    per_page=20,
    busqueda=None,
    fecha_inicio=None,
    fecha_fin=None,
    id_instructor=None
):
    query = Ticket.query\
        .join(Asistencia).join(Reserva).join(Matricula).join(Alumno)\
        .join(Instructor, Ticket.id_instructor == Instructor.id)\
        .options(
            joinedload(Ticket.asistencia).joinedload(Asistencia.reserva).joinedload(Reserva.matricula).joinedload(Matricula.alumno),
            joinedload(Ticket.instructor)
        )
    if busqueda:
        busqueda_like = f"%{busqueda.lower()}%"
        query = query.filter(
            or_(
                Alumno.nombre.ilike(busqueda_like),
                Alumno.apellidos.ilike(busqueda_like),
                Alumno.dni.ilike(busqueda_like),
                Instructor.nombre.ilike(busqueda_like),
                Instructor.apellidos.ilike(busqueda_like),
                Ticket.id.ilike(busqueda_like)
            )
        )
    # Filtro por instructor
    if id_instructor:
        query = query.filter(Ticket.id_instructor == id_instructor)

    # Filtro por fecha
    if fecha_inicio:
        query = query.filter(Asistencia.fecha_asistencia >= fecha_inicio)
    
    if fecha_fin:
        query = query.filter(Asistencia.fecha_asistencia <= fecha_fin)

    # Ordenación
    query = query.order_by(desc(Asistencia.fecha_asistencia), desc(Ticket.id))

    # Paginación
    resultado = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    return resultado


def listar_tickets_instructor(
    instructor_id,
    page=1,
    per_page=20,
    busqueda=None,
    fecha_inicio=None,
    fecha_fin=None
):
    query = Ticket.query\
        .filter(Ticket.id_instructor == instructor_id)\
        .join(Asistencia).join(Reserva).join(Matricula).join(Alumno)\
        .options(
            joinedload(Ticket.asistencia).joinedload(Asistencia.reserva).joinedload(Reserva.matricula).joinedload(Matricula.alumno)
        )
    
    # Filtro por búsqueda
    if busqueda:
        busqueda_like = f"%{busqueda.lower()}%"
        query = query.filter(
            or_(
                Alumno.nombre.ilike(busqueda_like),
                Alumno.apellidos.ilike(busqueda_like),
                Alumno.dni.ilike(busqueda_like),
                Ticket.id.ilike(busqueda_like)
            )
        )

    # Filtro por fecha
    if fecha_inicio:
        query = query.filter(Asistencia.fecha_asistencia >= fecha_inicio)
    
    if fecha_fin:
        query = query.filter(Asistencia.fecha_asistencia <= fecha_fin)
    
    # Ordenación
    query = query.order_by(desc(Asistencia.fecha_asistencia), desc(Ticket.id))
    
    # Paginación
    resultado = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    return resultado

def obtener_estadisticas_tickets(id_instructor=None):
    try:
        query = Ticket.query.join(Asistencia)
        
        # Filtrar por instructor si se especifica
        if id_instructor:
            query = query.filter(Ticket.id_instructor == id_instructor)
        
        # Total de tickets
        total = query.count()
        
        # Tickets de hoy
        hoy = now_peru().date()
        tickets_hoy = query.filter(
            func.date(Asistencia.fecha_asistencia) == hoy
        ).count()
        
        # Tickets de la última semana
        hace_semana = now_peru() - timedelta(days=7)
        tickets_semana = query.filter(
            Asistencia.fecha_asistencia >= hace_semana
        ).count()
        
        return {
            "total": total,
            "hoy": tickets_hoy,
            "semana": tickets_semana,
        }
        
    except Exception as e:
        return {
            "total": 0,
            "hoy": 0,
            "semana": 0,
        }