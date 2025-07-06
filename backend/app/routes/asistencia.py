from flask import Blueprint, request, jsonify
from app.schemas.asistencia import CrearAsistenciaSchema
from app.services.asistencia_service import registrar_asistencia
from app.models.matricula import Matricula
import flask_praetorian

asistencias_bp = Blueprint("asistencias", __name__)
crear_schema = CrearAsistenciaSchema()

@asistencias_bp.route("/", methods=["POST"])
@flask_praetorian.roles_required("admin")
def marcar_asistencia():
    data = request.get_json()
    errors = crear_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    asistencia, ticket = registrar_asistencia(data)

    # Verifica si se debe enviar correo de advertencia por pago incompleto
    if asistencia and asistencia.id_matricula:
        matricula = Matricula.query.get(asistencia.id_matricula)
        if matricula:
            verificar_envio_correo_deuda(matricula)
            verificar_fin_clases(matricula)

    if ticket is None:
        return jsonify({
            "asistencia_id": asistencia.id,
            "mensaje": "El alumno no asistió a la clase, no se generó un ticket."
        }), 201

    return jsonify({
        "asistencia_id": asistencia.id,
        "ticket": {
            "id": ticket.id,
            "numero_clase_alumno": ticket.numero_clase_alumno,
            "id_instructor": ticket.id_instructor,
            "id_auto": ticket.id_auto
        }
    }), 201

@asistencias_bp.route("/", methods=["GET"])
@flask_praetorian.roles_accepted("alumno")
def obtener_asistencias():
    try:
        current_user = flask_praetorian.current_user()
        id_usuario = current_user.id

        asistencias = listar_asistencias(id_usuario=id_usuario)
        
        resultado = []
        for index, asistencia in enumerate(asistencias):
            item = {
                "id": asistencia.id,
                "asistio": asistencia.asistio,
                "fecha_clase": asistencia.fecha_clase.isoformat() if asistencia.fecha_clase else None,
                "hora_inicio": asistencia.hora_inicio.strftime('%H:%M') if asistencia.hora_inicio else None,
                "hora_fin": asistencia.hora_fin.strftime('%H:%M') if asistencia.hora_fin else None,
                "numero_clase_alumno": (len(asistencias) - index)
            }
            resultado.append(item)
        return jsonify(resultado), 200
        
    except Exception as e:
        return jsonify({"mensaje": "Error interno del servidor"}), 500

# Función auxiliar para verificar deuda al cumplir 3 clases
def verificar_envio_correo_deuda(matricula):
    if (
        matricula.horas_completadas == 3 and
        matricula.estado_pago == "incompleto" and
        matricula.saldo_pendiente > 0
    ):
        from app.models.alumno import Alumno
        from app.email_util import enviar_correo
        from app.emails.mensajes_pago import mensaje_recordatorio_pago

        alumno = Alumno.query.get(matricula.id_alumno)
        if alumno and alumno.email:
            asunto, cuerpo = mensaje_recordatorio_pago(
                nombre=f"{alumno.nombre} {alumno.apellidos}",
                saldo_pendiente=matricula.saldo_pendiente
            )
            enviar_correo(alumno.email, asunto, cuerpo)
def verificar_fin_clases(matricula):
    total_horas = 0
    if matricula.tipo_contratacion == "por_hora":
        total_horas = matricula.horas_contratadas
    elif matricula.tipo_contratacion == "paquete" and matricula.paquete:
        total_horas = matricula.paquete.horas_total

    if total_horas and matricula.horas_completadas == total_horas:
        from app.models.alumno import Alumno
        from app.email_util import enviar_correo
        from app.emails.mensajes_fin import mensaje_final_clases

        alumno = Alumno.query.get(matricula.id_alumno)
        if alumno and alumno.email:
            asunto, cuerpo = mensaje_final_clases(
                nombre=f"{alumno.nombre} {alumno.apellidos}",
                tipo=matricula.tipo_contratacion
            )
            enviar_correo(alumno.email, asunto, cuerpo)
