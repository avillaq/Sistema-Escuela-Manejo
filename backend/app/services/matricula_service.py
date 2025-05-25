from app.models.matricula import Matricula
from app.models.alumno import Alumno
from app.models.paquete import Paquete
from app.extensions import db
from werkzeug.exceptions import BadRequest

def crear_matricula(data): # TODO: analizar si es mejor añadir un paquete "por horas" para alumnos A-II, ya que si no tienen paquete, como sabremos por cuantas horas han pagado?

    alumno = Alumno.query.get_or_404(data["id_alumno"])
    id_paquete = data.get("id_paquete")

    if alumno.categoria == "A-I":
        if not id_paquete:
            raise BadRequest("Alumnos A-I requieren un paquete")
        paquete = Paquete.query.get_or_404(id_paquete)
    else:
        id_paquete = None

    # TODO: la fecha limite de la matricula se calcula 30 días después de la primera clase del alumno, no aqui
    #fecha_limite = fecha_matricula + timedelta(days=30)

    # la fecha de matricula se guarda como la fecha actual de manera automatica
    matricula = Matricula(
        id_alumno=alumno.id,
        id_paquete=id_paquete,
    )
    db.session.add(matricula)
    db.session.commit()
    return matricula

def listar_matriculas():
    return Matricula.query.all()  # TODO: agregar filtros y paginación

def actualizar_matricula(matricula_id, data):
    matricula = Matricula.query.get_or_404(matricula_id)

    if "estado" in data:
        matricula.estado = data["estado"]

    if "id_paquete" in data:
        matricula.id_paquete = data["id_paquete"] or None  # null si no hay paquete

    db.session.commit()
    return matricula

def eliminar_matricula(matricula_id):
    matricula = Matricula.query.get_or_404(matricula_id)
    db.session.delete(matricula)# TODO: Analizar si se debe eliminar o desactivar
    db.session.commit()
    return matricula