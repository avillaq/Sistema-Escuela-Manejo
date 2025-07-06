from flask import Blueprint, request, jsonify
from app.services.ticket_service import listar_tickets_admin, listar_tickets_instructor, obtener_estadisticas_tickets
from app.schemas.ticket import TicketSchema
import flask_praetorian
from datetime import datetime
from werkzeug.exceptions import BadRequest

tickets_bp = Blueprint("tickets", __name__)
ver_schema = TicketSchema()

@tickets_bp.route("/", methods=["GET"])
@flask_praetorian.roles_accepted("admin", "instructor")
def listar_tickets():
    current_usuario = flask_praetorian.current_user()
    
    # Parámetros de filtrado y paginación
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    busqueda = request.args.get("busqueda", None)
    fecha_inicio = request.args.get("fecha_inicio", None)
    fecha_fin = request.args.get("fecha_fin", None)
    id_instructor = request.args.get("id_instructor", type=int, default=None)

    per_page = min(per_page, 100)

    # Convertir fechas si vienen como string
    if fecha_inicio:
        try:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
        except ValueError:
            fecha_inicio = None
    
    if fecha_fin:
        try:
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
        except ValueError:
            fecha_fin = None

    if current_usuario.rol == "admin":
        resultado = listar_tickets_admin(
            page=page,
            per_page=per_page,
            busqueda=busqueda,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            id_instructor=id_instructor
        )
    elif id_instructor:
        resultado = listar_tickets_instructor(
            instructor_id=id_instructor,
            page=page,
            per_page=per_page,
            busqueda=busqueda,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin
        )
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

    return jsonify({
        "tickets": [serializar_ticket(t) for t in resultado.items],
        "pagination": {
            "page": resultado.page,
            "per_page": resultado.per_page,
            "total": resultado.total,
            "pages": resultado.pages,
            "has_next": resultado.has_next,
            "has_prev": resultado.has_prev
        }
    }), 200


@tickets_bp.route("/estadisticas", methods=["GET"])
@flask_praetorian.roles_accepted("admin", "instructor")
def obtener_estadisticas():
    current_usuario = flask_praetorian.current_user()
    id_instructor = request.args.get("id_instructor", type=int, default=None)

    if current_usuario.rol == "admin":
        id_instructor = None
    if current_usuario.rol == "instructor" and not id_instructor:
        raise BadRequest("El ID del instructor es requerido para obtener estadísticas")
    
    estadisticas = obtener_estadisticas_tickets(id_instructor)
    return jsonify(estadisticas), 200