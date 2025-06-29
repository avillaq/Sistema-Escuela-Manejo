from marshmallow import Schema, fields, validate

class LoginSchema(Schema):
    nombre_usuario = fields.Str(required=True)
    contrasena = fields.Str(required=True)

# Faltan validaciones de contraseña
class CambioContrasenaSchema(Schema):
    contrasena_actual = fields.Str(required=True, validate=validate.Length(min=8))
    contrasena_nueva = fields.Str(required=True, validate=validate.Length(min=8))