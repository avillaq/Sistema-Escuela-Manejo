from marshmallow import Schema, fields, validate
from werkzeug.exceptions import BadRequest

class CrearMatriculaSchema(Schema):
    id_alumno = fields.Int(
        required=True,
        error_messages={"required": "El ID del alumno es obligatorio."}
    )

    tipo_contratacion = fields.Str(
        required=True,
        validate=validate.OneOf(
            ["paquete", "por_hora"],
            error="El tipo de contratación debe ser 'paquete' o 'por_hora'."
        ),
        error_messages={"required": "El tipo de contratación es obligatorio."}
    )

    id_paquete = fields.Int()  # Opcional

    horas_contratadas = fields.Int(
        validate=validate.Range(
            min=1,
            error="Las horas contratadas deben ser al menos 1 hora."
        )
    )

    tarifa_por_hora = fields.Float(
        validate=validate.Range(
            min=1.0,
            error="La tarifa por hora debe ser al menos 1.0 soles."
        )
    )

    categoria = fields.Str(
        required=True,
        validate=validate.OneOf(
            ["A-I", "A-II"],
            error="La categoría debe ser 'A-I' o 'A-II'."
        ),
        error_messages={"required": "La categoría es obligatoria."}
    )
    def handle_error(self, error, data, **kwargs):   
        formatted_errors = {}
        for field, messages in error.messages.items():
            formatted_errors[field] = messages[0] if isinstance(messages, list) else messages
            raise BadRequest (formatted_errors[field])
        
class MatriculaSchema(Schema):
    id = fields.Int()
    id_alumno = fields.Int()
    id_paquete = fields.Int(allow_none=True)
    tipo_contratacion = fields.Str()
    horas_contratadas = fields.Int()
    tarifa_por_hora = fields.Float()
    costo_total = fields.Float()
    fecha_matricula = fields.DateTime()
    fecha_limite = fields.DateTime()
    estado_pago = fields.Str()
    estado_clases = fields.Str()
    horas_completadas = fields.Int()
    categoria = fields.Str()

# Estos esquemas son para la lista de matrículas, que incluye información resumida del alumno y del paquete
class AlumnoResumenSchema(Schema):
    id = fields.Int()
    nombre = fields.Str()
    apellidos = fields.Str()
    dni = fields.Str()
    email = fields.Email()
    telefono = fields.Str()
    activo = fields.Boolean()

class TipoAutoResumenSchema(Schema):
    id = fields.Int()
    tipo = fields.Str()

class PaqueteResumenSchema(Schema):
    nombre = fields.Str()
    tipo_auto = fields.Nested(TipoAutoResumenSchema)
    horas_total = fields.Int()
    costo_total = fields.Float()

class MatriculaResumenSchema(Schema):
    id = fields.Int()
    alumno = fields.Nested(AlumnoResumenSchema)
    categoria = fields.Str()
    tipo_contratacion = fields.Str()
    paquete = fields.Nested(PaqueteResumenSchema, allow_none=True)
    horas_contratadas = fields.Int(allow_none=True)
    tarifa_por_hora = fields.Float(allow_none=True)
    fecha_matricula = fields.DateTime()
    estado_clases = fields.Str()
    estado_pago = fields.Str()
    horas_completadas = fields.Int()
    pagos_realizados = fields.Float()
    saldo_pendiente = fields.Float()
    costo_total = fields.Float()
    reservas_pendientes = fields.Int()
    horas_disponibles_reserva = fields.Int()