from flask import Blueprint, request, jsonify
from app.services.ticket_service import listar_tickets_admin, listar_tickets_instructor
from app.schemas.ticket import TicketSchema
import flask_praetorian

tickets_bp = Blueprint("tickets", __name__)
ver_schema = TicketSchema()

@tickets_bp.route("/", methods=["GET"])
@flask_praetorian.roles_accepted("admin", "instructor")
def listar_tickets():
    filtros = request.args.to_dict()
    current_usuario = flask_praetorian.current_user()

    if current_usuario.rol == "admin":
        tickets = listar_tickets_admin(filtros)
    elif current_usuario.rol == "instructor":
        tickets = listar_tickets_instructor(current_usuario.id, filtros)
    else:
        return jsonify({"error": "No autorizado"}), 403

    def serializar_ticket(t):
        alumno = t.asistencia.reserva.matricula.alumno
        return {
            **ver_schema.dump(t),
            "placa_auto": t.auto.placa,
            "marca_auto": t.auto.marca,
            "modelo_auto": t.auto.modelo,
            "color_auto": t.auto.color,
            "numero_clase_alumno": t.numero_clase_alumno,
            "fecha_asistencia": t.asistencia.fecha_asistencia,
            "nombre_alumno": f"{alumno.nombre} {alumno.apellidos}",
            "nombre_instructor": f"{t.instructor.nombre} {t.instructor.apellidos}"
        }

    return jsonify([serializar_ticket(t) for t in tickets]), 200
