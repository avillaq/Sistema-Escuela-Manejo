from datetime import date, timedelta
from app.models import Bloque, Matricula
from werkzeug.exceptions import BadRequest

def obtener_bloques_semanal(id_alumno=None, por_admin=False, semana_offset=0):
    # semana_offset: -1 (anterior), 0 (actual), 1 (siguiente)
    
    # Restricción de semanas según tipo de usuario
    if not por_admin and semana_offset not in [-1, 0, 1]:
        raise BadRequest("Los alumnos solo pueden ver la semana actual o las adyacentes (anterior o siguiente).")

    hoy = date.today()
    
    # Calcular el lunes de la semana objetivo
    dias_desde_lunes = hoy.weekday()  # 0 = lunes, 6 = domingo
    lunes_semana_actual = hoy - timedelta(days=dias_desde_lunes)
    lunes_semana_objetivo = lunes_semana_actual + timedelta(weeks=semana_offset)
    
    # Rango de la semana (lunes a domingo)
    fecha_inicio = lunes_semana_objetivo
    fecha_fin = lunes_semana_objetivo + timedelta(days=6)
    
    # Semanas pasadas, actuales y futuras
    bloques = Bloque.query.filter(
        Bloque.fecha >= fecha_inicio,
        Bloque.fecha <= fecha_fin
    ).order_by(Bloque.fecha, Bloque.hora_inicio).all()
    
    # Verificar matrícula activa para alumnos
    if id_alumno:
        matricula = Matricula.query.filter(
            Matricula.id_alumno == id_alumno,
            Matricula.fecha_limite >= hoy
        ).order_by(Matricula.fecha_matricula.desc()).first()
        
        if not matricula:
            return []

    return bloques