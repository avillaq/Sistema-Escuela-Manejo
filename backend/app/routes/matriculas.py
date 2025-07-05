from flask import Blueprint, request, jsonify
from app.schemas.matricula import CrearMatriculaSchema, MatriculaSchema, MatriculaResumenSchema
from app.services.matricula_service import crear_matricula, listar_matriculas, eliminar_matricula
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
    matricula = listar_matriculas(id_matricula=id_matricula, id_alumno=id_alumno)
    if id_matricula or id_alumno:
        return jsonify(lista_schema.dump(matricula)), 200
    return jsonify(lista_schema.dump(matricula, many=True)), 200

@matriculas_bp.route("/<int:id>", methods=["DELETE"])
@flask_praetorian.roles_required("admin")
def eliminar_matricula_route(id):
    eliminar_matricula(id)
    return jsonify({"mensaje": "Matrícula eliminada"}), 200