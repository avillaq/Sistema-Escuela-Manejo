from flask import Blueprint, jsonify, request
from app.schemas.instructor import CrearInstructorSchema, InstructorSchema, ActualizarInstructorSchema
from app.services.instructor_service import crear_instructor, listar_instructores, actualizar_instructor, eliminar_instructor
import flask_praetorian
from app.models.instructor import Instructor
from app.extensions import cache
 
instructores_bp = Blueprint('instructores', __name__)

crear_schema = CrearInstructorSchema()
ver_schema = InstructorSchema()
actualizar_schema = ActualizarInstructorSchema()

@instructores_bp.route("/", methods=["POST"])
@flask_praetorian.roles_required("admin") 
def registrar_instructor():
    data = request.get_json()
    errors = crear_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    instructor = crear_instructor(data)
    cache.delete("instructores_list")
    return ver_schema.dump(instructor), 201

@instructores_bp.route("/", methods=["GET"])
@flask_praetorian.roles_required("admin")
@cache.cached(timeout=1800, key_prefix="instructores_list")
def obtener_instructores():
    instructores = listar_instructores()
    return jsonify(ver_schema.dump(instructores, many=True)), 200

@instructores_bp.route("/<int:instructor_id>", methods=["GET"])
@flask_praetorian.roles_accepted("admin", "instructor")
def obtener_instructor(instructor_id):
    instructor = Instructor.query.get_or_404(instructor_id)
    return ver_schema.dump(instructor), 200

@instructores_bp.route("/<int:instructor_id>", methods=["PUT"])
@flask_praetorian.roles_required("admin")
def editar_instructor(instructor_id):
    data = request.get_json()
    errors = actualizar_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    instructor = actualizar_instructor(instructor_id, data)
    cache.delete("instructores_list")
    return ver_schema.dump(instructor), 200

@instructores_bp.route("/<int:instructor_id>", methods=["DELETE"])
@flask_praetorian.roles_required("admin")
def eliminar_instructor_route(instructor_id):
    eliminar_instructor(instructor_id)
    cache.delete("instructores_list")
    return jsonify({"mensaje": "Instructor eliminado"}), 200