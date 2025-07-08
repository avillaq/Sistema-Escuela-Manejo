from flask import Blueprint, jsonify
from app.extensions import db
from app.datetime_utils import now_peru

health_bp = Blueprint("health", __name__)

@health_bp.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "API funcionando correctamente",
        "timestamp": now_peru().isoformat(),
    }), 200

@health_bp.route("/db", methods=["GET"])
def database_health():
    try:
        # Verificar conexión a la base de datos
        result = db.session.execute(db.text("SELECT 1 as ping")).fetchone()
        
        return jsonify({
            "status": "ok",
            "message": "Base de datos conectada",
            "timestamp": now_peru().isoformat(),
            "ping": result.ping if result else None
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Error de conexión a base de datos",
            "error": str(e),
            "timestamp": now_peru().isoformat()
        }), 500