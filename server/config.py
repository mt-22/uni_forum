from dotenv import load_dotenv
import os
import psycopg2

load_dotenv()

class ApplicationConfig:
    SECRET_KEY = os.environ['SECRET_KEY']

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True
    #SQLALCHEMY_DATABASE_URI = r"sqlite:///./db.sqlite"
    SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://postgres:clapped_E46@localhost:5432/uni_chat'