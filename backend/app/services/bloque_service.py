from datetime import date, timedelta
from app.models import Bloque, Matricula

def obtener_bloques_disponibles(id_alumno, por_admin=False):
    dias = 7
    hoy = date.today()
    fecha_fin = hoy + timedelta(days=dias)
    
    # Si es administrador, mostrar todos los bloques
    if por_admin:
        return Bloque.query.filter(
            Bloque.fecha >= hoy,
            Bloque.fecha <= fecha_fin,
            Bloque.reservas_actuales < Bloque.capacidad_max
        ).order_by(Bloque.fecha, Bloque.hora_inicio).all()
    
    matricula = Matricula.query.filter(
        Matricula.id_alumno == id_alumno,
        Matricula.fecha_limite >= hoy
    ).order_by(Matricula.fecha_matricula.desc()).first()

    if not matricula:
        return []


    # - Para alumno A-II (sin admin): mostrar desde mañana
    # - Para todos los demás casos: mostrar desde hoy
    categoria = matricula.categoria
    fecha_inicial = hoy + timedelta(days=1) if (categoria == "A-II") else hoy

    bloques = Bloque.query.filter(
        Bloque.fecha >= fecha_inicial,
        Bloque.fecha <= fecha_fin,
        Bloque.reservas_actuales < Bloque.capacidad_max
    ).order_by(Bloque.fecha, Bloque.hora_inicio).all()

    return bloques