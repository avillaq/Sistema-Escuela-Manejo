from flask import Blueprint, jsonify
import flask_praetorian
from app.services.reporte_service import obtener_reporte_admin
from datetime import datetime


reportes_bp = Blueprint("reportes", __name__)

@reportes_bp.route("/admin-dashboard", methods=["GET"])
@flask_praetorian.roles_required("admin")
def ver_reporte_admin():
    data = obtener_reporte_admin()
    return jsonify(data), 200

@reportes_bp.route("/admin-info", methods=["GET"])
@flask_praetorian.roles_required("admin")
def obtener_info_admin():
    current_user = flask_praetorian.current_user()
    
    admin_info = {
        "id": current_user.id,
        "username": current_user.nombre_usuario,
        "rol": current_user.rol,
        "ultimo_acceso": datetime.now().strftime('%d/%m/%Y %H:%M')
    }
    
    return jsonify(admin_info), 200