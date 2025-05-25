from app.extensions import db

class Ticket(db.Model):
    __tablename__ = "tickets"

    id = db.Column(db.Integer, primary_key=True)
    id_asistencia = db.Column(db.Integer, db.ForeignKey("asistencias.id"), unique=True)
    numero_clase_alumno = db.Column(db.Integer, nullable=False)
    id_instructor = db.Column(db.Integer, db.ForeignKey("instructores.id"))
    id_auto = db.Column(db.Integer, db.ForeignKey("autos.id"))

    asistencia = db.relationship("Asistencia", backref="ticket", uselist=False)
    instructor = db.relationship("Instructor", backref="tickets")
    auto = db.relationship("Auto", backref="tickets")
