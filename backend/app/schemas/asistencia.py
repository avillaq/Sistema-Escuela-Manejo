from marshmallow import Schema, fields

class AsistenciaSchema(Schema):
    id = fields.Int()
    asistio = fields.Bool()

class CrearAsistenciaSchema(Schema):
    id_reserva = fields.Int(required=True)
    id_instructor = fields.Int()
    id_auto = fields.Int()
    asistio = fields.Bool()