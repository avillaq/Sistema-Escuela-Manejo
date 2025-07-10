from datetime import datetime, timedelta, date
from sqlalchemy import func, and_
from app.extensions import db
from app.models import (
    Alumno, Matricula, Reserva, Pago, Bloque, Asistencia,
    Instructor, Auto
)
from app.datetime_utils import now_peru, today_peru, combine_peru

def obtener_reporte_admin():
    hoy = today_peru()
    ahora = now_peru()
    
    # Fechas para análisis
    inicio_mes = date(hoy.year, hoy.month, 1)
    ultimos_meses = 30 * 6
    fecha_limite_meses = hoy - timedelta(days=ultimos_meses)
    
    # === ESTADÍSTICAS GENERALES ===

    # Alumnos activos (con matrícula vigente)
    alumnos_activos = db.session.query(
        func.count(func.distinct(Matricula.id_alumno))
    ).filter(
        and_(
            Matricula.fecha_limite >= ahora,
            Matricula.estado_clases.in_(['pendiente', 'en_progreso'])
        )
    ).scalar() or 0

    # Total de alumnos registrados
    total_alumnos = db.session.query(
        func.count(Alumno.id)
    ).filter(Alumno.activo == True).scalar() or 0

    # Matrículas activas
    matriculas_activas = db.session.query(
        func.count(Matricula.id)
    ).filter(
        and_(
            Matricula.fecha_limite >= ahora,
            Matricula.estado_clases.in_(['pendiente', 'en_progreso'])
        )
    ).scalar() or 0

    # Instructores activos
    instructores_activos = db.session.query(
        func.count(Instructor.id)
    ).filter(Instructor.activo == True).scalar() or 0
    
    # Autos activos
    autos_activos = db.session.query(
        func.count(Auto.id)
    ).filter(Auto.activo == True).scalar() or 0
    
    # Ingresos este mes
    ingresos_mes = db.session.query(func.sum(Pago.monto)).filter(
        func.date(Pago.fecha_pago) >= inicio_mes
    ).scalar() or 0.0
    
    # === ANÁLISIS MENSUAL (últimos 6 meses) ===
    # Matrículas por mes
    matriculas_por_mes = db.session.query(
        func.date_format(Matricula.fecha_matricula, "%Y-%m").label("mes"),
        func.count(Matricula.id).label("cantidad")
    ).filter(
        Matricula.fecha_matricula >= fecha_limite_meses
    ).group_by(
        func.date_format(Matricula.fecha_matricula, "%Y-%m")
    ).order_by(
        func.date_format(Matricula.fecha_matricula, "%Y-%m")
    ).all()
    
    # Ingresos por mes
    ingresos_por_mes = db.session.query(
        func.date_format(Pago.fecha_pago, "%Y-%m").label("mes"),
        func.sum(Pago.monto).label("total")
    ).filter(
        Pago.fecha_pago >= fecha_limite_meses
    ).group_by(
        func.date_format(Pago.fecha_pago, "%Y-%m")
    ).order_by(
        func.date_format(Pago.fecha_pago, "%Y-%m")
    ).all()
    
    # === ACTIVIDAD HOY Y MAÑANA ===
    mañana = hoy + timedelta(days=1)
    tolerancia = 15
    ahora_con_tolerancia = ahora - timedelta(minutes=tolerancia)

    reservas_query = db.session.query(
        Bloque.fecha,
        Bloque.hora_inicio,
        Bloque.hora_fin,
        Alumno.nombre,
        Alumno.apellidos,
        Asistencia.asistio
    ).select_from(Bloque)\
     .join(Reserva, Reserva.id_bloque == Bloque.id)\
     .join(Matricula, Reserva.id_matricula == Matricula.id)\
     .join(Alumno, Matricula.id_alumno == Alumno.id)\
     .outerjoin(Asistencia, Asistencia.id_reserva == Reserva.id)\
     .filter(
        Bloque.fecha.in_([hoy, mañana]) 
     ).order_by(Bloque.fecha, Bloque.hora_inicio).all()
    
    # Separar en memoria (más eficiente que 2 consultas)
    reservas_hoy = []
    reservas_manana = []

    for fecha, h_inicio, h_fin, nombre, apellidos, asistio in reservas_query:
        item = {
            "horario": f"{h_inicio.strftime('%H:%M')} - {h_fin.strftime('%H:%M')}",
            "alumno": f"{nombre} {apellidos}"
        }
        
        if fecha == hoy:
            # Aplicar filtro de tolerancia solo para hoy
            hora_clase = combine_peru(hoy, h_inicio)
            if hora_clase >= ahora_con_tolerancia:
                if asistio is True:
                    item["estado"] = "completada"
                elif asistio is False:
                    item["estado"] = "falta"
                else:
                    item["estado"] = "pendiente"
                reservas_hoy.append(item)
        else:  # mañana
            reservas_manana.append(item)

    
    # === ALERTAS Y PENDIENTES ===
    
    # Matrículas por vencer (próximos 7 días)
    vencimiento_limite = hoy + timedelta(days=7)

    # Matrículas por vencer (limitado a 10)
    matriculas_vencer = db.session.query(
        Alumno.nombre,
        Alumno.apellidos,
        Matricula.fecha_limite,
        Matricula.id
    ).join(Alumno, Matricula.id_alumno == Alumno.id)\
     .filter(
         and_(
             Matricula.fecha_limite.between(hoy, vencimiento_limite),
             Matricula.estado_clases.in_(['pendiente', 'en_progreso'])
         )
     ).order_by(Matricula.fecha_limite)\
      .limit(10).all()
    
    # Pagos pendientes
    pagos_pendientes = []
    matriculas_con_saldo = db.session.query(
        Matricula.id,
        Matricula.costo_total,
        Matricula.categoria,
        Alumno.nombre,
        Alumno.apellidos,
        func.coalesce(func.sum(Pago.monto), 0).label('total_pagado')
    ).join(Alumno, Matricula.id_alumno == Alumno.id)\
     .outerjoin(Pago, Pago.id_matricula == Matricula.id)\
     .filter(
         and_(
             Matricula.estado_pago == 'pendiente',
             Matricula.fecha_limite >= ahora,
         )
     ).group_by(
         Matricula.id, Matricula.costo_total, Matricula.categoria,
         Alumno.nombre, Alumno.apellidos
     ).having(
         func.coalesce(func.sum(Pago.monto), 0) < Matricula.costo_total
     ).limit(10).all()  
    
    for id_mat, costo_total, categoria, nombre, apellidos, total_pagado in matriculas_con_saldo:
        saldo = costo_total - total_pagado
        if saldo > 0:
            pagos_pendientes.append({
                "matricula_id": id_mat,
                "alumno": f"{nombre} {apellidos}",
                "saldo": float(saldo),
                "total": float(costo_total),
                "pagado": float(total_pagado),
                "categoria": categoria
            })
    
    # Formatear datos para frontend
    return {
        "estadisticas_generales": {
            "alumnos_activos": alumnos_activos or 0,
            "total_alumnos": total_alumnos or 0,
            "matriculas_activas": matriculas_activas or 0,
            "ingresos_mes": float(ingresos_mes),
            "instructores_activos": instructores_activos or 0,
            "autos_activos": autos_activos or 0
        },
        "matriculas_por_mes": [
            {"mes": m, "cantidad": c} for m, c in matriculas_por_mes
        ],
        "ingresos_por_mes": [
            {"mes": m, "total": float(t)} for m, t in ingresos_por_mes
        ],
        "actividad_hoy": reservas_hoy[:10],  # Limitar a 10
        "actividad_manana": reservas_manana[:10],  # Limitar a 10
        "alertas": {
            "matriculas_por_vencer": [
                {
                    "matricula_id": id_mat,
                    "alumno": f"{n} {a}",
                    "vence": f.strftime('%d/%m/%Y'),
                    "dias_restantes": (f - hoy).days
                } for n, a, f, id_mat in matriculas_vencer
            ],
            "pagos_pendientes": pagos_pendientes[:5]
        }
    }