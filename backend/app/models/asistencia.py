from app.extensions import db

class Asistencia(db.Model):
    __tablename__ = "asistencias"

    id = db.Column(db.Integer, primary_key=True)
    id_reserva = db.Column(db.Integer, db.ForeignKey("reservas.id"), unique=True)
    asistio = db.Column(db.Boolean)
    fecha_asistencia = db.Column(db.DateTime)

    reserva = db.relationship("Reserva", backref=db.backref("asistencia", uselist=False))
