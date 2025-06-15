import os
import sys
from datetime import datetime

# Añadir la ruta del proyecto para importar módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db
from app.models.tipo_auto import TipoAuto
from app.models.auto import Auto
from app.models.paquete import Paquete

def poblar_db():
    app = create_app()
    
    with app.app_context():
        print("Iniciando población de la base de datos...")
        
        if TipoAuto.query.count() > 0:
            print("Ya existen tipos de auto en la base de datos. Saltando...")
        else:
            print("Agregando tipos de auto...")
            tipo_mecanico = TipoAuto(tipo='Mecánico')
            tipo_automatico = TipoAuto(tipo='Automático')
            
            db.session.add_all([tipo_mecanico, tipo_automatico])
            db.session.commit()
            
            print(f"Tipos de auto agregados: mecánico (ID: {tipo_mecanico.id}), automático (ID: {tipo_automatico.id})")
        
        tipo_mecanico = TipoAuto.query.filter_by(tipo='mecánico').first()
        tipo_automatico = TipoAuto.query.filter_by(tipo='automático').first()
        
        if Paquete.query.count() > 0:
            print("Ya existen paquetes en la base de datos. Saltando...")
        else:
            print("Agregando paquetes...")
            paquetes = [
                Paquete(nombre='Básico', id_tipo_auto=tipo_mecanico.id, horas_total=15, costo_total=640.0),
                Paquete(nombre='Intermedio', id_tipo_auto=tipo_mecanico.id, horas_total=10, costo_total=430.0),
                Paquete(nombre='Avanzado', id_tipo_auto=tipo_mecanico.id, horas_total=5, costo_total=220.0),
                Paquete(nombre='Básico', id_tipo_auto=tipo_automatico.id, horas_total=15, costo_total=640.0),
                Paquete(nombre='Intermedio', id_tipo_auto=tipo_automatico.id, horas_total=10, costo_total=480.0),
                Paquete(nombre='Avanzado', id_tipo_auto=tipo_automatico.id, horas_total=5, costo_total=250.0),
            ]
            
            db.session.add_all(paquetes)
            db.session.commit()
            print(f"Se agregaron {len(paquetes)} paquetes")
        
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
        
        print("¡Población de la base de datos completada!")

if __name__ == "__main__":
    poblar_db()