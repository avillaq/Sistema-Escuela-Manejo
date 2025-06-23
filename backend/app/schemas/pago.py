from marshmallow import Schema, fields, validate
from werkzeug.exceptions import BadRequest

class CrearPagoSchema(Schema):
    id_matricula = fields.Int(
        required=True,
        error_messages={"required": "El ID de matrícula es obligatorio."}
    )
    monto = fields.Float(
        required=True,
        validate=validate.Range(min=0.1, error="El monto debe ser mayor a 0."),
        error_messages={"required": "El monto es obligatorio."}
    )

    def handle_error(self, error, data, **kwargs):   
        formatted_errors = {}
        for field, messages in error.messages.items():
            formatted_errors[field] = messages[0] if isinstance(messages, list) else messages
            raise BadRequest (formatted_errors[field])
        
class PagoSchema(Schema):
    id = fields.Int()
    id_matricula = fields.Int()
    monto = fields.Float()