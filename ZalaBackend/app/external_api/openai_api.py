import requests, sys, re, pprint, json
from openai import OpenAI
from __init__ import OPENAI_API_KEY, BRAVE_API_KEY
# from to_leads import openai_to_leads
import time

client = OpenAI(api_key=OPENAI_API_KEY)

gpt_model = "gpt-5-mini"

max_searches = 10

prompt_start = "I am a real estate agent, and I am looking to contact real estate agents in "

prompt_end = """ that have a good chance of being interested in buying one of my properties or getting me in contact with clients interested in buying. Try to find all the details before returning, but do not hallucinate. Leave a field blank if you need to.
Format exactly like this:
{ 
firstName: "", 
lastName: "", 
phoneNumber: "", 
email: "", 
website: "", 
businessName: "",
licenseNum: "",
address: ""
}
Make sure:
The output contains only characters that can be easily stored or parsed (no hidden Unicode, citations, or formatting artifacts).
Do not return anything except the clean JSON array.
Each entry should contain firstName, lastName, and email at minimum.
Prioritize obtaining addresses over license numbers.
Return 10 agents.
"""

# Search with Brave API
def web_search(query: str, count: int = 10):
    time.sleep(1)  # Add 1 second delay between searches because of API rate limit with free tier
    # restrict count to allowed sizes
    if count > 20:
        count = 20
    elif count < 1:
        count = 1

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
def search_agents(location: str):
    prompt = prompt_start + location + prompt_end # create prompt string by adding the specified location to the middle of the prompt start and end strings

    messages = [
        {"role": "system", "content": f"You can use the web_search tool when you need recent or factual information. You have a maximum of {max_searches} searches, so use them wisely to get as much information as you can."},
        {"role": "user", "content": prompt}
    ]

    search_count = 0
    while True:
        response = client.chat.completions.create(
            model=gpt_model,
            messages=messages,
            tools=tools
        )

        message = response.choices[0].message

        # If the model requests tool calls, handle all of them
        if message.tool_calls:
            if search_count >= max_searches:
                print(f"\nDEBUG PRINT: [Reached max searches ({max_searches}), requesting final answer]\n")
                messages.append({
                    "role": "user",
                    "content": "You've reached the search limit. Please provide your best answer based on the information you've gathered."
                })
                response = client.chat.completions.create(
                    model=gpt_model,
                    messages=messages
                )
                print("\nDEBUG PRINT: Response:\n", response.choices[0].message.content)
                break
            messages.append(message)  # include model’s tool call
            for tool_call in message.tool_calls:
                fn_name = tool_call.function.name
                args = json.loads(tool_call.function.arguments)

                if fn_name == "web_search":
                    search_count += 1
                    print(f"\nDEBUG PRINT: [Web Search {search_count}/{max_searches}: {args['query']}]\n")
                    search_results = web_search(args["query"], args.get("count", 10))

                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": search_results
                    })
            continue

        # Otherwise, final answer
        print("\nDEBUG PRINT: Response:\n", message.content)
        break

if __name__ == "__main__":
    search_agents("Houston, TX")