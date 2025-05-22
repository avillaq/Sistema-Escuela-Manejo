from flask import Blueprint, request, jsonify
from app.extensions import guard
from app.schemas.login import LoginSchema

auth_bp = Blueprint("auth", __name__)
login_schema = LoginSchema()

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    errors = login_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    usuario = guard.authenticate(data["nombre_usuario"], data["contrasena"])
    token = guard.encode_jwt_token(usuario)

    return jsonify({
        "access_token": token,
        "usuario_id": usuario.id,
        "rol": usuario.rol
    }), 200

@auth_bp.route("/me", methods=["GET"])
@guard.auth_required
def usuario_actual():
    current_user = guard.extract_jwt_token()
    return jsonify({
        "id": current_user.id,
        "nombre_usuario": current_user.nombre_usuario,
        "rol": current_user.rol
    }), 200
