from flask import Blueprint, request, jsonify
from app.schemas.matricula import CrearMatriculaSchema, MatriculaSchema, MatriculaResumenSchema
from app.services.matricula_service import crear_matricula, listar_matriculas, eliminar_matricula, obtener_estado_cuenta
from app.models.matricula import Matricula
import flask_praetorian

matriculas_bp = Blueprint("matriculas", __name__)
crear_schema = CrearMatriculaSchema()
ver_schema = MatriculaSchema()
lista_schema = MatriculaResumenSchema()
individual_schema = MatriculaResumenSchema()

@matriculas_bp.route("/", methods=["POST"])
#@flask_praetorian.roles_required("admin")
def registrar_matricula():
    data = request.get_json()
    errors = crear_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    matricula = crear_matricula(data)
    return ver_schema.dump(matricula), 201

@matriculas_bp.route("/", methods=["GET"])
#@flask_praetorian.roles_required("admin")
def obtener_matriculas():
    matriculas = listar_matriculas()
    return jsonify(lista_schema.dump(matriculas, many=True)), 200

@matriculas_bp.route("/<int:id>", methods=["GET"])
#@flask_praetorian.roles_required("admin")
def obtener_matricula(id):
    matricula = listar_matriculas(id=id)
    return jsonify(individual_schema.dump(matricula)), 200

@matriculas_bp.route("/<int:id>", methods=["DELETE"])
#@flask_praetorian.roles_required("admin")
def eliminar_matricula_route(id):
    eliminar_matricula(id)
    return jsonify({"mensaje": "Matrícula eliminada"}), 200

@matriculas_bp.route("/<int:id>/estado-cuenta", methods=["GET"])
@flask_praetorian.roles_accepted("admin", "alumno")
def estado_cuenta_matricula(id):
    # Verificar permisos si es alumno
    current_user = flask_praetorian.current_user()
    if current_user.rol == "alumno":
        matricula = Matricula.query.get_or_404(id)
        if matricula.id_alumno != current_user.alumno.id:
            return jsonify({"error": "No tienes permiso para ver esta matrícula"}), 403
    
    estado_cuenta = obtener_estado_cuenta(id)
    return jsonify(estado_cuenta), 200