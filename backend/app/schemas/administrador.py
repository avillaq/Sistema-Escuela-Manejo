from marshmallow import Schema, fields, validate, ValidationError

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
        raise ValidationError("Debe ser un correo electrónico válido o dejarse vacío.")

class CrearAdministradorSchema(Schema):
    nombre = fields.Str(required=True)
    apellidos = fields.Str(required=True)
    dni = fields.Str(required=True, validate=validate.Regexp(
        r'^\d{8}$', 
        error="El DNI debe contener exactamente 8 dígitos numéricos."
    ))
    telefono = fields.Str(required=True, validate=validate.Regexp(
        r'^\d{9}$', 
        error="El teléfono debe contener exactamente 9 dígitos numéricos."
    ))
    email = fields.Str(validate=email_opcional)

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