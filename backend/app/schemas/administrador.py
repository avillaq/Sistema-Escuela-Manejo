from marshmallow import Schema, fields, validate

class AdministradorSchema(Schema):
    id = fields.Int()
    nombre = fields.Str()
    apellidos = fields.Str()
    dni = fields.Str()
    telefono = fields.Str()
    activo = fields.Bool()

class CrearAdministradorSchema(Schema):
    nombre = fields.Str(required=True)
    apellidos = fields.Str(required=True)
    dni = fields.Str(required=True, validate=validate.Regexp(
        r'^\d{8}$', 
        error="El DNI debe contener exactamente 8 dígitos numéricos."
    ))
    telefono = fields.Str(required=True, validate=validate.Regexp(
        r'^\d{9}$', 
        error="El teléfono debe contener exactamente 9 dígitos numéricos."
    ))

class ActualizarAdministradorSchema(Schema):
    nombre = fields.Str()
    apellidos = fields.Str()
    telefono = fields.Str(required=True, validate=validate.Regexp(
        r'^\d{9}$', 
        error="El teléfono debe contener exactamente 9 dígitos numéricos."
    ))
    activo = fields.Bool(validate=validate.OneOf([True, False]))