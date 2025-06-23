from marshmallow import Schema, fields, validate
from werkzeug.exceptions import BadRequest

class TipoAutoResumenSchema(Schema):
    id = fields.Int()
    tipo = fields.Str()

class PaqueteSchema(Schema):
    id = fields.Int()
    nombre = fields.Str()
    id_tipo_auto = fields.Int()
    tipo_auto = fields.Nested(TipoAutoResumenSchema)
    horas_total = fields.Str()
    costo_total = fields.Float()

class CrearPaqueteSchema(Schema):
    nombre = fields.Str(required=True, validate=validate.OneOf(["basico", "intermedio", "avanzado", "por_hora"], error="El nombre debe ser uno de los siguientes: basico, intermedio, avanzado, por_hora")) 
    id_tipo_auto = fields.Int(required=True)
    horas_total = fields.Int(required=True, validate=validate.Range(min=1, error="Las horas totales deben ser al menos 1 hora"))
    costo_total = fields.Float(required=True, validate=validate.Range(min=1, error="El costo total debe ser al menos 1 sol"))
    def handle_error(self, error, data, **kwargs):   
        formatted_errors = {}
        for field, messages in error.messages.items():
            formatted_errors[field] = messages[0] if isinstance(messages, list) else messages
            raise BadRequest (formatted_errors[field])
        
class ActualizarPaqueteSchema(Schema):
    nombre = fields.Str(validate=validate.OneOf(["basico", "intermedio", "avanzado", "por_hora"], error="El nombre debe ser uno de los siguientes: basico, intermedio, avanzado, por_hora"))
    id_tipo_auto = fields.Int()
    horas_total = fields.Int(validate=validate.Range(min=1, error="Las horas totales deben ser al menos 1 hora"))
    costo_total = fields.Float(validate=validate.Range(min=1, error="El costo total debe ser al menos 1 sol"))
    def handle_error(self, error, data, **kwargs):   
        formatted_errors = {}
        for field, messages in error.messages.items():
            formatted_errors[field] = messages[0] if isinstance(messages, list) else messages
            raise BadRequest (formatted_errors[field])