from marshmallow import Schema, fields, validate
from werkzeug.exceptions import BadRequest

class ReservaItemSchema(Schema):
    id_bloque = fields.Int(required=True)

class CrearReservasSchema(Schema):
    id_matricula = fields.Int(required=True)
    reservas = fields.List(fields.Nested(ReservaItemSchema), required=True)
    def handle_error(self, error, data, **kwargs):   
        formatted_errors = {}
        for field, messages in error.messages.items():
            formatted_errors[field] = messages[0] if isinstance(messages, list) else messages
            raise BadRequest (formatted_errors[field])
        
class EliminarReservasSchema(Schema):
    id_matricula = fields.Int(required=True)
    ids_reservas = fields.List(fields.Int(), required=True, validate=validate.Length(min=1, error="Debe proporcionar al menos un ID de reserva para eliminar.")
    )
    def handle_error(self, error, data, **kwargs):   
        formatted_errors = {}
        for field, messages in error.messages.items():
            formatted_errors[field] = messages[0] if isinstance(messages, list) else messages
            raise BadRequest (formatted_errors[field])
        
class ReservaSchema(Schema):
    id = fields.Int()
    id_bloque = fields.Int()
    id_matricula = fields.Int()
    fecha_reserva = fields.DateTime()
    
    # información adicional para mejor visualización
    bloque = fields.Nested("BloqueSchema", only=["fecha", "hora_inicio", "hora_fin"])
    matricula = fields.Nested("MatriculaResumenSchema", only=["alumno", "categoria", "horas_completadas"])
    asistencia = fields.Nested("AsistenciaSchema", only=["id", "asistio"])
    