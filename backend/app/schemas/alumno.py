from marshmallow import Schema, fields, validate

class AlumnoSchema(Schema):
    id = fields.Int()
    nombre = fields.Str()
    apellidos = fields.Str()
    dni = fields.Str()
    telefono = fields.Str()
    email = fields.Email()
    categoria = fields.Str()

class CrearAlumnoSchema(Schema):
    nombre = fields.Str(required=True)
    apellidos = fields.Str(required=True)
    dni = fields.Str(required=True, validate=validate.Length(equal=8))
    telefono = fields.Str(required=True)
    email = fields.Email(required=True)
    categoria = fields.Str(required=True, validate=validate.OneOf(["A-I", "A-II"]))

class ActualizarAlumnoSchema(Schema):
    nombre = fields.Str()
    apellidos = fields.Str()
    telefono = fields.Str()
    email = fields.Email()
    categoria = fields.Str(validate=validate.OneOf(["A-I", "A-II"]))
