import requests, sys, re, pprint, json
from openai import OpenAI
from __init__ import OPENAI_API_KEY, BRAVE_API_KEY
# from to_leads import openai_to_leads

client = OpenAI(api_key=OPENAI_API_KEY)

gpt_model = "gpt-5-mini"

prompt = """
What are the three biggest news stories in the US for June 20 1968?
"""

# Search with Brave API
def web_search(query: str, count: int = 10):
    url = "https://api.search.brave.com/res/v1/web/search"
    headers = {
        "Accept": "application/json",
        "X-Subscription-Token": BRAVE_API_KEY
    }
    params = {"q": query.strip(), "count": count, "country": "US"}
    resp = requests.get(url, headers=headers, params=params)
    resp.raise_for_status()
    data = resp.json()
    
    results = []
    for item in data.get("web", {}).get("results", []):
        title = item.get("title", "")
        desc = item.get("description", "")
        item_url = item.get("url", "")
        results.append(f"{title}\n{desc}\n{item_url}")
    return "\n\n".join(results[:count]) or "No results found."
    
# Define the function schema for GPT
tools = [
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web for up-to-date information using a web search API.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query to look up."},
                    "count": {"type": "integer", "description": "Number of results to return", "default": 10}
                },
                "required": ["query"]
            }
        }
    }
]
    
# Get response from AI, providing web search results as needed
def chat_with_brave(prompt: str):
    messages = [
        {"role": "system", "content": "You are a helpful assistant that can use the web_search tool when you need recent or factual information."},
        {"role": "user", "content": prompt}
    ]

    while True:
        response = client.chat.completions.create(
            model=gpt_model,
            messages=messages,
            tools=tools
        )

        message = response.choices[0].message

        # If the model calls a tool, handle it
        if message.tool_calls:
            for tool_call in message.tool_calls:
                fn_name = tool_call.function.name
                args = json.loads(tool_call.function.arguments)

                if fn_name == "web_search":
                    print(f"\n[Web Search: {args['query']}]\n")
                    search_results = web_search(args["query"], args.get("count", 10))

                    messages.append(message)  # include model’s tool call
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": search_results
                    })
                    break
            continue

        # Otherwise, final answer
        print("\nResponse:\n", message.content)
        break

if __name__ == "__main__":
    chat_with_brave(prompt)