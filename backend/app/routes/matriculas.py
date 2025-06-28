from flask import Blueprint, request, jsonify
from app.schemas.matricula import CrearMatriculaSchema, MatriculaSchema, MatriculaResumenSchema
from app.services.matricula_service import crear_matricula, listar_matriculas, eliminar_matricula
import flask_praetorian

matriculas_bp = Blueprint("matriculas", __name__)
crear_schema = CrearMatriculaSchema()
ver_schema = MatriculaSchema()
lista_schema = MatriculaResumenSchema()

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
@flask_praetorian.roles_accepted("admin", "alumno")
def obtener_matricula():
    id_matricula = request.args.get("id_matricula", type=int, default=None)
    id_alumno = request.args.get("id_alumno", type=int, default=None)
    matricula = listar_matriculas(id_matricula=id_matricula, id_alumno=id_alumno)
    if id_matricula or id_alumno:
        return jsonify(lista_schema.dump(matricula)), 200
    return jsonify(lista_schema.dump(matricula, many=True)), 200

@matriculas_bp.route("/<int:id>", methods=["DELETE"])
@flask_praetorian.roles_required("admin")
def eliminar_matricula_route(id):
    eliminar_matricula(id)
    return jsonify({"mensaje": "Matrícula eliminada"}), 200