from app.extensions import db

class Paquete(db.Model):
    __tablename__ = "paquetes"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)  # básico, intermedio, avanzado
    id_tipo_auto = db.Column(db.Integer, db.ForeignKey("tipos_auto.id"))
    horas_total = db.Column(db.Integer, nullable=False)
    costo_total = db.Column(db.Float, nullable=False)

    tipo_auto = db.relationship("TipoAuto", backref="paquetes")
