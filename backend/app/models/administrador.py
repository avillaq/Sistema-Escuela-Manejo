from app.extensions import db

class Administrador(db.Model):
    __tablename__ = "administradores"

    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey("usuarios.id"), unique=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    dni = db.Column(db.String(20), unique=True, nullable=False)
    telefono = db.Column(db.String(20), nullable=False)

    usuario = db.relationship("Usuario", backref="admin", uselist=False)
