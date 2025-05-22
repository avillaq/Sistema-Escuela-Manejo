from app.extensions import db

class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nombre_usuario = db.Column(db.String(50), unique=True, nullable=False)
    contraseña_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(50), nullable=False)
    fecha_creado = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
    fecha_actualizado = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), onupdate=db.func.now())
    activo = db.Column(db.Boolean, default=True)
    
    @property
    def identity(self):
        return self.id

    @property
    def rolenames(self):
        return [self.rol]

    @property
    def password(self):
        return self.contraseña_hash

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(nombre_usuario=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)