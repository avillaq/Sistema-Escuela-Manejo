from flask import Blueprint, jsonify
import flask_praetorian
from app.services.reporte_service import obtener_reporte_admin


reportes_bp = Blueprint("reportes", __name__)

@reportes_bp.route("/admin-dashboard", methods=["GET"])
@flask_praetorian.roles_required("admin")
def ver_reporte_admin():
    data = obtener_reporte_admin()
    return jsonify(data), 200