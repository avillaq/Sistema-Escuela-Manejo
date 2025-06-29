from flask import Blueprint, jsonify, request
from app.schemas.alumno import CrearAlumnoSchema, AlumnoSchema, ActualizarAlumnoSchema
from app.services.alumno_service import crear_alumno, listar_alumnos, actualizar_alumno, eliminar_alumno
import flask_praetorian
from app.models.alumno import Alumno
from app.models.matricula import Matricula
 
from app.email_util import enviar_correo 

alumnos_bp = Blueprint('alumnos', __name__)

crear_schema = CrearAlumnoSchema()
ver_schema = AlumnoSchema()
actualizar_schema = ActualizarAlumnoSchema()

@alumnos_bp.route("/", methods=["POST"])
@flask_praetorian.roles_required("admin")
def registrar_alumno():
    data = request.get_json()
    errors = crear_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    alumno = crear_alumno(data)  # primero se crea
    if alumno.email:
        exito_envio = enviar_correo(
            destinatario=alumno.email,
            asunto="Registro exitoso en la escuela de conducción",
            cuerpo=f"Hola {alumno.nombre}, tu registro fue exitoso. ¡Bienvenido!"
        )
        if not exito_envio:
            return jsonify({
                "mensaje": "Alumno registrado, pero no se pudo enviar el correo."
            }), 201

    return ver_schema.dump(alumno), 201

@alumnos_bp.route("/", methods=["GET"])
@flask_praetorian.roles_required("admin")
def obtener_alumnos():
    alumnos = listar_alumnos()
    return jsonify(ver_schema.dump(alumnos, many=True)), 200

@alumnos_bp.route("/<int:alumno_id>", methods=["GET"])
@flask_praetorian.roles_required("admin")
def obtener_alumno(alumno_id):
    alumno = Alumno.query.get_or_404(alumno_id)
    return ver_schema.dump(alumno), 200

@alumnos_bp.route("/<int:alumno_id>", methods=["PUT"])
@flask_praetorian.roles_required("admin")
def editar_alumno(alumno_id):
    data = request.get_json()
    errors = actualizar_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    alumno = actualizar_alumno(alumno_id, data)
    return ver_schema.dump(alumno), 200

@alumnos_bp.route("/<int:alumno_id>", methods=["DELETE"])
@flask_praetorian.roles_required("admin")
def eliminar_alumno_route(alumno_id):
    eliminar_alumno(alumno_id)
    return jsonify({"mensaje": "Alumno eliminado"}), 200

# Obtener todos los alumnos que no tienen matrícula
@alumnos_bp.route("/sin_matricula", methods=["GET"])
@flask_praetorian.roles_required("admin")
def obtener_alumnos_sin_matricula():
    alumnos = Alumno.query.outerjoin(Matricula).filter(Matricula.id.is_(None)).all()
    return jsonify(ver_schema.dump(alumnos, many=True)), 200