from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
