from marshmallow import Schema, fields, validate
from werkzeug.exceptions import BadRequest

class AsistenciaSchema(Schema):
    id = fields.Int()
    asistio = fields.Bool()

class CrearAsistenciaSchema(Schema):
    id_reserva = fields.Int(
        required=True,
        error_messages={"required": "El ID de la reserva es obligatorio."}
    )   
    id_instructor = fields.Int()
    id_auto = fields.Int()
    asistio = fields.Bool(
        validate=validate.OneOf([True, False], error="El campo 'asistió' debe ser verdadero o falso.")
    )
    def handle_error(self, error, data, **kwargs):   
        formatted_errors = {}
        for field, messages in error.messages.items():
            formatted_errors[field] = messages[0] if isinstance(messages, list) else messages
            raise BadRequest (formatted_errors[field])
