from app.api import bp
from backend.app.core.extensions import db
from flask import jsonify
from dotenv import load_dotenv

load_dotenv()

@bp.route("/")
def home():
    return jsonify({
        "message": "Sistema de escuela de manejo"
    }), 200