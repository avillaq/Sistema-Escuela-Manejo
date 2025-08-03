from flask import Blueprint, jsonify, request
from app.schemas.paquete import CrearPaqueteSchema, PaqueteSchema, ActualizarPaqueteSchema
from app.services.paquete_service import crear_paquete, listar_paquetes, actualizar_paquete, eliminar_paquete
import flask_praetorian
from app.models.paquete import Paquete
from app.extensions import cache

paquetes_bp = Blueprint('paquetes', __name__)

crear_schema = CrearPaqueteSchema()
ver_schema = PaqueteSchema()
actualizar_schema = ActualizarPaqueteSchema()

@paquetes_bp.route("/", methods=["POST"])
@flask_praetorian.roles_required("admin") 
def registrar_paquete():
    data = request.get_json()
    errors = crear_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    paquete = crear_paquete(data)
    cache.delete("paquetes_list")
    return ver_schema.dump(paquete), 201

@paquetes_bp.route("/", methods=["GET"])
@flask_praetorian.roles_required("admin")
@cache.cached(timeout=1800, key_prefix="paquetes_list")
def obtener_paquetes():
    paquetes = listar_paquetes() #TODO: Falta paginación
    return jsonify(ver_schema.dump(paquetes, many=True)), 200

@paquetes_bp.route("/<int:paquete_id>", methods=["GET"])
@flask_praetorian.roles_required("admin")
def obtener_paquete(paquete_id):
    paquete = Paquete.query.get_or_404(paquete_id)
    return ver_schema.dump(paquete), 200

@paquetes_bp.route("/<int:paquete_id>", methods=["PUT"])
@flask_praetorian.roles_required("admin")
def editar_paquete(paquete_id):
    data = request.get_json()
    errors = actualizar_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    paquete = actualizar_paquete(paquete_id, data)
    cache.delete("paquetes_list")
    return ver_schema.dump(paquete), 200