from datetime import datetime, date, timedelta
from app.models import Bloque, Reserva, Matricula, Asistencia
from app.extensions import db
from werkzeug.exceptions import BadRequest
from sqlalchemy.orm import joinedload
from sqlalchemy import func

def crear_reservas(data, por_admin=False):
    matricula = Matricula.query.get_or_404(data["id_matricula"])
    id_alumno = data.get("id_alumno", None)
    if matricula.id_alumno != id_alumno and not por_admin:
        raise BadRequest("No puedes crear reservas que no te pertenecen")
    
    hoy = date.today()

    fecha_limite = matricula.fecha_limite
    if isinstance(fecha_limite, datetime):
        fecha_limite = fecha_limite.date()
    if fecha_limite < hoy:
        raise BadRequest("La matrícula ha vencido")
        
    if matricula.estado_clases == 'completado':
        raise BadRequest("El alumno ya completó todas sus horas de la matricula")
    
    if matricula.tipo_contratacion == "paquete" and matricula.paquete:
        total_horas = matricula.paquete.horas_total
    elif matricula.tipo_contratacion == "por_hora":
        total_horas = matricula.horas_contratadas
    horas_usadas = matricula.horas_completadas
    nuevas_horas = len(data["reservas"])

    # Calcular reservas pendientes (futuras sin asistencia)
    ahora = datetime.now()
    reservas_pendientes = db.session.query(func.count(Reserva.id)).join(Bloque).filter(
        Reserva.id_matricula == matricula.id,
        db.or_(
            Bloque.fecha > ahora.date(),
            db.and_(
                Bloque.fecha == ahora.date(),
                Bloque.hora_inicio > ahora.time()
            )
        )
    ).outerjoin(Asistencia).filter(
        Asistencia.id.is_(None)  # Sin asistencia registrada
    ).scalar() or 0

    horas_disponibles_reserva = total_horas - horas_usadas - reservas_pendientes
    if nuevas_horas > horas_disponibles_reserva:
        raise BadRequest(f"No puedes reservar más horas ya que excede tus horas contratadas")

    # Procesar todas las reservas
    reservas_creadas = []
    for item in data["reservas"]:
        bloque = Bloque.query.get_or_404(item["id_bloque"])
        
        if bloque.reservas_actuales >= bloque.capacidad_max:
            raise BadRequest(f"El bloque {bloque.fecha}: {bloque.hora_inicio} - {bloque.hora_fin} está lleno")

         # Validar que la fecha del bloque no exceda la fecha límite de la matrícula
        fecha_bloque = bloque.fecha
            
        if fecha_bloque > fecha_limite:
            raise BadRequest(f"No puedes reservar porque un bloque excede tu fecha límite de matrícula")
        
        # Solo aplicar restricción de anticipación si no es admin
        if not por_admin and matricula.categoria == "A-II":
            if bloque.fecha <= hoy:
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

def eliminar_reservas(data, por_admin=False):
    matricula = Matricula.query.get_or_404(data["id_matricula"])
    id_alumno = data.get("id_alumno", None)
    if matricula.id_alumno != id_alumno and not por_admin:
        raise BadRequest("No puedes cancelar reservas que no te pertenecen")

    reservas = Reserva.query.filter(Reserva.id.in_(data["ids_reservas"])).all()
    if not reservas:
        raise BadRequest("Reservas no encontradas")

    if not por_admin and matricula.ultima_modificacion_reserva:
        delta = datetime.now() - matricula.ultima_modificacion_reserva
        if delta.total_seconds() < 86400:
            tiempo_restante = 86400 - delta.total_seconds()
            horas_restantes = int(tiempo_restante // 3600)
            minutos_restantes = int((tiempo_restante % 3600) // 60)
            raise BadRequest(f"Solo puedes modificar reservas cada 24 horas. Tiempo restante: {horas_restantes} horas y {minutos_restantes} minutos.")

    for reserva in reservas:
        bloque = reserva.bloque
        bloque.reservas_actuales -= 1
        db.session.delete(reserva)

    # Solo actualizar timestamp si no es admin
    if not por_admin:
        matricula.ultima_modificacion_reserva = datetime.now()
    db.session.commit()
    return reservas

def listar_reservas(id_alumno=None, por_admin=False, semana_offset=None): 
    query = Reserva.query.options(
        joinedload(Reserva.bloque),
        joinedload(Reserva.matricula).joinedload(Matricula.alumno),
        joinedload(Reserva.asistencia)
    )

    # Filtro por semana si se especifica
    if semana_offset is not None:
        hoy = date.today()
        dias_desde_lunes = hoy.weekday()
        lunes_semana_actual = hoy - timedelta(days=dias_desde_lunes)
        lunes_semana_objetivo = lunes_semana_actual + timedelta(weeks=semana_offset)
        
        fecha_inicio = lunes_semana_objetivo
        fecha_fin = lunes_semana_objetivo + timedelta(days=6)
        
        query = query.join(Bloque).filter(
            Bloque.fecha >= fecha_inicio,
            Bloque.fecha <= fecha_fin
        )

    # Filtros por usuario
    if not por_admin and id_alumno:
        reservas = query.join(Matricula).filter(
            Matricula.id_alumno == id_alumno
        ).all()
    else:
        reservas = query.all()
    
    return reservas

def listar_reservas_hoy():
    hoy = date.today()
    reservas = Reserva.query.join(Bloque).outerjoin(Asistencia).filter(
        Bloque.fecha == hoy
    ).options(
        joinedload(Reserva.bloque),
        joinedload(Reserva.matricula).joinedload(Matricula.alumno),
        joinedload(Reserva.asistencia)
    ).order_by(Bloque.hora_inicio).all()
    return reservas

def listar_reservas_actuales():
    tolerancia = 15 # minutos de tolerancia
    ahora = datetime.now()
    hoy = ahora.date()
    hora_con_tolerancia = ahora - timedelta(minutes=tolerancia)
    
    reservas = Reserva.query.join(Bloque).outerjoin(Asistencia).filter(
        Bloque.fecha == hoy,
        Bloque.hora_inicio >= hora_con_tolerancia.time()
    ).options(
        joinedload(Reserva.bloque),
        joinedload(Reserva.matricula).joinedload(Matricula.alumno),
        joinedload(Reserva.asistencia)
    ).order_by(Bloque.hora_inicio).all()
    
    return reservas