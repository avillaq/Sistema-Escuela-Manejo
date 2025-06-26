from flask import Blueprint, jsonify, request
from app.schemas.administrador import CrearAdministradorSchema, AdministradorSchema, ActualizarAdministradorSchema
from app.services.administrador_service import crear_administrador, actualizar_administrador, eliminar_administrador
import flask_praetorian
from app.models.administrador import Administrador
 
administradores_bp = Blueprint('administradores', __name__)

crear_schema = CrearAdministradorSchema()
ver_schema = AdministradorSchema()
actualizar_schema = ActualizarAdministradorSchema()

@administradores_bp.route("/", methods=["POST"])
@flask_praetorian.roles_required("admin")
def registrar_administrador():
    data = request.get_json()
    errors = crear_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    administrador = crear_administrador(data)
    return ver_schema.dump(administrador), 201

@administradores_bp.route("/", methods=["GET"])
@flask_praetorian.roles_required("admin")
def listar_administradores():
    administradores = Administrador.query.all() #TODO: Falta paginación pero como son pocos no es necesario creo
    return jsonify(ver_schema.dump(administradores, many=True)), 200

@administradores_bp.route("/<int:administrador_id>", methods=["GET"])
@flask_praetorian.roles_required("admin")
def obtener_administrador(administrador_id):
    administrador = Administrador.query.get_or_404(administrador_id)
    return ver_schema.dump(administrador), 200

@administradores_bp.route("/<int:administrador_id>", methods=["PUT"])
@flask_praetorian.roles_required("admin")
def editar_administrador(administrador_id):
    data = request.get_json()
    errors = actualizar_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    administrador = actualizar_administrador(administrador_id, data)
    return ver_schema.dump(administrador), 200

@administradores_bp.route("/<int:administrador_id>", methods=["DELETE"])
@flask_praetorian.roles_required("admin")
def eliminar_administrador_route(administrador_id):
    eliminar_administrador(administrador_id)
    return jsonify({"mensaje": "Administrador eliminado"}), 200