from flask import Blueprint, request, jsonify
import flask_praetorian
from app.extensions import guard, blacklist
from app.schemas.login import LoginSchema, CambioContrasenaSchema
from app.models import Alumno, Instructor, Administrador
from werkzeug.exceptions import BadRequest
from app.extensions import db, limiter

auth_bp = Blueprint("auth", __name__)
login_schema = LoginSchema()
cambio_contrasena_schema = CambioContrasenaSchema()

def get_user_data(usuario):
    user_models = {
        "alumno": Alumno,
        "instructor": Instructor,
        "admin": Administrador
    }
    
    model = user_models.get(usuario.rol)
    if not model:
        raise BadRequest("Rol de usuario no válido")
    
    user_instance = model.query.filter_by(id_usuario=usuario.id).first()
    if not user_instance:
        raise BadRequest("Usuario no encontrado")
    
    return {
        "id": user_instance.id,
        "nombre": user_instance.nombre,
        "apellidos": user_instance.apellidos,
        "dni": user_instance.dni,
        "telefono": user_instance.telefono,
        "email": user_instance.email,
        "activo": user_instance.activo
    }

@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()
    errors = login_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    usuario = guard.authenticate(data["nombre_usuario"], data["contrasena"])
    token = guard.encode_jwt_token(usuario)
    
    user_data = get_user_data(usuario)
    
    response_data = {
        "access_token": token,
        "rol": usuario.rol,
        "user": user_data
    }

    return jsonify(response_data), 200

@auth_bp.route("/refresh", methods=["POST"])
@limiter.limit("5 per minute")
def refresh():
    old_token = guard.read_token_from_header()
    new_token = guard.refresh_jwt_token(old_token)
    response_data = {
        "access_token": new_token
    }
    return jsonify(response_data), 200

@auth_bp.route("/logout", methods=["POST"])
@limiter.limit("5 per minute")
@flask_praetorian.auth_required
def logout():
    token = guard.read_token_from_header()
    data = guard.extract_jwt_token(token)
    blacklist.add_token(token, data["exp"])
    return jsonify({"message": "Logout exitoso"}), 200

@auth_bp.route("/cambio-contrasena", methods=["POST"])
@limiter.limit("3 per minute") 
@flask_praetorian.auth_required
def cambio_contrasena():
    try:
        data = request.get_json()
        errors = cambio_contrasena_schema.validate(data)
        if errors:
            raise BadRequest("Datos de cambio de contraseña inválidos")

        # Obtener el usuario actual
        current_user = flask_praetorian.current_user()
        
        # Verificar la contraseña actual
        if not guard._verify_password(data["contrasena_actual"], current_user.contraseña_hash):
            raise BadRequest("Contraseña actual incorrecta")
        
        # Cambiar la contraseña
        current_user.contraseña_hash = guard.hash_password(data["contrasena_nueva"])
        db.session.commit()
        
        return jsonify({"mensaje": "Contraseña actualizada exitosamente"}), 200
        
    except BadRequest:
        db.session.rollback()
        raise
    except Exception as e:
        db.session.rollback()
        raise BadRequest("Error interno del servidor")