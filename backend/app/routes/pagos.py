from flask import Blueprint, request, jsonify
from app.schemas.pago import CrearPagoSchema, PagoSchema
from app.services.pago_service import crear_pago, listar_pagos, obtener_pago
import flask_praetorian

pagos_bp = Blueprint("pagos", __name__)
crear_schema = CrearPagoSchema()
ver_schema = PagoSchema()

@pagos_bp.route("/", methods=["POST"])
#@flask_praetorian.roles_required("admin")
def registrar_pago():
    data = request.get_json()
    errors = crear_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    pago = crear_pago(data)
    return ver_schema.dump(pago), 201

@pagos_bp.route("/", methods=["GET"])
#@flask_praetorian.roles_required("admin")
def obtener_pagos():
    pagos = listar_pagos()
    return jsonify(ver_schema.dump(pagos, many=True)), 200

@pagos_bp.route("/<int:id>", methods=["GET"])
#@flask_praetorian.roles_required("admin")
def obtener_pago_id(id):
    pago = obtener_pago(id)
    return ver_schema.dump(pago), 200
