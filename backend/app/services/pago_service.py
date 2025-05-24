from app.models.pago import Pago
from app.models.matricula import Matricula
from app.extensions import db

def crear_pago(data):
    matricula = Matricula.query.get_or_404(data["id_matricula"])

    pago = Pago(
        id_matricula=matricula.id,
        monto=data["monto"],
    )

    db.session.add(pago)
    db.session.commit()
    return pago

# Los pagos no se actualizan solo se crean y consultan

def listar_pagos():
    return Pago.query.all() # TODO: agregar filtros y paginación

def obtener_pago(id):
    return Pago.query.get_or_404(id)

# TODO: analizar si se debe eliminar un pago mal registrado
# TODO: validar si se han hecho dos pagos por una matrícula (para control de "antes de clase 5").
# TODO: Verificar si el monto acumulado llega al costo del paquete o equivalente por horas.
# TODO: Informar estado de pago al intentar agendar clase o registrar asistencia.