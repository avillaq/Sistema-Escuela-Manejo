from flask import Blueprint
from flask import jsonify
from dotenv import load_dotenv

alumnos_bp = Blueprint('alumnos', __name__)

load_dotenv()

@alumnos_bp.route("/")
def home():
    return jsonify({
        "message": "Sistema de escuela de manejo"
    }), 200