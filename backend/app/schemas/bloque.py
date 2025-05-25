from marshmallow import Schema, fields

class BloqueSchema(Schema):
    id = fields.Int()
    fecha = fields.Date()
    hora_inicio = fields.Time()
    hora_fin = fields.Time()
    capacidad_max = fields.Int()
    reservas_actuales = fields.Int()
