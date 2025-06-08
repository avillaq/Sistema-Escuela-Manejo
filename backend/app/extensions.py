from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from flask_praetorian import Praetorian
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

# Conexion a la base de datos
db = SQLAlchemy()

# Migracion de la base de datos
migrate = Migrate()

# Limitar el numero de peticiones a la API
limiter = Limiter(
    key_func=get_remote_address
)

# Configracion para los CORS
cors = CORS(
    resources={
        r"/api/*": {
            "origins": [
                os.getenv('DEVELOPMENT_HOST'),
                os.getenv('PRODUCTION_HOST')
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
            if datetime.now().timestamp() > self._blacklist[jti]:
                del self._blacklist[jti]
                return False
            return True
        return False

blacklist = TokenBlacklist()
guard = Praetorian()