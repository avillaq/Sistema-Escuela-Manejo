from app.extensions import db

class Auto(db.Model):
    __tablename__ = "autos"

    id = db.Column(db.Integer, primary_key=True)
    placa = db.Column(db.String(10), unique=True, nullable=False)
    marca = db.Column(db.String(50))
    modelo = db.Column(db.String(100))
    color = db.Column(db.String(50))
    id_tipo_auto = db.Column(db.Integer, db.ForeignKey("tipos_auto.id"))
    fecha_creado = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
    fecha_actualizado = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), onupdate=db.func.now())
    activo = db.Column(db.Boolean, default=True)

    tipo_auto = db.relationship("TipoAuto", backref="autos")
