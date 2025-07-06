from flask import Blueprint, request, jsonify, current_app
from app.services.admin_tareas_service import generar_bloques, limpiar_bloques_vacios, verificar_pagos_pendiente, verificar_clases_reservadas
from app.services.email_service import email_service
from app.extensions import limiter, db
admin_tareas_bp = Blueprint("admin_tareas", __name__)

# Funcion auxiliar para verificar el token de cron
def verificar_token_cron():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return False, "Token requerido"
    
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        
        if token == current_app.config.get("CRON_API_TOKEN"):
            return True, "Token cron válido"
    return False, "Token inválido"

@admin_tareas_bp.route("/generar-bloques", methods=["POST"])
@limiter.limit("10 per hour") 
def generar_bloques_ruta():
    try:
        # Verificar que sea admin o usar token especial
        valido, mensaje = verificar_token_cron()
        if not valido:
            return jsonify({"error": mensaje}), 403
            
        semanas = request.json.get("semanas", 2) if request.json else 2
        bloques_creados = generar_bloques(semanas)
        
        return jsonify({
            "mensaje": f"Se crearon {bloques_creados} bloques para {semanas} semanas",
            "bloques_creados": bloques_creados
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_tareas_bp.route("/limpiar-bloques", methods=["POST"])
@limiter.limit("10 per hour") 
def limpiar_bloques_ruta():
    try:
        valido, mensaje = verificar_token_cron()
        if not valido:
            return jsonify({"error": mensaje}), 403
            
        eliminados = limpiar_bloques_vacios()
        
        return jsonify({
            "mensaje": f"Se eliminaron {eliminados} bloques vacíos",
            "bloques_eliminados": eliminados
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@admin_tareas_bp.route("/enviar-pagos-pendientes", methods=["POST"])
@limiter.limit("60 per hour")
def enviar_pagos_pendientes_ruta():
    try:
        valido, mensaje = verificar_token_cron()
        if not valido:
            return jsonify({"error": mensaje}), 403
        
        matriculas = verificar_pagos_pendiente()
        for matricula in matriculas:
            email_service.enviar_pago_pendiente(matricula)
        
        return jsonify({
            "mensaje": "Recordatorio de pagos pendientes enviados correctamente"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@admin_tareas_bp.route("/enviar-recordatorio-reserva", methods=["POST"])
@limiter.limit("60 per hour")
def enviar_recordatorio_reserva_ruta():
    try:
        valido, mensaje = verificar_token_cron()
        if not valido:
            return jsonify({"error": mensaje}), 403
            
        reservas = verificar_clases_reservadas()
        for reserva in reservas:
            email_service.enviar_recordatorio_reserva(reserva)
        
        return jsonify({
            "mensaje": "Recordatorio enviadas correctamente"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@admin_tareas_bp.route("/despertar-bd", methods=["GET"])
@limiter.limit("30 per hour")
def despertar_bd_ruta():
    try:
        valido, mensaje = verificar_token_cron()
        if not valido:
            return jsonify({"error": mensaje}), 403
        
        result = db.session.execute(db.text("SELECT NOW() as current_time, 'BD_ACTIVA' as status")).fetchone()
        
        return jsonify({
            "message": "Base de datos activa",
        }), 200
        
    except Exception as e:
        return jsonify({
            "message": "Error al despertar base de datos",
        }), 500