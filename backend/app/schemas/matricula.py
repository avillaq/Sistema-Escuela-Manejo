from marshmallow import Schema, fields

class CrearMatriculaSchema(Schema):
    id_alumno = fields.Int(required=True)
    id_paquete = fields.Int(allow_none=True)
    fecha_matricula = fields.Date(required=True)

class MatriculaSchema(Schema):
    id = fields.Int()
    id_alumno = fields.Int()
    id_paquete = fields.Int(allow_none=True)
    fecha_matricula = fields.Date()
    fecha_limite = fields.Date()
    estado = fields.Str()