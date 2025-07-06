from datetime import datetime, timedelta, date
from app.models.bloque import Bloque
from app.models.reserva import Reserva
from app.models.asistencia import Asistencia
from app.models.matricula import Matricula
from app.models.alumno import Alumno
from app.models.paquete import Paquete
from app.models.pago import Pago
from app.extensions import db
from sqlalchemy import func, desc, or_
from werkzeug.exceptions import BadRequest

def crear_matricula(data):
    alumno = Alumno.query.get_or_404(data["id_alumno"])
    
    # Validar que el alumno esté activo
    if not alumno.activo:
        raise BadRequest("El alumno no está activo")
    
    # Validar que el alumno no tenga una matrícula activa segun su estado de clases
    if any(matricula.estado_clases in ["en_progreso", "pendiente"] for matricula in alumno.matriculas):
        raise BadRequest("El alumno ya tiene una matrícula activa")

    tipo_contratacion = data["tipo_contratacion"]
    categoria = data["categoria"]

    fecha_matricula = datetime.now()
    fecha_limite = fecha_matricula + timedelta(days=30)

    if tipo_contratacion == "paquete":
        id_paquete = data.get("id_paquete")
        if not id_paquete:
            raise BadRequest("Las matrículas por paquete requieren un paquete")
            
        paquete = Paquete.query.get_or_404(id_paquete)
        
        # Crear matricula por paquete
        matricula = Matricula(
            id_alumno=alumno.id,
            id_paquete=id_paquete,
            categoria=categoria,
            tipo_contratacion="paquete",
            costo_total=paquete.costo_total,
            fecha_limite=fecha_limite,
        )

    elif tipo_contratacion == "por_hora":
        # Validar que se proporcionen las horas y tarifa
        if "horas_contratadas" not in data or "tarifa_por_hora" not in data:
            raise BadRequest("Las matrículas por hora requieren horas contratadas y tarifa por hora")
            
        horas_contratadas = data["horas_contratadas"]
        tarifa_por_hora = data["tarifa_por_hora"]
        
        # Calcular costo total
        costo_total = horas_contratadas * tarifa_por_hora
        
        # Crear matricula por hora
        matricula = Matricula(
            id_alumno=alumno.id,
            id_paquete=None,  # Sin paquete
            categoria=categoria,
            tipo_contratacion="por_hora",
            horas_contratadas=horas_contratadas,
            tarifa_por_hora=tarifa_por_hora,
            costo_total=costo_total,
            fecha_limite=fecha_limite,
        )
    else:
        raise BadRequest("Tipo de contratación no válido")

    db.session.add(matricula)
    db.session.commit()
    return matricula

def listar_matriculas(
    page=1,
    per_page=20,
    busqueda=None,
    estado_clases=None,
    estado_pago=None,
    tipo_contratacion=None,
    id_matricula=None,
    id_alumno=None
):
    if id_matricula or id_alumno:
        if id_matricula:
            # Validar que la matrícula exista
            matricula = Matricula.query.get_or_404(id_matricula)
        else:
            # Validar que el alumno exista
            alumno = Alumno.query.get_or_404(id_alumno)
            # Validar que el alumno tenga una matrícula
            matricula = Matricula.query.filter_by(id_alumno=alumno.id).first_or_404()
        
        # Calcular pagos realizados
        pagos_realizados = db.session.query(func.sum(Pago.monto)).filter_by(id_matricula=matricula.id).scalar() or 0.0

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

        # Horas disponibles para nuevas reservas
        if matricula.tipo_contratacion == "paquete":
            horas_contratadas = matricula.paquete.horas_total
        else:
            horas_contratadas = matricula.horas_contratadas
        
        horas_disponibles_reserva = horas_contratadas - matricula.horas_completadas - reservas_pendientes
        
        # atributos temporales
        matricula.pagos_realizados = float(pagos_realizados)
        matricula.saldo_pendiente = float(matricula.costo_total - pagos_realizados)
        matricula.reservas_pendientes = reservas_pendientes
        matricula.horas_disponibles_reserva = horas_disponibles_reserva
        
        return matricula

    else:  
        query = db.session.query(Matricula).join(Alumno).outerjoin(Paquete)

        # Filtro por busqueda
        if busqueda:
            busqueda_like = f"%{busqueda.lower()}%"
            query = query.filter(
                or_(
                    Alumno.nombre.ilike(busqueda_like),
                    Alumno.apellidos.ilike(busqueda_like),
                    Alumno.dni.ilike(busqueda_like),
                )
            )
        
        # Filtro por estado de clases
        if estado_clases:
            query = query.filter(Matricula.estado_clases == estado_clases)
        
        # Filtro por estado de pago
        if estado_pago:
            query = query.filter(Matricula.estado_pago == estado_pago)
        
        # Filtro por tipo de contratacion
        if tipo_contratacion:
            query = query.filter(Matricula.tipo_contratacion == tipo_contratacion)
        
        # Ordenación
        query = query.order_by(desc(Matricula.fecha_matricula), desc(Matricula.id))
        
        # Paginación
        resultado = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        for matricula in resultado.items:
            # Calcular pagos realizados
            pagos_realizados = db.session.query(func.sum(Pago.monto)).filter_by(id_matricula=matricula.id).scalar() or 0.0
            
            #  atributos temporales
            matricula.pagos_realizados = float(pagos_realizados)
            matricula.saldo_pendiente = float(matricula.costo_total - pagos_realizados)
        
        return resultado

def obtener_estadisticas_matriculas():
    try:
        total_matriculas = db.session.query(func.count(Matricula.id)).scalar() or 0

        # Estadisticas por estado de clases
        en_progreso = db.session.query(func.count(Matricula.id)).filter(
            Matricula.estado_clases == 'en_progreso'
        ).scalar() or 0
        
        completadas = db.session.query(func.count(Matricula.id)).filter(
            Matricula.estado_clases == 'completado'
        ).scalar() or 0

        # Estadisticas financieras basica
        ingresos_totales = db.session.query(func.sum(Pago.monto)).scalar() or 0.0
        
        # Saldo total pendiente
        saldo_pendiente_total = 0.0
        matriculas_activas = db.session.query(Matricula).filter(
            Matricula.estado_clases.in_(['pendiente', 'en_progreso'])
        ).all()
        
        for matricula in matriculas_activas:
            pagos_matricula = db.session.query(func.sum(Pago.monto)).filter(
                Pago.id_matricula == matricula.id
            ).scalar() or 0.0
            saldo_pendiente_total += matricula.costo_total - pagos_matricula
        
        
        return {
            "total": total_matriculas,
            "en_progreso": en_progreso,
            "completadas": completadas,
            "ingresos_totales": float(ingresos_totales),
            "saldo_pendiente_total": float(saldo_pendiente_total),
        }
        
    except Exception as e:
        print(f"Error al obtener estadísticas de matrículas: {e}")
        return {
            "total": 0,
            "en_progreso": 0,
            "completadas": 0,
            "ingresos_totales": 0.0,
            "saldo_pendiente_total": 0.0,
        }


def eliminar_matricula(matricula_id):
    matricula = Matricula.query.get_or_404(matricula_id)
    db.session.delete(matricula)# TODO: Analizar si se debe eliminar o desactivar
    db.session.commit()
    return matricula