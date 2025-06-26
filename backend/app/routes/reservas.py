from flask import Blueprint, request, jsonify
from app.schemas.reserva import CrearReservasSchema, ReservaSchema, EliminarReservasSchema
from app.services.reserva_service import crear_reservas, eliminar_reservas, listar_reservas, listar_reservas_hoy, listar_reservas_actuales
from app.models.matricula import Matricula
import flask_praetorian

reservas_bp = Blueprint("reservas", __name__)
crear_schema = CrearReservasSchema()
eliminar_schema = EliminarReservasSchema()
ver_schema = ReservaSchema()

@reservas_bp.route("/", methods=["POST"])
@flask_praetorian.roles_accepted("admin", "alumno")
def crear_reservas_route():
    data = request.get_json()
    errors = crear_schema.validate(data)
    if errors:
        return jsonify(errors), 400
        
    # Para alumnos, validar que solo pueden reservar sus propias matrículas
    current_user = flask_praetorian.current_user()
    es_admin = current_user.rol == "admin"

    reservas = crear_reservas(data, por_admin=es_admin)
    return jsonify({
        "mensaje": f"Se han creado {len(reservas)} reservas correctamente",
        "reservas": ver_schema.dump(reservas, many=True)
    }), 201

@reservas_bp.route("/", methods=["DELETE"])
@flask_praetorian.roles_accepted("admin", "alumno")
def cancelar_reservas():
    data = request.get_json()
    errors = eliminar_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    current_user = flask_praetorian.current_user()
    reservas = eliminar_reservas(data, por_admin=(current_user.rol == "admin"))
    return jsonify({
        "mensaje": "Reservas canceladas",
        "reservas": ver_schema.dump(reservas, many=True)
    }), 200

@reservas_bp.route("/", methods=["GET"])
@flask_praetorian.roles_accepted("admin", "alumno")
def obtener_reservas(): 
    current_user = flask_praetorian.current_user()
    id_alumno = request.args.get("id_alumno", type=int)
    semana_offset = request.args.get("semana", type=int, default=0)  # -1, 0, 1
    es_admin = current_user.rol == "admin"

    reservas = listar_reservas(id_alumno=id_alumno, por_admin=es_admin, semana_offset=semana_offset)
    
    return jsonify(ver_schema.dump(reservas, many=True)), 200

@reservas_bp.route("/actuales", methods=["GET"])
@flask_praetorian.roles_accepted("admin")
def obtener_reservas_actuales(): 
    reservas = listar_reservas_actuales()
    
    return jsonify(ver_schema.dump(reservas, many=True)), 200

@reservas_bp.route("/hoy", methods=["GET"])
@flask_praetorian.roles_accepted("admin")
def obtener_reservas_hoy(): 
    reservas = listar_reservas_hoy()
    
    return jsonify(ver_schema.dump(reservas, many=True)), 200

