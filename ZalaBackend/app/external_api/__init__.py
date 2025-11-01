from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
BRAVE_API_KEY = os.getenv("BRAVE_API_KEY")