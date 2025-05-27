from datetime import datetime, timedelta
from sqlalchemy import func, extract
from app.extensions import db
from app.models import Alumno, Matricula, Reserva, Pago, Bloque, Asistencia, Ticket

def obtener_reporte_admin():
    hoy = datetime.today().date()
    mañana = hoy + timedelta(days=1)

    # Alumnos activos y no activos
    subquery_activos = db.session.query(Matricula.id_alumno).filter(Matricula.fecha_limite >= hoy).distinct().subquery()
    total_activos = db.session.query(func.count()).select_from(subquery_activos).scalar()
    total_alumnos = db.session.query(Alumno.id).count()
    total_no_activos = total_alumnos - total_activos

    # Matriculas por mes (últimos 6 meses)
    matriculas_por_mes = db.session.query(
        func.date_format(Matricula.fecha_matricula, "%Y-%m").label("mes"),
        func.count(Matricula.id)
    ).group_by("mes").order_by("mes").all()

    # Rentabilidad por mes (últimos 6 meses)
    rentabilidad = db.session.query(
        func.date_format(Pago.fecha_pago, "%Y-%m").label("mes"),
        func.sum(Pago.monto)
    ).group_by("mes").order_by("mes").all()

    # Reservas hoy
    reservas_hoy = db.session.query(
        Bloque.hora_inicio,
        Alumno.nombre,
        Alumno.apellidos
    ).join(Reserva, Reserva.id_bloque == Bloque.id)\
     .join(Matricula, Reserva.id_matricula == Matricula.id)\
     .join(Alumno, Matricula.id_alumno == Alumno.id)\
     .filter(Bloque.fecha == hoy).all()

    # Reservas mañana
    reservas_manana = db.session.query(
        Bloque.hora_inicio,
        Alumno.nombre,
        Alumno.apellidos
    ).join(Reserva, Reserva.id_bloque == Bloque.id)\
     .join(Matricula, Reserva.id_matricula == Matricula.id)\
     .join(Alumno, Matricula.id_alumno == Alumno.id)\
     .filter(Bloque.fecha == mañana).all()

    # Matrículas por vencer (próximos 7 días)
    vencimiento_limite = hoy + timedelta(days=7)
    matriculas_vencer = db.session.query(
        Alumno.nombre,
        Alumno.apellidos,
        Matricula.fecha_limite
    ).join(Alumno).filter(
        Matricula.fecha_limite >= hoy,
        Matricula.fecha_limite <= vencimiento_limite
    ).all()

    # Matrículas sin pago completo
    pendientes = []
    matriculas = Matricula.query.all()
    for m in matriculas:
        if m.estado_pago != "completo":
            pagado = sum(p.monto for p in m.pagos)
            total = total = m.costo_total or 1  # evitar div 0
            pendientes.append({
                "alumno": f"{m.alumno.nombre} {m.alumno.apellidos}",
                "tipo": m.tipo_contratacion,
                "pagado": pagado,
                "total": total
            })

    return {
        "resumen_alumnos": {
            "activos": total_activos,
            "no_activos": total_no_activos
        },
        "matriculas_por_mes": [
            {"mes": m, "cantidad": c} for m, c in matriculas_por_mes
        ],
        "rentabilidad_por_mes": [
            {"mes": m, "total": float(t)} for m, t in rentabilidad
        ],
        "reservas_hoy": [
            {"bloque": str(h), "alumno": f"{n} {a}"} for h, n, a in reservas_hoy
        ],
        "reservas_manana": [
            {"bloque": str(h), "alumno": f"{n} {a}"} for h, n, a in reservas_manana
        ],
        "matriculas_por_vencer": [
            {"alumno": f"{n} {a}", "vence": str(f)} for n, a, f in matriculas_vencer
        ],
        "matriculas_pendientes_pago": pendientes
    }
