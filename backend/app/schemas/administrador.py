from marshmallow import Schema, fields, validate, ValidationError
from werkzeug.exceptions import BadRequest

class AdministradorSchema(Schema):
    id = fields.Int()
    nombre = fields.Str()
    apellidos = fields.Str()
    dni = fields.Str()
    telefono = fields.Str()
    email = fields.Email()
    activo = fields.Bool()
    fecha_creado = fields.DateTime()

def email_opcional(value):
    if not value:
        return value
    try:
        validador_email = validate.Email() 
        return validador_email(value)
    except ValidationError as e:
        #raise ValidationError("Debe ser un correo electrónico válido o dejarse vacío.")
        raise BadRequest ("Debe ser un correo electrónico válido o dejarse vacío.")

class CrearAdministradorSchema(Schema):
    nombre = fields.Str(required=True, validate=validate.Length(min=1, error="El nombre no tiene los caracteres suficientes"))
    apellidos = fields.Str(required=True, validate=validate.Length(min=1, error="El apellido no tiene los caracteres suficientes"))
    dni = fields.Str(required=True, validate=validate.Regexp(
        r'^\d{8}$', 
        error="El DNI debe contener exactamente 8 dígitos numéricos."
    ))
    telefono = fields.Str(required=True, validate=validate.Regexp(
        r'^\d{9}$', 
        error="El teléfono debe contener exactamente 9 dígitos numéricos."
    ))
    email = fields.Str(validate=email_opcional)
    def handle_error(self, error, data, **kwargs):   
        formatted_errors = {}
        for field, messages in error.messages.items():
            formatted_errors[field] = messages[0] if isinstance(messages, list) else messages
            raise BadRequest (formatted_errors[field])
        
class ActualizarAdministradorSchema(Schema):
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