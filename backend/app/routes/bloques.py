from flask import Blueprint, jsonify, request
import flask_praetorian
from app.schemas.bloque import BloqueSchema
from app.services.bloque_service import obtener_bloques_disponibles

bloques_bp = Blueprint("bloques", __name__)
ver_schema = BloqueSchema()

@bloques_bp.route("/disponibles", methods=["GET"])
@flask_praetorian.roles_accepted("alumno", "admin")
def ver_bloques_disponibles():
    current_user = flask_praetorian.current_user()
    es_admin = current_user.rol == "admin"
    id_alumno = None
    if not es_admin:
        id_alumno = current_user.id

    bloques = obtener_bloques_disponibles(id_alumno=id_alumno, por_admin=es_admin)
    return jsonify(ver_schema.dump(bloques, many=True)), 200
