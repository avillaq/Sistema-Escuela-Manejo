from flask import Blueprint
from flask import jsonify
from dotenv import load_dotenv

matriculas_bp = Blueprint('matriculas', __name__)

load_dotenv()

@matriculas_bp.route("/")
def home():
    return jsonify({
        "message": "Sistema de escuela de manejo"
    }), 200