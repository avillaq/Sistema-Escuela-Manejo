from app.models.usuario import Usuario
from app.models.alumno import Alumno
from app.extensions import db, guard
from werkzeug.exceptions import BadRequest

def crear_alumno(data):
    dni = data["dni"]
    if Usuario.query.filter_by(nombre_usuario=dni).first():
        raise BadRequest("Ya existe un usuario con este DNI")

    # Crear usuario
    usuario = Usuario(
        nombre_usuario=dni,
        contraseña_hash=guard.hash_password(dni),
        rol="alumno"
    )
    db.session.add(usuario)
    db.session.flush()

    # Crear alumno
    alumno = Alumno(
        id_usuario=usuario.id,
        nombre=data["nombre"],
        apellidos=data["apellidos"],
        dni=dni,
        telefono=data["telefono"],
        email=data["email"],
        categoria=data["categoria"]
    )
    db.session.add(alumno)
    db.session.commit()
    return alumno

def actualizar_alumno(alumno_id, data):
    alumno = Alumno.query.get_or_404(alumno_id)

    for campo in ["nombre", "apellidos", "telefono", "email", "categoria"]:
        if campo in data:
            setattr(alumno, campo, data[campo])

    db.session.commit()
    return alumno

def eliminar_alumno(alumno_id): # TODO: La eliminacion solo es logica
    alumno = Alumno.query.get_or_404(alumno_id)
    usuario = alumno.usuario

    db.session.delete(alumno)
    db.session.delete(usuario)
    db.session.commit()
