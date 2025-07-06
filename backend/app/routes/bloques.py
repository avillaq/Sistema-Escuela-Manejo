from flask import Blueprint, jsonify, request
import flask_praetorian
from app.schemas.bloque import BloqueSchema
from app.services.bloque_service import obtener_bloques_semanal
from app.extensions import cache

bloques_bp = Blueprint("bloques", __name__)
ver_schema = BloqueSchema()

@bloques_bp.route("/semanal", methods=["GET"])
@flask_praetorian.roles_accepted("alumno", "admin")
def obtener_bloques():
    current_user = flask_praetorian.current_user()
    es_admin = current_user.rol == "admin"
    id_alumno = request.args.get("id_alumno", type=int, default=None)  # Solo necesario si es admin
    semana_offset = request.args.get("semana", type=int, default=0)  # -1, 0, 1

    # cache basado en parametros
    if id_alumno is None: # Calendario general
        cache_key = f"bloques_semanal_{semana_offset}_{es_admin}"
        bloques = cache.get(cache_key)
        if bloques is None:
            bloques = obtener_bloques_semanal(id_alumno=id_alumno, por_admin=es_admin, semana_offset=semana_offset)
            cache.set(cache_key, bloques, timeout=180)  # 3 minutos
    else:
        bloques = obtener_bloques_semanal(id_alumno=id_alumno, por_admin=es_admin, semana_offset=semana_offset)

    return jsonify(ver_schema.dump(bloques, many=True)), 200
