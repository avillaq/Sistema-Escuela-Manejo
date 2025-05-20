from app.extensions import db

class Pago(db.Model):
    __tablename__ = "pagos"

    id = db.Column(db.Integer, primary_key=True)
    id_matricula = db.Column(db.Integer, db.ForeignKey("matriculas.id"))
    monto = db.Column(db.Float, nullable=False)
    fecha_pago = db.Column(db.DateTime(timezone=True), server_default=db.func.now())

    matricula = db.relationship("Matricula", backref="pagos")
