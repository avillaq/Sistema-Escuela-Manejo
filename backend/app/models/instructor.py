from app.extensions import db

class Instructor(db.Model):
    __tablename__ = "instructores"

    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey("usuarios.id"), unique=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    dni = db.Column(db.String(8), unique=True, nullable=False)
    telefono = db.Column(db.String(9), nullable=False)

    usuario = db.relationship("Usuario", backref="instructor", uselist=False)
