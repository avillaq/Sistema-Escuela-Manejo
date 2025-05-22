from marshmallow import Schema, fields, validate

class AdministradorSchema(Schema):
    id = fields.Int()
    nombre = fields.Str()
    apellidos = fields.Str()
    dni = fields.Str()
    telefono = fields.Str()

class CrearAdministradorSchema(Schema):
    nombre = fields.Str(required=True)
    apellidos = fields.Str(required=True)
    dni = fields.Str(required=True, validate=validate.Length(equal=8))
    telefono = fields.Str(required=True, validate=validate.Length(equal=9))

class ActualizarAdministradorSchema(Schema):
    nombre = fields.Str()
    apellidos = fields.Str()
    telefono = fields.Str()