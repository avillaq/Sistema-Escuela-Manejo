from flask import Blueprint, request, jsonify
from app.schemas.asistencia import CrearAsistenciaSchema
from app.services.asistencia_service import registrar_asistencia
import flask_praetorian

asistencias_bp = Blueprint("asistencias", __name__)
crear_schema = CrearAsistenciaSchema()

@asistencias_bp.route("/", methods=["POST"])
@flask_praetorian.roles_required("admin")
def marcar_asistencia():
    data = request.get_json()
    errors = crear_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    asistencia, ticket = registrar_asistencia(data)
    if ticket is None:
        return jsonify({
            "asistencia_id": asistencia.id,
            "mensaje": "El alumno no asistió a la clase, no se generó un ticket."
        }), 201
    
    return jsonify({
        "asistencia_id": asistencia.id,
        "ticket": {
            "id": ticket.id,
            "numero_clase_dia": ticket.numero_clase_dia,
            "id_instructor": ticket.id_instructor,
            "id_auto": ticket.id_auto
        }
    }), 201
