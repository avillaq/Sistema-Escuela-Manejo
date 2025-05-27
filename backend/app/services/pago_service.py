from app.models.pago import Pago
from app.models.matricula import Matricula
from app.extensions import db
from sqlalchemy import func
from werkzeug.exceptions import BadRequest

def crear_pago(data):
    matricula = Matricula.query.get_or_404(data["id_matricula"])
    monto = data["monto"]

    # Verificar si el monto excede el saldo pendiente
    total_pagado = db.session.query(func.sum(Pago.monto)).filter_by(id_matricula=matricula.id).scalar() or 0
    pendiente = matricula.costo_total - total_pagado
    
    if monto > pendiente:
        raise BadRequest(f"El monto excede el saldo pendiente ({pendiente})")
    
    pago = Pago(
        id_matricula=matricula.id,
        monto=monto,
    )

    # Actualizar estado de pago si se completó el total
    nuevo_total = total_pagado + monto
    if nuevo_total >= matricula.costo_total:
        matricula.estado_pago = "completo"

    db.session.add(pago)
    db.session.commit()
    return pago

def listar_pagos():
    return Pago.query.all() # TODO: agregar filtros y paginación

def obtener_pago(id):
    return Pago.query.get_or_404(id)

# TODO: analizar si se debe eliminar un pago mal registrado