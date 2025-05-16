import os
from dotenv import load_dotenv

load_dotenv()

class Config:
  SECRET_KEY = os.getenv("SECRET_KEY")
  SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI')
  SQLALCHEMY_TRACK_MODIFICATIONS = False
  JWT_ACCESS_LIFESPAN = {"days": 2} # We don't use refresh tokens. So, we set the lifespan of the access token to 2 days.
  JWT_REFRESH_LIFESPAN = {"days": 30}
