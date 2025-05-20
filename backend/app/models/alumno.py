from app.extensions import db

class Alumno(db.Model):
    __tablename__ = "alumnos"

    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(db.Integer, db.ForeignKey("usuarios.id"), unique=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    dni = db.Column(db.String(20), unique=True, nullable=False)
    telefono = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100))
    categoria = db.Column(db.String(10), nullable=False)  # 'A-I' o 'A-II'
    fecha_creado = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
    fecha_actualizado = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), onupdate=db.func.now())
    activo = db.Column(db.Boolean, default=True)

    usuario = db.relationship("Usuario", backref="alumno", uselist=False)
