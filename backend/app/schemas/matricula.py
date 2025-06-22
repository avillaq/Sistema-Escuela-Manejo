from marshmallow import Schema, fields, validate

class CrearMatriculaSchema(Schema):
    id_alumno = fields.Int(required=True)
    tipo_contratacion = fields.Str(required=True, validate=validate.OneOf(["paquete", "por_hora"]))
    id_paquete = fields.Int()  # Opcional, dependiendo del tipo
    horas_contratadas = fields.Int(validate=validate.Range(
        min=1,
        error="Las horas contratadas deben ser al menos 1 hora"    
    ))  # Opcional, solo para por_hora
    tarifa_por_hora = fields.Float(validate=validate.Range(
        min=1.0,
        error="La tarifa por hora debe ser al menos 1.0 soles"
    ))  # Opcional, solo para por_hora
    categoria = fields.Str(required=True, validate=validate.OneOf(["A-I", "A-II"]))

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