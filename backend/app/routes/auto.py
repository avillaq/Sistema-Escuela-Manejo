from flask import Blueprint, jsonify, request
from app.schemas.auto import CrearAutoSchema, AutoSchema, ActualizarAutoSchema
from app.services.auto_service import crear_auto, listar_autos, actualizar_auto, eliminar_auto
import flask_praetorian
from app.models.auto import Auto
from app.extensions import cache

autos_bp = Blueprint('autos', __name__)

crear_schema = CrearAutoSchema()
ver_schema = AutoSchema()
actualizar_schema = ActualizarAutoSchema()

@autos_bp.route("/", methods=["POST"])
@flask_praetorian.roles_required("admin") 
def registrar_auto():
    data = request.get_json()
    errors = crear_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    auto = crear_auto(data)
    cache.delete("autos_list")
    return ver_schema.dump(auto), 201

@autos_bp.route("/", methods=["GET"])
@flask_praetorian.roles_required("admin")
@cache.cached(timeout=1800, key_prefix="autos_list") 
def obtener_autos():
    autos = listar_autos() #TODO: Falta paginación
    return jsonify(ver_schema.dump(autos, many=True)), 200

@autos_bp.route("/<int:auto_id>", methods=["GET"])
@flask_praetorian.roles_required("admin")
def obtener_auto(auto_id):
    auto = Auto.query.get_or_404(auto_id)
    return ver_schema.dump(auto), 200

@autos_bp.route("/<int:auto_id>", methods=["PUT"])
@flask_praetorian.roles_required("admin")
def editar_auto(auto_id):
    data = request.get_json()
    errors = actualizar_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    auto = actualizar_auto(auto_id, data)
    cache.delete("autos_list")
    return ver_schema.dump(auto), 200

@autos_bp.route("/<int:auto_id>", methods=["DELETE"])
@flask_praetorian.roles_required("admin")
def eliminar_auto_route(auto_id):
    eliminar_auto(auto_id)
    cache.delete("autos_list")
    return jsonify({"mensaje": "Auto eliminado"}), 200