from datetime import datetime
from app.models import Bloque, Reserva, Matricula
from app.extensions import db
from werkzeug.exceptions import BadRequest
from sqlalchemy import func


def crear_reservas(data, por_admin=False):
    matricula = Matricula.query.get_or_404(data["id_matricula"])
    hoy = datetime.today().date()
    
    if matricula.fecha_limite < hoy:
        raise BadRequest("La matrícula ha vencido")
        
    if matricula.estado_clases == 'completado':
        raise BadRequest("El alumno ya completó todas sus horas de la matricula")
    
    if matricula.tipo_contratacion == "paquete" and matricula.paquete:
        total_horas = matricula.paquete.horas_total
    elif matricula.tipo_contratacion == "por_hora":
        total_horas = matricula.horas_contratadas
    horas_usadas = db.session.query(func.count(Reserva.id)).filter_by(id_matricula=matricula.id).scalar() or 0
    nuevas_horas = len(data["reservas"])
    if horas_usadas + nuevas_horas > total_horas:
        raise BadRequest(f"No hay suficientes horas disponibles. Tiene {total_horas - horas_usadas} hora(s) restante(s).")

    # Procesar todas las reservas
    reservas_creadas = []
    for item in data["reservas"]:
        bloque = Bloque.query.get_or_404(item["id_bloque"])
        
        if bloque.reservas_actuales >= bloque.capacidad_max:
            raise BadRequest(f"El bloque {bloque.fecha}: {bloque.hora_inicio} - {bloque.hora_fin} está lleno")
            
        # Solo aplicar restricción de anticipación si no es admin
        if not por_admin and matricula.alumno.categoria == "A-II" and bloque.fecha <= hoy:
            raise BadRequest("Alumnos A-II deben reservar con 1 día de anticipación")
            
        reserva = Reserva(
            id_bloque=bloque.id,
            id_matricula=matricula.id
        )
        
        bloque.reservas_actuales += 1
        db.session.add(reserva)
        reservas_creadas.append(reserva)
    
    db.session.commit()
    return reservas_creadas

def eliminar_reservas(data, id_usuario, por_admin=False):
    matricula = Matricula.query.get_or_404(data["id_matricula"])
    reservas = Reserva.query.filter(Reserva.id.in_(data["ids_reservas"])).all()
    if not reservas:
        raise BadRequest("Reservas no encontradas")

    if not por_admin and matricula.ultima_modificacion_reserva:
        delta = datetime.now() - matricula.ultima_modificacion_reserva
        if delta.total_seconds() < 86400:
            raise BadRequest("Solo puedes modificar reservas cada 24 horas")

    for reserva in reservas:
        if matricula.id_alumno != id_usuario and not por_admin:
            raise BadRequest("No puedes cancelar reservas que no te pertenecen")

        bloque = reserva.bloque
        bloque.reservas_actuales -= 1
        db.session.delete(reserva)

    matricula.ultima_modificacion_reserva = datetime.now()
    db.session.commit()

def listar_reservas(data, id_usuario, por_admin=False): # TODO: filtro para ver todas las reservas de dias en específico  
    reservas = []
    # Si es alumno, solo ve sus propias reservas
    if not por_admin:
        reservas = Reserva.query.join(Matricula).filter(
            Matricula.id_alumno == id_usuario
        ).all()
    else:
        # Administradores pueden filtrar por id_alumno
        id_alumno = data["id_alumno"]
        if id_alumno:
            reservas = Reserva.query.join(Matricula).filter(
                Matricula.id_alumno == id_alumno
            ).all()
        else:
            # Sin filtro, admin ve todas las proximas reservas
            hoy = datetime.today().date()
            reservas = Reserva.query.join(Bloque).filter(
                Bloque.fecha >= hoy
            ).all()
    
    return reservas