from datetime import date, timedelta
from app.models import Bloque, Matricula

def obtener_bloques_semanal(id_alumno=None, por_admin=False, semana_offset=0):
    # semana_offset: -1 (anterior), 0 (actual), 1 (siguiente)

    hoy = date.today()
    
    # Calcular el lunes de la semana objetivo
    dias_desde_lunes = hoy.weekday()  # 0 = lunes, 6 = domingo
    lunes_semana_actual = hoy - timedelta(days=dias_desde_lunes)
    lunes_semana_objetivo = lunes_semana_actual + timedelta(weeks=semana_offset)
    
    # Rango de la semana (lunes a domingo)
    fecha_inicio = lunes_semana_objetivo
    fecha_fin = lunes_semana_objetivo + timedelta(days=6)
    
    # Para semanas pasadas, mostrar todos los bloques (incluso los completos)
    # Para semana actual y futuras, solo mostrar disponibles
    if semana_offset < 0:
        # Semanas pasadas: mostrar todos los bloques
        bloques = Bloque.query.filter(
            Bloque.fecha >= fecha_inicio,
            Bloque.fecha <= fecha_fin
        ).order_by(Bloque.fecha, Bloque.hora_inicio).all()
    else:
        # Semana actual y futuras: solo bloques disponibles
        if por_admin:
            # Admins ven todos los bloques (disponibles y no disponibles)
            bloques = Bloque.query.filter(
                Bloque.fecha >= fecha_inicio,
                Bloque.fecha <= fecha_fin
            ).order_by(Bloque.fecha, Bloque.hora_inicio).all()
        else:
            # Alumnos solo ven bloques disponibles para reservar
            bloques = Bloque.query.filter(
                Bloque.fecha >= fecha_inicio,
                Bloque.fecha <= fecha_fin,
                Bloque.reservas_actuales < Bloque.capacidad_max
            ).order_by(Bloque.fecha, Bloque.hora_inicio).all()
            
            # Verificar matrícula activa para alumnos
            if id_alumno:
                matricula = Matricula.query.filter(
                    Matricula.id_alumno == id_alumno,
                    Matricula.fecha_limite >= hoy
                ).order_by(Matricula.fecha_matricula.desc()).first()
                
                if not matricula and semana_offset >= 0:
                    return []

    return bloques