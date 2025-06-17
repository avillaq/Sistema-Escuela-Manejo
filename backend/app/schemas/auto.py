from marshmallow import Schema, fields, validate

class TipoAutoResumenSchema(Schema):
    id = fields.Int()
    tipo = fields.Str()

class AutoSchema(Schema):
    id = fields.Int()
    placa = fields.Str()
    marca = fields.Str()
    modelo = fields.Str()
    color = fields.Str()
    id_tipo_auto = fields.Int()
    tipo_auto = fields.Nested(TipoAutoResumenSchema)
    activo = fields.Bool()
    fecha_creado = fields.DateTime()

class CrearAutoSchema(Schema):
    placa = fields.Str(required=True, validate=validate.Length(min=6, max=7))
    marca = fields.Str(required=True)
    modelo = fields.Str(required=True)
    color = fields.Str(required=True)
    id_tipo_auto = fields.Int(required=True)

class ActualizarAutoSchema(Schema):
    marca = fields.Str()
    modelo = fields.Str()
    color = fields.Str()
    id_tipo_auto = fields.Int()
    activo = fields.Bool(validate=validate.OneOf([True, False]))