from marshmallow import Schema, fields

class CrearAsistenciaSchema(Schema):
    id_reserva = fields.Int(required=True)
    id_instructor = fields.Int(required=True)
    id_auto = fields.Int(required=True)
    asistio = fields.Bool(missing=True)