from flask import Blueprint, request, jsonify
from app.schemas.reserva import CrearReservasSchema, ReservaSchema, EliminarReservasSchema
from app.services.reserva_service import crear_reservas, eliminar_reservas, listar_reservas
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

    if not es_admin:
        matricula = Matricula.query.get_or_404(data["id_matricula"])
        if current_user.alumno.id != matricula.id_alumno:
            return jsonify({"error": "No puedes crear reservas para otro alumno"}), 403

    reservas = crear_reservas(data, por_admin=es_admin)
    return jsonify({
        "mensaje": f"Se han creado {len(reservas)} reservas correctamente",
        "reservas": ver_schema.dump(reservas, many=True)
    }), 201

@reservas_bp.route("/", methods=["DELETE"])
@flask_praetorian.roles_accepted("alumno", "admin")
def cancelar_reservas():
    data = request.get_json()
    errors = eliminar_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    current_user = flask_praetorian.current_user()
    eliminar_reservas(data, current_user.id, por_admin=(current_user.rol == "admin"))
    return jsonify({"mensaje": "Reservas canceladas"}), 200

@reservas_bp.route("/", methods=["GET"])
@flask_praetorian.roles_accepted("admin", "alumno")
def obtener_reservas(): 
    current_user = flask_praetorian.current_user()
    data = request.get_json()
    es_admin = current_user.rol == "admin"
    reservas = listar_reservas(data, current_user.id, por_admin=es_admin)
    
    return jsonify(ver_schema.dump(reservas, many=True)), 200

