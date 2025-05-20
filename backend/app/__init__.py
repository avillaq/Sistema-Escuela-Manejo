from flask import Flask
from .extensions import db, migrate, limiter, cors, guard, blacklist
from .models.usuario import Usuario
from .routes.alumnos import alumnos_bp
from .routes.auth import auth_bp
from .routes.matriculas import matriculas_bp
from .routes.asistencia import asistencias_bp
from .routes.reservas import reservas_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)
    cors.init_app(app)
    guard.init_app(app, Usuario,is_blacklisted=blacklist.is_blacklisted)

    # Registrar los blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(alumnos_bp, url_prefix="/api/alumnos")
    app.register_blueprint(matriculas_bp, url_prefix="/api/matriculas")
    app.register_blueprint(asistencias_bp, url_prefix="/api/asistencias")
    app.register_blueprint(reservas_bp, url_prefix="/api/reservas")

    return app
