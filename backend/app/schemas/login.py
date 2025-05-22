from marshmallow import Schema, fields

class LoginSchema(Schema):
    nombre_usuario = fields.Str(required=True)
    contraseña = fields.Str(required=True)