from marshmallow import Schema, fields, validate

class CrearMatriculaSchema(Schema):
    id_alumno = fields.Int(required=True)
    id_paquete = fields.Int(allow_none=True)

class MatriculaSchema(Schema):
    id = fields.Int()
    id_alumno = fields.Int()
    id_paquete = fields.Int(allow_none=True)
    fecha_matricula = fields.DateTime()
    fecha_limite = fields.DateTime()
    estado_pago = fields.Str()
    estado_clases = fields.Str()

class ActualizarMatriculaSchema(Schema):
    id_paquete = fields.Int(allow_none=True)
    estado_pago = fields.Str(validate=validate.OneOf(["pendiente", "completo"]))
    estado_clases = fields.Str(validate=validate.OneOf(["pendiente", "en_progreso", "completado"]))
