from flask import Blueprint, request, jsonify
from app.schemas.matricula import CrearMatriculaSchema, MatriculaSchema
from app.services.matricula_service import crear_matricula
from app.models.matricula import Matricula
from app.extensions import guard

matriculas_bp = Blueprint("matriculas", __name__)
crear_schema = CrearMatriculaSchema()
ver_schema = MatriculaSchema()

@matriculas_bp.route("/", methods=["POST"])
@guard.roles_required("admin")
def registrar_matricula():
    data = request.get_json()
    errors = crear_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    matricula = crear_matricula(data)
    return ver_schema.dump(matricula), 201

@matriculas_bp.route("/", methods=["GET"])
@guard.roles_required("admin")
def listar_matriculas():
    matriculas = Matricula.query.all()
    return jsonify(ver_schema.dump(matriculas, many=True)), 200

@matriculas_bp.route("/<int:id>", methods=["GET"])
@guard.roles_required("admin")
def obtener_matricula(id):
    matricula = Matricula.query.get_or_404(id)
    return ver_schema.dump(matricula), 200