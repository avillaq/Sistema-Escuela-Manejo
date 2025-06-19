from flask import Blueprint, request, jsonify
import flask_praetorian
from app.extensions import guard, blacklist
from app.schemas.login import LoginSchema

auth_bp = Blueprint("auth", __name__)
login_schema = LoginSchema()

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    errors = login_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    usuario = guard.authenticate(data["nombre_usuario"], data["contraseña"])
    token = guard.encode_jwt_token(usuario)

    return jsonify({
        "access_token": token,
        "usuario_id": usuario.id,
        "rol": usuario.rol
    }), 200

@auth_bp.route("/logout", methods=["POST"])
@flask_praetorian.auth_required
def logout():
    token = guard.read_token_from_header()
    data = guard.extract_jwt_token(token)
    blacklist.add_token(token, data["exp"])
    return jsonify({
        "message": "Logout exitoso"
    }), 200

@auth_bp.route("/me", methods=["GET"])
@flask_praetorian.auth_required
def usuario_actual():
    current_user = flask_praetorian.current_user()
    return jsonify({
        "id": current_user.id,
        "nombre_usuario": current_user.nombre_usuario,
        "rol": current_user.rol
    }), 200
