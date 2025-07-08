import os
import sys
from datetime import time, timedelta
from app.datetime_utils import today_peru

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app.models import Bloque, Matricula
from app.extensions import db
from app.services import reserva_service

def generar_bloques(semanas_futuro=2):
    hoy = today_peru()
    fecha_final = hoy + timedelta(days=7 * semanas_futuro)
    
    # Definir horarios
    HORARIOS_LUNES_SABADO = [
        (time(7, 0), time(8, 0)),  # 7am - 8am
        (time(8, 0), time(9, 0)), 
        (time(9, 0), time(10, 0)),
        (time(10, 0), time(11, 0)),
        (time(11, 0), time(12, 0)),
        (time(12, 0), time(13, 0)),
        (time(13, 0), time(14, 0)),
        (time(14, 0), time(15, 0)),
        (time(15, 0), time(16, 0)),
        (time(16, 0), time(17, 0)),
        (time(17, 0), time(18, 0)),
    ]
    
    HORARIOS_DOMINGO = HORARIOS_LUNES_SABADO[:5]  # Solo hasta mediodia
    
    bloques_creados = 0
    fecha_actual = hoy
    
    while fecha_actual <= fecha_final:
        # Determinar qué horarios usar según el día de la semana
        es_domingo = fecha_actual.weekday() == 6
        horarios = HORARIOS_DOMINGO if es_domingo else HORARIOS_LUNES_SABADO
        
        for hora_inicio, hora_fin in horarios:
            # Verificar si ya existe un bloque para esta fecha y hora
            bloque_existente = Bloque.query.filter_by(
                fecha=fecha_actual,
                hora_inicio=hora_inicio,
                hora_fin=hora_fin
            ).first()
            
            if not bloque_existente:
                # Crear nuevo bloque
                bloque = Bloque(
                    fecha=fecha_actual,
                    hora_inicio=hora_inicio,
                    hora_fin=hora_fin,
                    capacidad_max=5,
                    reservas_actuales=0
                )
                db.session.add(bloque)
                bloques_creados += 1
        
        fecha_actual += timedelta(days=1)
    
    if bloques_creados > 0:
        db.session.commit()
        print(f"Se crearon {bloques_creados} bloques nuevos")
    else:
        print("No se requirió crear bloques nuevos")
    return bloques_creados

def limpiar_bloques_vacios():
    ayer = today_peru() - timedelta(days=1)
    
    # Encontrar bloques pasados sin reservas
    bloques_para_eliminar = Bloque.query.filter(
        Bloque.fecha < ayer,
        Bloque.reservas_actuales == 0
    ).all()
    
    cantidad = len(bloques_para_eliminar)
    
    if cantidad > 0:
        for bloque in bloques_para_eliminar:
            db.session.delete(bloque)
        
        db.session.commit()
        print(f"Se eliminaron {cantidad} bloques vacíos")        
    else:
        print("No hay bloques vacíos para eliminar")
    return cantidad

def verificar_pagos_pendiente():
    matriculas = Matricula.query.filter(
        Matricula.horas_completadas == 3,
        Matricula.estado_pago == "pendiente",
    ).all()

    return matriculas

def verificar_clases_reservadas():
    reservas = reserva_service.listar_reservas_hoy()
    return reservas

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "limpiar":
        limpiar_bloques_vacios()
    else:
        generar_bloques(semanas_futuro=2)