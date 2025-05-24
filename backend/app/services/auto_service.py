from app.models.auto import Auto
from app.models.tipo_auto import TipoAuto
from app.extensions import db
from werkzeug.exceptions import BadRequest

def crear_auto(data):
    placa = data["placa"]
    if Auto.query.filter_by(placa=placa).first():
        raise BadRequest("Ya existe un auto con esta placa")

    # Verificar que el tipo de auto existe
    tipo_auto = TipoAuto.query.get(data["id_tipo_auto"])
    if not tipo_auto:
        raise BadRequest("El tipo de auto especificado no existe")

    auto = Auto(
        placa=placa,
        marca=data["marca"],
        modelo=data["modelo"],
        color=data["color"],
        id_tipo_auto=data["id_tipo_auto"],
        activo=True
    )
    
    db.session.add(auto)
    db.session.commit()
    return auto

def listar_autos():
    return Auto.query.all()  # TODO: agregar filtros y paginación

def actualizar_auto(auto_id, data):
    auto = Auto.query.get_or_404(auto_id)

    # Si se va a actualizar el tipo, verificar que exista
    if "id_tipo_auto" in data:
        tipo_auto = TipoAuto.query.get(data["id_tipo_auto"])
        if not tipo_auto:
            raise BadRequest("El tipo de auto especificado no existe")

    for campo in ["marca", "modelo", "color", "id_tipo_auto", "activo"]:
        if campo in data:
            setattr(auto, campo, data[campo])
    
    db.session.commit()
    return auto

def eliminar_auto(auto_id):
    auto = Auto.query.get_or_404(auto_id)
    db.session.delete(auto)
    db.session.commit()