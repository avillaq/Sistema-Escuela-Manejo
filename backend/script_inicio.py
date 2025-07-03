import os
import sys

# Añadir la ruta del proyecto para importar módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models.tipo_auto import TipoAuto
from app.models.auto import Auto
from app.models.paquete import Paquete
from app.models.alumno import Alumno
from app.models.instructor import Instructor
from app.models.administrador import Administrador
from app.services.alumno_service import crear_alumno
from app.services.instructor_service import crear_instructor
from app.services.administrador_service import crear_administrador

def poblar_db():
    app = create_app()
    
    with app.app_context():
        print("Iniciando población de la base de datos...")
        
        #tipos de auto
        if TipoAuto.query.count() > 0:
            print("Ya existen tipos de auto en la base de datos. Saltando...")
        else:
            print("Agregando tipos de auto...")
            tipo_mecanico = TipoAuto(tipo='Mecánico')
            tipo_automatico = TipoAuto(tipo='Automático')
            
            db.session.add_all([tipo_mecanico, tipo_automatico])
            db.session.commit()
            
            print(f"Tipos de auto agregados: mecánico (ID: {tipo_mecanico.id}), automático (ID: {tipo_automatico.id})")
        
        tipo_mecanico = TipoAuto.query.filter_by(tipo='Mecánico').first()
        tipo_automatico = TipoAuto.query.filter_by(tipo='Automático').first()
        print(f"Tipo mecánico: {tipo_mecanico}, Tipo automático: {tipo_automatico}")

        #paquetes
        if Paquete.query.count() > 0:
            print("Ya existen paquetes en la base de datos. Saltando...")
        else:
            print("Agregando paquetes...")
            paquetes = [
                Paquete(nombre='Básico', id_tipo_auto=tipo_mecanico.id, horas_total=15, costo_total=640.0),
                Paquete(nombre='Intermedio', id_tipo_auto=tipo_mecanico.id, horas_total=10, costo_total=430.0),
                Paquete(nombre='Avanzado', id_tipo_auto=tipo_mecanico.id, horas_total=5, costo_total=220.0),
                Paquete(nombre='Básico', id_tipo_auto=tipo_automatico.id, horas_total=0, costo_total=0.0),
                Paquete(nombre='Intermedio', id_tipo_auto=tipo_automatico.id, horas_total=10, costo_total=480.0),
                Paquete(nombre='Avanzado', id_tipo_auto=tipo_automatico.id, horas_total=5, costo_total=250.0),
            ]
            
            db.session.add_all(paquetes)
            db.session.commit()
            print(f"Se agregaron {len(paquetes)} paquetes")
        
        # autos
        if Auto.query.count() >= 10:
            print("Ya existen al menos 10 autos en la base de datos. Saltando...")
        else:
            print("Agregando autos...")
            autos = [
                Auto(placa='ABC-123', marca='Toyota', modelo='Yaris', color='Rojo', id_tipo_auto=tipo_mecanico.id),
                Auto(placa='DEF-456', marca='Nissan', modelo='Versa', color='Azul', id_tipo_auto=tipo_mecanico.id),
                Auto(placa='GHI-789', marca='Kia', modelo='Rio', color='Blanco', id_tipo_auto=tipo_mecanico.id),
                Auto(placa='JKL-012', marca='Hyundai', modelo='Accent', color='Negro', id_tipo_auto=tipo_mecanico.id),
                Auto(placa='MNO-345', marca='Chevrolet', modelo='Sail', color='Gris', id_tipo_auto=tipo_mecanico.id),
                Auto(placa='PQR-678', marca='Toyota', modelo='Corolla', color='Plateado', id_tipo_auto=tipo_automatico.id),
                Auto(placa='STU-901', marca='Hyundai', modelo='Elantra', color='Negro', id_tipo_auto=tipo_automatico.id),
                Auto(placa='VWX-234', marca='Kia', modelo='Cerato', color='Rojo', id_tipo_auto=tipo_automatico.id),
                Auto(placa='YZA-567', marca='Nissan', modelo='Sentra', color='Blanco', id_tipo_auto=tipo_automatico.id),
                Auto(placa='BCD-890', marca='Honda', modelo='Civic', color='Azul', id_tipo_auto=tipo_automatico.id),
            ]
            
            db.session.add_all(autos)
            db.session.commit()
            print(f"Se agregaron {len(autos)} autos")
        
        
        # administrador
        if not Administrador.query.filter_by(dni='12345678').first():
            print("Creando administrador...")
            admin_data = {
                'nombre': 'Juan Carlos',
                'apellidos': 'Pérez García',
                'dni': '12345678',
                'telefono': '987654321',
                'email': 'admin@escuela.com'
            }
            admin = crear_administrador(admin_data)
            print(f"Administrador creado: {admin.nombre} {admin.apellidos} (DNI: {admin.dni})")
            print(f"  Usuario: {admin.dni} | Contraseña: {admin.dni}")
        else:
            print("Ya existe un administrador con DNI 12345678. Saltando...")
        
        # instructores
        instructores_data = [
            {
                'nombre': 'María Elena',
                'apellidos': 'González Rodríguez',
                'dni': '87654321',
                'telefono': '965432178',
                'email': 'instructor1@escuela.com'
            },
            {
                'nombre': 'Roberto Luis',
                'apellidos': 'Fernández Castro',
                'dni': '78945612',
                'telefono': '954123789',
                'email': 'instructor2@escuela.com'
            },
            {
                'nombre': 'Ana Patricia',
                'apellidos': 'Silva Vargas',
                'dni': '65432198',
                'telefono': '987456321',
                'email': 'instructor3@escuela.com'
            },
            {
                'nombre': 'Miguel Ángel',
                'apellidos': 'Torres Mendoza',
                'dni': '54321987',
                'telefono': '976543210',
                'email': 'instructor4@escuela.com'
            },
            {
                'nombre': 'Carmen Rosa',
                'apellidos': 'Morales Herrera',
                'dni': '43219876',
                'telefono': '965789432',
                'email': 'instructor5@escuela.com'
            }
        ]
        
        for instructor_data in instructores_data:
            if not Instructor.query.filter_by(dni=instructor_data['dni']).first():
                print(f"Creando instructor {instructor_data['nombre']}...")
                instructor = crear_instructor(instructor_data)
                print(f"Instructor creado: {instructor.nombre} {instructor.apellidos} (DNI: {instructor.dni})")
                print(f"  Usuario: {instructor.dni} | Contraseña: {instructor.dni}")
            else:
                print(f"Ya existe un instructor con DNI {instructor_data['dni']}. Saltando...")
        
        # alumnos
        alumnos_data = [
            {
                'nombre': 'Carlos Miguel',
                'apellidos': 'Ramírez López',
                'dni': '11223344',
                'telefono': '912345678',
                'email': 'alumno1@email.com'
            },
            {
                'nombre': 'Laura Sofía',
                'apellidos': 'Martínez Flores',
                'dni': '22334455',
                'telefono': '923456789',
                'email': 'alumno2@email.com'
            },
            {
                'nombre': 'Diego Alejandro',
                'apellidos': 'Vega Santana',
                'dni': '33445566',
                'telefono': '934567890',
                'email': 'alumno3@email.com'
            },
            {
                'nombre': 'Valeria Nicole',
                'apellidos': 'Jiménez Ruiz',
                'dni': '44556677',
                'telefono': '945678901',
                'email': 'alumno4@email.com'
            },
            {
                'nombre': 'Andrés Felipe',
                'apellidos': 'Campos Quispe',
                'dni': '55667788',
                'telefono': '956789012',
                'email': 'alumno5@email.com'
            }
        ]
        
        for alumno_data in alumnos_data:
            if not Alumno.query.filter_by(dni=alumno_data['dni']).first():
                print(f"Creando alumno {alumno_data['nombre']}...")
                alumno = crear_alumno(alumno_data)
                print(f"Alumno creado: {alumno.nombre} {alumno.apellidos} (DNI: {alumno.dni})")
                print(f"  Usuario: {alumno.dni} | Contraseña: {alumno.dni}")
            else:
                print(f"Ya existe un alumno con DNI {alumno_data['dni']}. Saltando...")
        
        print("\n¡Población de la base de datos completada!")

if __name__ == "__main__":
    poblar_db()