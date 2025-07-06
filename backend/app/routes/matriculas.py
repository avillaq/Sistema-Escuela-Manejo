from flask import Blueprint, request, jsonify
from app.schemas.matricula import CrearMatriculaSchema, MatriculaSchema, MatriculaResumenSchema
from app.services.matricula_service import crear_matricula, listar_matriculas, eliminar_matricula, obtener_estadisticas_matriculas
import flask_praetorian

from app.emails.mensajes_matricula import mensaje_matricula_creada
from app.email_util import enviar_correo
from app.models.alumno import Alumno

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
    # Obtener info del alumno
    alumno = Alumno.query.get(data['id_alumno'])
    # Preparar datos del correo
    paquete_info = None
    if data.get("tipo_contratacion") == "paquete" and matricula.id_paquete:
        paquete_info = {
            "nombre": matricula.paquete.nombre,
            "horas_total": matricula.paquete.horas_total,
            "costo_total": matricula.paquete.costo_total
        }
    asunto, cuerpo = mensaje_matricula_creada(
        nombre=f"{alumno.nombre} {alumno.apellidos}",
        tipo_contratacion=matricula.tipo_contratacion,
        categoria=matricula.categoria,
        horas=matricula.horas_contratadas,
        tarifa=matricula.tarifa_por_hora,
        paquete=paquete_info,
        fecha_matricula=matricula.fecha_matricula,
        costo_total=matricula.costo_total
    )
    if alumno.email:
        enviar_correo(alumno.email, asunto, cuerpo)
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