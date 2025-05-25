from marshmallow import Schema, fields, validate

class CrearMatriculaSchema(Schema):
    id_alumno = fields.Int(required=True)
    tipo_contratacion = fields.Str(required=True, validate=validate.OneOf(["paquete", "por_hora"]))
    id_paquete = fields.Int()  # Opcional, dependiendo del tipo
    horas_contratadas = fields.Int()  # Opcional, solo para por_hora
    tarifa_por_hora = fields.Float()  # Opcional, solo para por_hora

class MatriculaSchema(Schema):
    id = fields.Int()
    id_alumno = fields.Int()
    id_paquete = fields.Int(allow_none=True)
    fecha_matricula = fields.DateTime()
    fecha_limite = fields.DateTime()
    estado_pago = fields.Str()
    estado_clases = fields.Str()
