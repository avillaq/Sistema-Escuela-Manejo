from datetime import datetime, timedelta, date
from sqlalchemy import func
from app.extensions import db
from app.models import (
    Alumno, Matricula, Reserva, Pago, Bloque, Asistencia,
    Instructor, Auto
)

def obtener_reporte_admin():
    hoy = date.today()
    ahora = datetime.now()
    
    # Fechas para análisis
    inicio_mes = date(hoy.year, hoy.month, 1)
    inicio_semana = hoy - timedelta(days=hoy.weekday())
    hace_30_dias = hoy - timedelta(days=30)
    
    # === ESTADÍSTICAS GENERALES ===
    
    # Alumnos activos (con matrícula vigente)
    alumnos_activos = db.session.query(func.count(func.distinct(Matricula.id_alumno))).filter(
        Matricula.fecha_limite >= hoy,
        Matricula.estado_clases.in_(['pendiente', 'en_progreso'])
    ).scalar() or 0
    
    # Total de alumnos registrados
    total_alumnos = db.session.query(func.count(Alumno.id)).filter(Alumno.activo == True).scalar() or 0
    
    # Matrículas activas
    matriculas_activas = db.session.query(func.count(Matricula.id)).filter(
        Matricula.fecha_limite >= hoy,
        Matricula.estado_clases.in_(['pendiente', 'en_progreso'])
    ).scalar() or 0
    
    # Clases completadas este mes
    clases_mes = db.session.query(func.count(Asistencia.id)).join(Reserva).join(Bloque).filter(
        Asistencia.asistio == True,
        func.date(Asistencia.fecha_asistencia) >= inicio_mes
    ).scalar() or 0
    
    # Ingresos este mes
    ingresos_mes = db.session.query(func.sum(Pago.monto)).filter(
        func.date(Pago.fecha_pago) >= inicio_mes
    ).scalar() or 0.0
    
    # === ANÁLISIS MENSUAL (últimos 6 meses) ===
    ultimos_meses = 30*6 
    # Matrículas por mes
    matriculas_por_mes = db.session.query(
        func.date_format(Matricula.fecha_matricula, "%Y-%m").label("mes"),
        func.count(Matricula.id).label("cantidad")
    ).filter(
        Matricula.fecha_matricula >= hoy - timedelta(days=ultimos_meses)  # Últimos 6 meses aproximadamente
    ).group_by("mes").order_by("mes").all()
    
    # Ingresos por mes
    ingresos_por_mes = db.session.query(
        func.date_format(Pago.fecha_pago, "%Y-%m").label("mes"),
        func.sum(Pago.monto).label("total")
    ).filter(
        Pago.fecha_pago >= hoy - timedelta(days=ultimos_meses)
    ).group_by("mes").order_by("mes").all()
    
    # === ACTIVIDAD HOY Y MAÑANA ===
    mañana = hoy + timedelta(days=1)
    
    tolerancia = 15
    ahora_con_tolerancia = ahora - timedelta(minutes=tolerancia)

    # Reservas hoy (desde la hora actual)
    reservas_hoy = db.session.query(
        Bloque.hora_inicio,
        Bloque.hora_fin,
        Alumno.nombre,
        Alumno.apellidos,
        Asistencia.asistio
    ).join(Reserva, Reserva.id_bloque == Bloque.id)\
     .join(Matricula, Reserva.id_matricula == Matricula.id)\
     .join(Alumno, Matricula.id_alumno == Alumno.id)\
     .outerjoin(Asistencia, Asistencia.id_reserva == Reserva.id)\
     .filter(
         Bloque.fecha == hoy,
         # Solo bloques desde la hora actual
         db.or_(
             Bloque.fecha > hoy,
             db.and_(
                 Bloque.fecha == hoy,
                 Bloque.hora_inicio >= ahora_con_tolerancia.time()
             )
         )
     ).order_by(Bloque.hora_inicio).all()
    
    # Reservas mañana
    reservas_manana = db.session.query(
        Bloque.hora_inicio,
        Bloque.hora_fin,
        Alumno.nombre,
        Alumno.apellidos
    ).join(Reserva, Reserva.id_bloque == Bloque.id)\
     .join(Matricula, Reserva.id_matricula == Matricula.id)\
     .join(Alumno, Matricula.id_alumno == Alumno.id)\
     .filter(Bloque.fecha == mañana)\
     .order_by(Bloque.hora_inicio).all()
    
    # === ALERTAS Y PENDIENTES ===
    
    # Matrículas por vencer (próximos 7 días)
    vencimiento_limite = hoy + timedelta(days=7)
    matriculas_vencer = db.session.query(
        Alumno.nombre,
        Alumno.apellidos,
        Matricula.fecha_limite,
        Matricula.id
    ).join(Alumno, Matricula.id_alumno == Alumno.id).filter(
        Matricula.fecha_limite >= hoy,
        Matricula.fecha_limite <= vencimiento_limite,
        Matricula.estado_clases.in_(['pendiente', 'en_progreso'])
    ).order_by(Matricula.fecha_limite).all()
    
    # Pagos pendientes
    pagos_pendientes = []
    matriculas_deudoras = db.session.query(Matricula).filter(
        Matricula.estado_pago == 'pendiente',
        Matricula.fecha_limite >= hoy
    ).all()
    
    for matricula in matriculas_deudoras:
        total_pagado = db.session.query(func.sum(Pago.monto)).filter_by(
            id_matricula=matricula.id
        ).scalar() or 0
        
        saldo = matricula.costo_total - total_pagado
        if saldo > 0:
            pagos_pendientes.append({
                "matricula_id": matricula.id,
                "alumno": f"{matricula.alumno.nombre} {matricula.alumno.apellidos}",
                "saldo": float(saldo),
                "total": float(matricula.costo_total),
                "pagado": float(total_pagado),
                "categoria": matricula.categoria
            })
    
    # === ESTADÍSTICAS DE RECURSOS ===
    
    # Instructores activos
    instructores_activos = db.session.query(func.count(Instructor.id)).filter(
        Instructor.activo == True
    ).scalar() or 0
    
    # Autos activos
    autos_activos = db.session.query(func.count(Auto.id)).filter(
        Auto.activo == True
    ).scalar() or 0
    
    # Clases completadas esta semana
    clases_semana = db.session.query(func.count(Asistencia.id)).join(Reserva).join(Bloque).filter(
        Asistencia.asistio == True,
        func.date(Asistencia.fecha_asistencia) >= inicio_semana
    ).scalar() or 0
    
    # Formatear datos para frontend
    return {
        "estadisticas_generales": {
            "alumnos_activos": alumnos_activos,
            "total_alumnos": total_alumnos,
            "matriculas_activas": matriculas_activas,
            "clases_mes": clases_mes,
            "clases_semana": clases_semana,
            "ingresos_mes": float(ingresos_mes),
            "instructores_activos": instructores_activos,
            "autos_activos": autos_activos
        },
        "matriculas_por_mes": [
            {"mes": m, "cantidad": c} for m, c in matriculas_por_mes
        ],
        "ingresos_por_mes": [
            {"mes": m, "total": float(t)} for m, t in ingresos_por_mes
        ],
        "actividad_hoy": [
            {
                "horario": f"{h_inicio.strftime('%H:%M')} - {h_fin.strftime('%H:%M')}",
                "alumno": f"{n} {a}",
                "estado": "completada" if asistio == True else "pendiente" if asistio is None else "falta"
            } for h_inicio, h_fin, n, a, asistio in reservas_hoy
        ],
        "actividad_manana": [
            {
                "horario": f"{h_inicio.strftime('%H:%M')} - {h_fin.strftime('%H:%M')}",
                "alumno": f"{n} {a}"
            } for h_inicio, h_fin, n, a in reservas_manana
        ],
        "alertas": {
            "matriculas_por_vencer": [
                {
                    "matricula_id": id_mat,
                    "alumno": f"{n} {a}",
                    "vence": f.strftime('%d/%m/%Y'),
                    "dias_restantes": (f - hoy).days
                } for n, a, f, id_mat in matriculas_vencer
            ],
            "pagos_pendientes": pagos_pendientes[:5]  # Solo los primeros 5
        }
    }