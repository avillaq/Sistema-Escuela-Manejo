from app.models.usuario import Usuario
from app.models.alumno import Alumno
from app.extensions import db, guard
from app.models.matricula import Matricula
from werkzeug.exceptions import BadRequest
from sqlalchemy import or_, desc

def crear_alumno(data):
    dni = data["dni"]
    if Usuario.query.filter_by(nombre_usuario=dni).first():
        raise BadRequest("Ya existe un usuario con este DNI")

    # Crear usuario
    usuario = Usuario(
        nombre_usuario=dni,
        contraseña_hash=guard.hash_password(dni),
        rol="alumno"
    )
    db.session.add(usuario)
    db.session.flush()

    # Crear alumno
    alumno = Alumno(
        id_usuario=usuario.id,
        nombre=data["nombre"],
        apellidos=data["apellidos"],
        dni=dni,
        telefono=data["telefono"],
        email=data["email"],
    )
    db.session.add(alumno)
    db.session.commit()
    return alumno

def listar_alumnos(
    page=1, 
    per_page=20, 
    busqueda=None, 
    estado=None,
    tiene_matricula=None
):
    query = Alumno.query
    # Filtro por busqueda
    if busqueda:
        busqueda_like = f"%{busqueda.lower()}%"
        query = query.filter(
            or_(
                Alumno.nombre.ilike(busqueda_like),
                Alumno.apellidos.ilike(busqueda_like),
                Alumno.dni.ilike(busqueda_like),
                Alumno.email.ilike(busqueda_like)
            )
        )
    
    # Filtro por estado
    if estado is not None:
        query = query.filter(Alumno.activo == estado)
    
    # Filtro por matrícula
    if tiene_matricula == "si":
        query = query.join(Matricula).filter(Matricula.id.isnot(None))
    elif tiene_matricula == "no":
        query = query.outerjoin(Matricula).filter(Matricula.id.is_(None))
    
    # Ordenación
    query = query.order_by(desc(Alumno.id))
    
    # Paginación
    return query.paginate(
        page=page, 
        per_page=per_page, 
        error_out=False
    )

def obtener_estadisticas_alumnos():
    total = Alumno.query.count()
    activos = Alumno.query.filter(Alumno.activo == True).count()
    inactivos = Alumno.query.filter(Alumno.activo == False).count()
    con_matricula = Alumno.query.join(Matricula).count()
    sin_matricula = total - con_matricula
    
    return {
        "total": total,
        "activos": activos,
        "inactivos": inactivos,
        "con_matricula": con_matricula,
        "sin_matricula": sin_matricula
    }

def actualizar_alumno(alumno_id, data):
    alumno = Alumno.query.get_or_404(alumno_id)

    for campo in ["nombre", "apellidos", "telefono", "email", "dni", "activo"]:
        if campo in data:
            setattr(alumno, campo, data[campo])
    
    db.session.commit()
    return alumno

def eliminar_alumno(alumno_id):
    alumno = Alumno.query.get_or_404(alumno_id)
    alumno.activo = False
    db.session.commit()
