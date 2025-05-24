from app.models.usuario import Usuario
from app.models.instructor import Instructor
from app.extensions import db, guard
from werkzeug.exceptions import BadRequest

def crear_instructor(data):
    dni = data["dni"]
    if Usuario.query.filter_by(nombre_usuario=dni).first():
        raise BadRequest("Ya existe un usuario con este DNI")

    # Crear usuario
    usuario = Usuario(
        nombre_usuario=dni,
        contraseña_hash=guard.hash_password(dni),
        rol="instructor"
    )
    db.session.add(usuario)
    db.session.flush()

    # Crear instructor
    instructor = Instructor(
        id_usuario=usuario.id,
        nombre=data["nombre"],
        apellidos=data["apellidos"],
        dni=dni,
        telefono=data["telefono"]
    )
    db.session.add(instructor)
    db.session.commit()
    return instructor

def listar_instructores():
    return Instructor.query.all()  # TODO: agregar filtros y paginación

def actualizar_instructor(instructor_id, data):
    instructor = Instructor.query.get_or_404(instructor_id)

    for campo in ["nombre", "apellidos", "telefono", "activo"]:
        if campo in data:
            setattr(instructor, campo, data[campo])

    db.session.commit()
    return instructor

def eliminar_instructor(instructor_id):
    instructor = Instructor.query.get_or_404(instructor_id)
    instructor.activo = False
    db.session.commit()