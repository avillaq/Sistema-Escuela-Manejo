from flask import Blueprint, request, jsonify
from app.schemas.matricula import CrearMatriculaSchema, MatriculaSchema, ActualizarMatriculaSchema
from app.services.matricula_service import crear_matricula, listar_matriculas, actualizar_matricula, eliminar_matricula
from app.models.matricula import Matricula
import flask_praetorian

matriculas_bp = Blueprint("matriculas", __name__)
crear_schema = CrearMatriculaSchema()
ver_schema = MatriculaSchema()
actualizar_schema = ActualizarMatriculaSchema()

@matriculas_bp.route("/", methods=["POST"])
@flask_praetorian.roles_required("admin")
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
    return jsonify(ver_schema.dump(matriculas, many=True)), 200

@matriculas_bp.route("/<int:id>", methods=["GET"])
#@flask_praetorian.roles_required("admin")
def obtener_matricula(id):
    matricula = Matricula.query.get_or_404(id)
    return ver_schema.dump(matricula), 200

@matriculas_bp.route("/<int:id>", methods=["PUT"])
#@flask_praetorian.roles_required("admin")
def editar_matricula(id):
    data = request.get_json()
    errors = actualizar_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    matricula = actualizar_matricula(id, data)
    return ver_schema.dump(matricula), 200

@matriculas_bp.route("/<int:id>", methods=["DELETE"])
#@flask_praetorian.roles_required("admin")
def eliminar_matricula_route(id):
    eliminar_matricula(id)
    return jsonify({"mensaje": "Matrícula eliminada"}), 200