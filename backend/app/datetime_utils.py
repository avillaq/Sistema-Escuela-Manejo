from datetime import datetime
import pytz

# Zona horaria Perú
PERU_TZ = pytz.timezone('America/Lima')
UTC_TZ = pytz.UTC

def now_utc():
    """Retorna la fecha y hora actual en UTC"""
    return datetime.now(UTC_TZ)

def now_peru():
    """Retorna la fecha y hora actual en zona horaria de Perú"""
    return datetime.now(PERU_TZ)

def to_peru_timezone(dt_utc):
    """Convierte un datetime UTC a zona horaria de Perú"""
    if dt_utc.tzinfo is None:
        dt_utc = UTC_TZ.localize(dt_utc)
    return dt_utc.astimezone(PERU_TZ)

def to_utc(dt_peru):
    """Convierte un datetime de zona horaria de Perú a UTC"""
    if dt_peru.tzinfo is None:
        dt_peru = PERU_TZ.localize(dt_peru)
    return dt_peru.astimezone(UTC_TZ)

def today_peru():
    """Retorna la fecha actual en zona horaria de Perú"""
    return now_peru().date()

def combine_peru(date_obj, time_obj):
    """
    Combina fecha y hora y localiza en zona horaria de Perú
    
    Args:
        date_obj: objeto date
        time_obj: objeto time
    
    Returns:
        datetime con timezone de Perú
    """
    dt_naive = datetime.combine(date_obj, time_obj)
    return PERU_TZ.localize(dt_naive)

def combine_utc(date_obj, time_obj):
    """
    Combina fecha y hora y localiza en UTC
    
    Args:
        date_obj: objeto date
        time_obj: objeto time
    
    Returns:
        datetime con timezone UTC
    """
    dt_naive = datetime.combine(date_obj, time_obj)
    return UTC_TZ.localize(dt_naive)