from flask import Blueprint, request, jsonify
from app.schemas.asistencia import CrearAsistenciaSchema
from app.services.asistencia_service import registrar_asistencia, listar_asistencias
import flask_praetorian
from app.models import Asistencia, Reserva, Bloque, Matricula, Ticket, Alumno
from app import db

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
            "numero_clase_alumno": ticket.numero_clase_alumno,
            "id_instructor": ticket.id_instructor,
            "id_auto": ticket.id_auto
        }
    }), 201

@asistencias_bp.route("/", methods=["GET"])
@flask_praetorian.roles_accepted("alumno")
def obtener_asistencias():
    try:
        current_user = flask_praetorian.current_user()
        id_usuario = current_user.id

        asistencias = listar_asistencias(id_usuario=id_usuario)
        
        resultado = []
        for index, asistencia in enumerate(asistencias):
            item = {
                "id": asistencia.id,
                "asistio": asistencia.asistio,
                "fecha_clase": asistencia.fecha_clase.isoformat() if asistencia.fecha_clase else None,
                "hora_inicio": asistencia.hora_inicio.strftime('%H:%M') if asistencia.hora_inicio else None,
                "hora_fin": asistencia.hora_fin.strftime('%H:%M') if asistencia.hora_fin else None,
                "numero_clase_alumno": (len(asistencias) - index)
            }
            resultado.append(item)
        return jsonify(resultado), 200
        
    except Exception as e:
        return jsonify({"mensaje": "Error interno del servidor"}), 500