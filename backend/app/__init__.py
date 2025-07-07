from flask import Flask
from .extensions import db, migrate, limiter, cache, cors, guard, blacklist, mail
from .models.usuario import Usuario
from .routes.alumnos import alumnos_bp
from .routes.auto import autos_bp
from .routes.auth import auth_bp
from .routes.matriculas import matriculas_bp
from .routes.asistencia import asistencias_bp
from .routes.reservas import reservas_bp
from .routes.instructores import instructores_bp
from .routes.administradores import administradores_bp
from .routes.pagos import pagos_bp
from .routes.bloques import bloques_bp
from .routes.tickets import tickets_bp
from .routes.reportes import reportes_bp
from .routes.paquetes import paquetes_bp
from .routes.admin_tareas import admin_tareas_bp
from .routes.health import health_bp
from .error_handlers import register_error_handlers

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)
    cache.init_app(app)
    cors.init_app(app)
    guard.init_app(app, Usuario, is_blacklisted=blacklist.is_blacklisted)
    mail.init_app(app) 

    register_error_handlers(app)

    # Registrar blueprints
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(alumnos_bp, url_prefix="/api/alumnos")
    app.register_blueprint(instructores_bp, url_prefix="/api/instructores")
    app.register_blueprint(administradores_bp, url_prefix="/api/administradores")
    app.register_blueprint(autos_bp, url_prefix="/api/autos")
    app.register_blueprint(matriculas_bp, url_prefix="/api/matriculas")
    app.register_blueprint(asistencias_bp, url_prefix="/api/asistencias")
    app.register_blueprint(reservas_bp, url_prefix="/api/reservas")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(pagos_bp, url_prefix="/api/pagos")
    app.register_blueprint(bloques_bp, url_prefix="/api/bloques")
    app.register_blueprint(tickets_bp, url_prefix="/api/tickets")
    app.register_blueprint(reportes_bp, url_prefix="/api/reportes")
    app.register_blueprint(paquetes_bp, url_prefix="/api/paquetes")
    app.register_blueprint(admin_tareas_bp, url_prefix="/api/admin-tareas")

    return app