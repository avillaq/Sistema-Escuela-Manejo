from marshmallow import Schema, fields

class ReservaItemSchema(Schema):
    id_bloque = fields.Int(required=True)

class CrearReservasSchema(Schema):
    id_matricula = fields.Int(required=True)
    reservas = fields.List(fields.Nested(ReservaItemSchema), required=True)

class EliminarReservasSchema(Schema):
    id_matricula = fields.Int(required=True)
    ids_reservas = fields.List(fields.Int(), required=True)

class ReservaSchema(Schema):
    id = fields.Int()
    id_bloque = fields.Int()
    id_matricula = fields.Int()
    fecha_reserva = fields.DateTime()
    
    # información adicional para mejor visualización
    bloque = fields.Nested("BloqueSchema", only=["fecha", "hora_inicio"])