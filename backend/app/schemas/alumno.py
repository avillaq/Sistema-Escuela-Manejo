from marshmallow import Schema, fields, validate, ValidationError
from werkzeug.exceptions import BadRequest

class AlumnoSchema(Schema):
    id = fields.Int()
    nombre = fields.Str()
    apellidos = fields.Str()
    dni = fields.Str()
    telefono = fields.Str()
    email = fields.Email()
    activo = fields.Bool()
    fecha_creado = fields.DateTime()

def email_opcional(value):
    if value == "":
        return value
    try:
        validador_email = validate.Email() 
        return validador_email(value)
    except ValidationError as e:
        #raise ValidationError("Debe ser un correo electrónico válido o dejarse vacío.")
        raise BadRequest ("Debe ser un correo electrónico válido o dejarse vacío.")
    
class CrearAlumnoSchema(Schema):
    nombre = fields.Str(
        required=True,
        validate=validate.Length(min=1, error="El nombre no tiene los caracteres suficientes."),
        error_messages={"required": "El nombre es obligatorio."}
    )

    apellidos = fields.Str(
        required=True,
        validate=validate.Length(min=1, error="El apellido no tiene los caracteres suficientes."),
        error_messages={"required": "El apellido es obligatorio."}
    )

    dni = fields.Str(
        required=True,
        validate=validate.Regexp(
            r'^\d{8}$', 
            error="El DNI debe contener exactamente 8 dígitos numéricos."
        ),
        error_messages={"required": "El DNI es obligatorio."}
    )

    telefono = fields.Str(
        required=True,
        validate=validate.Regexp(
            r'^\d{9}$', 
            error="El teléfono debe contener exactamente 9 dígitos numéricos."
        ),
        error_messages={"required": "El teléfono es obligatorio."}
    )

    email = fields.Str(validate=email_opcional)

    def handle_error(self, error, data, **kwargs):
        formatted_errors = {}
        for field, messages in error.messages.items():
            formatted_errors[field] = messages[0] if isinstance(messages, list) else messages
        raise BadRequest(formatted_errors[field])

class ActualizarAlumnoSchema(Schema):
    nombre = fields.Str()
    apellidos = fields.Str()
    dni = fields.Str(required=True, validate=validate.Regexp(
        r'^\d{8}$', 
        error="El DNI debe contener exactamente 8 dígitos numéricos."
    ))
    telefono = fields.Str(required=True, validate=validate.Regexp(
        r'^\d{9}$', 
        error="El teléfono debe contener exactamente 9 dígitos numéricos."
    ))
    email = fields.Str(validate=email_opcional)
    activo = fields.Bool(validate=validate.OneOf([True, False]))
    def handle_error(self, error, data, **kwargs):   
        formatted_errors = {}
        for field, messages in error.messages.items():
            formatted_errors[field] = messages[0] if isinstance(messages, list) else messages
            raise BadRequest (formatted_errors[field])
