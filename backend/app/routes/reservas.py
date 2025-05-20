from flask import Blueprint
from flask import jsonify
from dotenv import load_dotenv

reservas_bp = Blueprint('reservas', __name__)

load_dotenv()

@reservas_bp.route("/")
def home():
    return jsonify({
        "message": "Sistema de escuela de manejo"
    }), 200