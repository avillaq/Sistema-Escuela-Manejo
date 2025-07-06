from flask import Blueprint, request, jsonify
from app.schemas.matricula import CrearMatriculaSchema, MatriculaSchema, MatriculaResumenSchema
from app.services.matricula_service import crear_matricula, listar_matriculas, eliminar_matricula, obtener_estadisticas_matriculas
import flask_praetorian
from app.services.email_service import email_service

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
    if matricula.alumno.email:
        email_service.enviar_matricula_creada(matricula)

    return ver_schema.dump(matricula), 201

@matriculas_bp.route("/", methods=["GET"])
@flask_praetorian.roles_accepted("admin", "alumno")
def obtener_matricula():
    id_matricula = request.args.get("id_matricula", type=int, default=None)
    id_alumno = request.args.get("id_alumno", type=int, default=None)

    # Parametros de filtrado y paginacion
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    busqueda = request.args.get("busqueda", None)
    estado_clases = request.args.get("estado_clases", None)
    estado_pago = request.args.get("estado_pago", None)
    tipo_contratacion = request.args.get("tipo_contratacion", None)

    per_page = min(per_page, 100)

    resultado = listar_matriculas(
        page=page,
        per_page=per_page,
        busqueda=busqueda,
        estado_clases=estado_clases,
        estado_pago=estado_pago,
        tipo_contratacion=tipo_contratacion,
        id_matricula=id_matricula,
        id_alumno=id_alumno
    )

    if id_matricula or id_alumno:
        return jsonify(lista_schema.dump(resultado)), 200
    return jsonify({
        "matriculas": lista_schema.dump(resultado.items, many=True),
        "pagination": {
            "page": resultado.page,
            "per_page": resultado.per_page,
            "total": resultado.total,
            "pages": resultado.pages,
            "has_next": resultado.has_next,
            "has_prev": resultado.has_prev
        }
    }), 200

@matriculas_bp.route("/estadisticas", methods=["GET"])
@flask_praetorian.roles_required("admin")
def obtener_estadisticas_matriculas_route():
    estadisticas = obtener_estadisticas_matriculas()
    return jsonify(estadisticas), 200

@matriculas_bp.route("/<int:id>", methods=["DELETE"])
@flask_praetorian.roles_required("admin")
def eliminar_matricula_route(id):
    eliminar_matricula(id)
    return jsonify({"mensaje": "Matrícula eliminada"}), 200