from marshmallow import Schema, fields, validate
from werkzeug.exceptions import BadRequest

class TipoAutoResumenSchema(Schema):
    id = fields.Int()
    tipo = fields.Str()

class AutoSchema(Schema):
    id = fields.Int()
    placa = fields.Str()
    marca = fields.Str()
    modelo = fields.Str()
    color = fields.Str()
    id_tipo_auto = fields.Int()
    tipo_auto = fields.Nested(TipoAutoResumenSchema)
    activo = fields.Bool()
    fecha_creado = fields.DateTime()

class CrearAutoSchema(Schema):
    placa = fields.Str(
        required=True,
        validate=validate.Regexp(
            r'^[A-Z]{3}-\d{3}$',
            error="La placa debe tener el formato ABC-123, con 3 letras en mayúscula, un guion y 3 dígitos."
        ),
        error_messages={"required": "La placa del auto es obligatoria."}
    )
    marca = fields.Str(
        required=True,
        validate=validate.Length(min=1, error="La marca del auto no puede estar vacía."),
        error_messages={"required": "La marca del auto es obligatoria."}
    )

    modelo = fields.Str(
        required=True,
        validate=validate.Length(min=1, error="El modelo del auto no puede estar vacío."),
        error_messages={"required": "El modelo del auto es obligatorio."}
    )

    color = fields.Str(
        required=True,
        validate=validate.Length(min=1, error="El color del auto no puede estar vacío."),
        error_messages={"required": "El color del auto es obligatorio."}
    )

    id_tipo_auto = fields.Int(
        required=True,
        error_messages={"required": "El tipo de auto es obligatorio."}
    )
    def handle_error(self, error, data, **kwargs):   
        formatted_errors = {}
        for field, messages in error.messages.items():
            formatted_errors[field] = messages[0] if isinstance(messages, list) else messages
            raise BadRequest (formatted_errors[field])
        
class ActualizarAutoSchema(Schema):
    marca = fields.Str(
        validate=validate.Length(min=1, error="La marca no puede estar vacía.")
    )
    modelo = fields.Str(
        validate=validate.Length(min=1, error="El modelo no puede estar vacía.")
    )
    color = fields.Str(
        validate=validate.Length(min=1, error="El color no puede estar vacía.")
    )
    id_tipo_auto = fields.Int()
    activo = fields.Bool(
        validate=validate.OneOf([True, False], error="El estado 'activo' debe ser verdadero o falso.")
    )
    def handle_error(self, error, data, **kwargs):   
        formatted_errors = {}
        for field, messages in error.messages.items():
            formatted_errors[field] = messages[0] if isinstance(messages, list) else messages
            raise BadRequest (formatted_errors[field])