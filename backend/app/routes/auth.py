from flask import Blueprint, request, jsonify
import flask_praetorian
from app.extensions import guard, blacklist
from app.schemas.login import LoginSchema
from app.models import Alumno, Instructor, Administrador
from werkzeug.exceptions import BadRequest

auth_bp = Blueprint("auth", __name__)
login_schema = LoginSchema()

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
def login():
    data = request.get_json()
    errors = login_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    usuario = guard.authenticate(data["nombre_usuario"], data["contraseña"])
    token = guard.encode_jwt_token(usuario)
    
    user_data = get_user_data(usuario)
    
    response_data = {
        "access_token": token,
        "rol": usuario.rol,
        "user": user_data
    }

    return jsonify(response_data), 200

@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    old_token = guard.read_token_from_header()
    new_token = guard.refresh_jwt_token(old_token)
    response_data = {
        "access_token": new_token
    }
    return jsonify(response_data), 200

@auth_bp.route("/logout", methods=["POST"])
@flask_praetorian.auth_required
def logout():
    token = guard.read_token_from_header()
    data = guard.extract_jwt_token(token)
    blacklist.add_token(token, data["exp"])
    return jsonify({"message": "Logout exitoso"}), 200
