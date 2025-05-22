from marshmallow import Schema, fields, validate

class AutoSchema(Schema):
    id = fields.Int()
    placa = fields.Str()
    marca = fields.Str()
    modelo = fields.Str()
    color = fields.Str()
    id_tipo_auto = fields.Int()
    activo = fields.Bool()

class CrearAutoSchema(Schema):
    placa = fields.Str(required=True, validate=validate.Length(min=6, max=10))
    marca = fields.Str(required=True)
    modelo = fields.Str(required=True)
    color = fields.Str(required=True)
    id_tipo_auto = fields.Int(required=True)

class ActualizarAutoSchema(Schema):
    marca = fields.Str()
    modelo = fields.Str()
    color = fields.Str()
    id_tipo_auto = fields.Int()
    activo = fields.Bool()