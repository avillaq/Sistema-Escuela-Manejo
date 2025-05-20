from app.extensions import db

class Bloque(db.Model):
    __tablename__ = "bloques"

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.Date)
    hora_inicio = db.Column(db.Time)
    hora_fin = db.Column(db.Time)
    capacidad_max = db.Column(db.Integer, default=5)
    reservas_actuales = db.Column(db.Integer, default=0)
