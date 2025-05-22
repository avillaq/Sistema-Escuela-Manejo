from app.models.usuario import Usuario
from app.models.administrador import Administrador
from app.extensions import db, guard
from werkzeug.exceptions import BadRequest

def crear_administrador(data):
    dni = data["dni"]
    if Usuario.query.filter_by(nombre_usuario=dni).first():
        raise BadRequest("Ya existe un usuario con este DNI")

    # Crear usuario
    usuario = Usuario(
        nombre_usuario=dni,
        contraseña_hash=guard.hash_password(dni),
        rol="admin"
    )
    db.session.add(usuario)
    db.session.flush()

    # Crear administrador
    administrador = Administrador(
        id_usuario=usuario.id,
        nombre=data["nombre"],
        apellidos=data["apellidos"],
        dni=dni,
        telefono=data["telefono"]
    )
    db.session.add(administrador)
    db.session.commit()
    return administrador

def actualizar_administrador(administrador_id, data):
    administrador = Administrador.query.get_or_404(administrador_id)

    for campo in ["nombre", "apellidos", "telefono"]:
        if campo in data:
            setattr(administrador, campo, data[campo])
    
    if administrador.usuario:
        administrador.usuario.activo = administrador.usuario.activo
    
    db.session.commit()
    return administrador

def eliminar_administrador(administrador_id):
    administrador = Administrador.query.get_or_404(administrador_id)
    usuario = administrador.usuario

    db.session.delete(administrador)
    if usuario:
        db.session.delete(usuario)
    db.session.commit()