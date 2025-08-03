from app.models.paquete import Paquete
from app.models.tipo_auto import TipoAuto
from app.extensions import db
from werkzeug.exceptions import BadRequest

def crear_paquete(data):
    nombre = data["nombre"]
    id_tipo_auto=data["id_tipo_auto"]
    if Paquete.query.filter_by(nombre=nombre, id_tipo_auto=id_tipo_auto).first():
        raise BadRequest("Ya existe un paquete con ese nombre y tipo de auto")

    # Verificar que el tipo de auto existe
    tipo_auto = TipoAuto.query.get(data["id_tipo_auto"])
    if not tipo_auto:
        raise BadRequest("El tipo de auto especificado no existe")

    paquete = Paquete(
        nombre=nombre,
        id_tipo_auto=data["id_tipo_auto"],
        horas_total=data.get("horas_total", 0),
        costo_total=data.get("costo_total", 0.0),
    )
    
    db.session.add(paquete)
    db.session.commit()
    return paquete

def listar_paquetes():
    return Paquete.query.all()

def actualizar_paquete(paquete_id, data):
    paquete = Paquete.query.get_or_404(paquete_id)

    # Si se va a actualizar el tipo, verificar que exista
    if "id_tipo_auto" in data:
        tipo_auto = TipoAuto.query.get(data["id_tipo_auto"])
        if not tipo_auto:
            raise BadRequest("El tipo de auto especificado no existe")

    for campo in ["nombre", "id_tipo_auto", "horas_total", "costo_total"]:
        if campo in data:
            setattr(paquete, campo, data[campo])
    
    db.session.commit()
    return paquete