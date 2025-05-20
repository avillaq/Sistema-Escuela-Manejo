from app.extensions import db

class Matricula(db.Model):
    __tablename__ = "matriculas"

    id = db.Column(db.Integer, primary_key=True)
    id_alumno = db.Column(db.Integer, db.ForeignKey("alumnos.id"))
    id_paquete = db.Column(db.Integer, db.ForeignKey("paquetes.id"), nullable=True)
    fecha_matricula = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
    fecha_actualizado = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), onupdate=db.func.now())
    fecha_limite = db.Column(db.DateTime(timezone=True))
    estado = db.Column(db.String(20))  # 'pendiente', 'completo', 'vencido'
    ultima_modificacion_reserva = db.Column(db.DateTime(timezone=True))

    alumno = db.relationship("Alumno", backref="matriculas")
    paquete = db.relationship("Paquete", backref="matriculas")
