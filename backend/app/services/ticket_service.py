from app.models import Ticket, Asistencia, Reserva, Matricula, Alumno, Instructor
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from datetime import datetime

def listar_tickets_admin(filtros):
    query = Ticket.query\
        .join(Asistencia).join(Reserva).join(Matricula).join(Alumno)\
        .join(Instructor, Ticket.id_instructor == Instructor.id)\
        .options(
            joinedload(Ticket.asistencia).joinedload(Asistencia.reserva).joinedload(Reserva.matricula).joinedload(Matricula.alumno),
            joinedload(Ticket.instructor)
        )
    # TODO: Revisar si estos filtros son correctos para la consulta de tickets de administrador
    if "dni_alumno" in filtros:
        query = query.filter(Alumno.dni == filtros["dni_alumno"])
    if "instructor_id" in filtros:
        query = query.filter(Ticket.id_instructor == filtros["instructor_id"]) # Este filtro puede cambiar
    if "fecha" in filtros:
        fecha = datetime.strptime(filtros["fecha"], "%Y-%m-%d").date()
        query = query.filter(func.date(Asistencia.fecha_asistencia) == fecha)

    # Podria ser mejor usar un filtro por nombre de instructor
    if "nombre_instructor" in filtros:
        query = query.filter(Instructor.nombre.ilike(f"%{filtros['nombre_instructor']}%"))

    return query.order_by(Asistencia.fecha_asistencia.desc()).all()


def listar_tickets_instructor(instructor_id, filtros):
    query = Ticket.query\
        .filter(Ticket.id_instructor == instructor_id)\
        .join(Asistencia).join(Reserva).join(Matricula).join(Alumno)\
        .options(
            joinedload(Ticket.asistencia).joinedload(Asistencia.reserva).joinedload(Reserva.matricula).joinedload(Matricula.alumno)
        )
    # TODO: Revisar si estos filtros son correctos para la consulta de tickets del instructor
    if "fecha" in filtros:
        query = query.filter(func.date(Asistencia.fecha_asistencia) == filtros["fecha"])
    if "dni_alumno" in filtros:
        query = query.filter(Alumno.dni == filtros["dni_alumno"])

    return query.order_by(Asistencia.fecha_asistencia.desc()).all()
