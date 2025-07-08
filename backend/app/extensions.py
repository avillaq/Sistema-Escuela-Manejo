from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_caching import Cache
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from flask_praetorian import Praetorian
from dotenv import load_dotenv
import os
from flask_mail import Mail
from app.datetime_utils import now_peru

load_dotenv()

# Conexion a la base de datos
db = SQLAlchemy()

# Migracion de la base de datos
migrate = Migrate()

# Limitar el numero de peticiones a la API
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100000 per day", "100000 per hour"],
    storage_uri="memory://",
)

# Configuracion de caching
cache = Cache(config={
    "CACHE_TYPE": "simple",
    "CACHE_DEFAULT_TIMEOUT": 300,
    "CACHE_THRESHOLD": 50,  # max 50 items en cache
})

# Configracion para los CORS
cors = CORS(
    resources={
        r"/api/*": {
            "origins": [
                os.getenv("DEVELOPMENT_HOST"),
                os.getenv("PRODUCTION_HOST")
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Range", "X-Content-Range"],
            "supports_credentials": True
        }
    }
)

# Configuracion para la autenticacion de usuarios 
class TokenBlacklist:
    def __init__(self):
        self._blacklist = {}
    
    def add_token(self, token, exp):
        jti = guard.extract_jwt_token(token)["jti"]
        self._blacklist[jti] = exp
    
    def is_blacklisted(self, jti):
        if jti in self._blacklist:
            if now_peru().timestamp() > self._blacklist[jti]:
                del self._blacklist[jti]
                return False
            return True
        return False

blacklist = TokenBlacklist()
guard = Praetorian()
# Inicializacion de correo
mail = Mail()