from flask import Blueprint, request, jsonify, current_app
from app.services.admin_tareas_service import generar_bloques, limpiar_bloques_vacios

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
def enviar_pagos_pendientes_ruta():
    try:
        valido, mensaje = verificar_token_cron()
        if not valido:
            return jsonify({"error": mensaje}), 403
            
        # Aquí se llamaría a la función que envía los pagos pendientes
        #enviar_pagos_pendientes()
        
        return jsonify({
            "mensaje": "Recordatorio de pagos pendientes enviados correctamente"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@admin_tareas_bp.route("/enviar-recordatorio-reserva", methods=["POST"])
def enviar_recordatorio_reserva_ruta():
    try:
        valido, mensaje = verificar_token_cron()
        if not valido:
            return jsonify({"error": mensaje}), 403
            
        # Aquí se llamaría a la función que envía las recordatorio-reserva
        #enviar_recordatorio_reserva()
        
        return jsonify({
            "mensaje": "Recordatorio enviadas correctamente"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500