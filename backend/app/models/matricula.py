from app.extensions import db

class Matricula(db.Model):
    __tablename__ = "matriculas"

    id = db.Column(db.Integer, primary_key=True)
    id_alumno = db.Column(db.Integer, db.ForeignKey("alumnos.id"))
    id_paquete = db.Column(db.Integer, db.ForeignKey("paquetes.id"), nullable=True)
    categoria = db.Column(db.String(10), nullable=False)  # 'A-I' o 'A-II'

    tipo_contratacion = db.Column(db.String(20), nullable=False)  # 'paquete' o 'por_hora'
    horas_contratadas = db.Column(db.Integer)  # Solo para contrataciones por hora
    tarifa_por_hora = db.Column(db.Float)  # Solo para contrataciones por hora
    
    costo_total = db.Column(db.Float)  # Se calcula según paquete o (horas * tarifa)

    fecha_matricula = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
    fecha_actualizado = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), onupdate=db.func.now())
    fecha_limite = db.Column(db.DateTime(timezone=True))
    estado_pago = db.Column(db.String(20), default='pendiente')  # 'pendiente', 'completo'
    estado_clases = db.Column(db.String(20), default='pendiente')  # 'pendiente', 'en_progreso', 'completado', 'vencido'
    ultima_modificacion_reserva = db.Column(db.DateTime(timezone=True))

    alumno = db.relationship("Alumno", backref="matriculas")
    paquete = db.relationship("Paquete", backref="matriculas")
