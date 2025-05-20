from app.extensions import db

class Reserva(db.Model):
    __tablename__ = "reservas"

    id = db.Column(db.Integer, primary_key=True)
    id_bloque = db.Column(db.Integer, db.ForeignKey("bloques.id"))
    id_matricula = db.Column(db.Integer, db.ForeignKey("matriculas.id"))
    fecha_reserva = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
    duracion_horas = db.Column(db.Integer, default=1)

    bloque = db.relationship("Bloque", backref="reservas")
    matricula = db.relationship("Matricula", backref="reservas")
