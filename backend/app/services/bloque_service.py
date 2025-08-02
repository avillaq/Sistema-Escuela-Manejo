from datetime import timedelta, datetime
from app.models import Bloque, Matricula
from werkzeug.exceptions import BadRequest
from app.datetime_utils import now_peru

def obtener_bloques_semanal(id_alumno=None, por_admin=False, semana_offset=0):
    # semana_offset: -1 (anterior), 0 (actual), 1 (siguiente)
    
    # Restricción de semanas según tipo de usuario
    if not por_admin and semana_offset not in [-1, 0, 1]:
        raise BadRequest("Los alumnos solo pueden ver la semana actual o las adyacentes (anterior o siguiente).")

    ahora = now_peru()
    hoy = ahora.date() 
    
    # Calcular el lunes de la semana objetivo
    dias_desde_lunes = hoy.weekday()  # 0 = lunes, 6 = domingo
    lunes_semana_actual = hoy - timedelta(days=dias_desde_lunes)
    lunes_semana_objetivo = lunes_semana_actual + timedelta(weeks=semana_offset)
    
    # Rango de la semana (lunes a domingo)
    fecha_inicio = lunes_semana_objetivo
    fecha_fin = lunes_semana_objetivo + timedelta(days=6)
    
    # Obtener todos los bloques de la semana
    bloques = Bloque.query.filter(
        Bloque.fecha >= fecha_inicio,
        Bloque.fecha <= fecha_fin
    ).order_by(Bloque.fecha, Bloque.hora_inicio).all()
    
    # Verificar matrícula activa para alumnos
    if id_alumno:
        matricula = Matricula.query.filter(
            Matricula.id_alumno == id_alumno,
            Matricula.fecha_limite >= ahora,
        ).order_by(Matricula.fecha_matricula.desc()).first()
        
        if not matricula:
            return []

        # Obtener la fecha limite de la matrícula 
        fecha_limite = matricula.fecha_limite
        if isinstance(fecha_limite, datetime):
            fecha_limite = fecha_limite.date()

        # Filtrar bloques que no excedan la fecha limite de la matrícula
        bloques_filtrados = []
        for bloque in bloques:
            fecha_bloque = bloque.fecha
            if fecha_bloque <= fecha_limite:
                bloques_filtrados.append(bloque)
        
        return bloques_filtrados

    return bloques