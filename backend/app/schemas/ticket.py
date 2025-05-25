from marshmallow import Schema, fields

class TicketSchema(Schema):
    id = fields.Int()
    id_instructor = fields.Int()
    id_auto = fields.Int()
    fecha_asistencia = fields.DateTime()
    nombre_alumno = fields.Str()
    nombre_instructor = fields.Str()
