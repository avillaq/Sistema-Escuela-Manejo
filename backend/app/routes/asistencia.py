from flask import Blueprint
from flask import jsonify
from dotenv import load_dotenv

asistencias_bp = Blueprint('asistencias', __name__)

load_dotenv()

@asistencias_bp.route("/")
def home():
    return jsonify({
        "message": "Sistema de escuela de manejo"
    }), 200