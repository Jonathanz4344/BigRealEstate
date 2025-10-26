import requests, sys, re, pprint, json
from openai import OpenAI
from __init__ import OPENAI_API_KEY, BRAVE_API_KEY
# from to_leads import openai_to_leads

prompt = """
What's the news for October 25, 2025?
"""

client = OpenAI(api_key=OPENAI_API_KEY)

response = client.chat.completions.create(
    model = "gpt-5-mini",
    messages = [
        {"role": "user", "content": prompt}
    ]
)

print(response.choices[0].message.content)