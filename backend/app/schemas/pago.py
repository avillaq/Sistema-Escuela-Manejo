from marshmallow import Schema, fields

class CrearPagoSchema(Schema):
    id_matricula = fields.Int(required=True)
    monto = fields.Float(required=True)

class PagoSchema(Schema):
    id = fields.Int()
    id_matricula = fields.Int()
    monto = fields.Float()