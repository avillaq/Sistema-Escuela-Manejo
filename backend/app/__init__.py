from flask import Flask
from backend.app.core.extensions import db, limiter, cors, guard, blacklist
from app.api.models import User

def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")

    db.init_app(app)
    limiter.init_app(app)
    cors.init_app(app)

    guard.init_app(app, User,is_blacklisted=blacklist.is_blacklisted)

    # Registrar los blueprints
    from app.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    return app
