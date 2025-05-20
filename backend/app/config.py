import os
from dotenv import load_dotenv

load_dotenv()

class Config:
  SECRET_KEY = os.getenv("SECRET_KEY")
  SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI_LOCAL')
  SQLALCHEMY_TRACK_MODIFICATIONS = False
  JWT_ACCESS_LIFESPAN = {"hours": 1}
  JWT_REFRESH_LIFESPAN = {"days": 14}
