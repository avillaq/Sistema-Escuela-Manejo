from flask import Blueprint, jsonify, request
from app.schemas.alumno import CrearAlumnoSchema, AlumnoSchema
from app.services.alumno_service import crear_alumno
from app.extensions import guard

alumnos_bp = Blueprint('alumnos', __name__)

crear_schema = CrearAlumnoSchema()
ver_schema = AlumnoSchema()

@alumnos_bp.route("/", methods=["POST"])
@guard.roles_required("admin") 
def registrar_alumno():
    data = request.get_json()
    errors = crear_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    alumno = crear_alumno(data)
    return ver_schema.dump(alumno), 201
