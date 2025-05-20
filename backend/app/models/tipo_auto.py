from app.extensions import db

class TipoAuto(db.Model):
    __tablename__ = "tipos_auto"

    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(20), nullable=False)  # 'mecánico', 'automático'
