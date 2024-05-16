import os
import json
import ollama
import weaviate
from dotenv import load_dotenv
import requests

load_dotenv("../.env")

task1 = """
Only respond with valid JSON, don't include anything outside of the JSON. Here's an example of JSON I want you to generate. 
{
    "techStack": "<INSERT AN INTERESTING TECHNOLOGY STACK, BE RANDOM!!!",
    "learnTech": "<COME UP WITH AN INTERESTING TECHNOLOGY AREA TO LEARN ABOUT, COULD BE WEB RELATED, AI, BITCOIN, Or ANYTHING! BE VERBOSE>",
    "openSource": "<INSERT A RANDOM OPENSOURCE PROJECT AND EXPLAIN WHAT IT IS>",
    "email": "<GENERATE A RANDOM EMAIL ADDRESS THAT MATCHES THE FIRST NAME>",
    "firstName": "<GENERATE A HIGHLY RANDOMIZED FIRST NAME>",
}

Generate an objects that look like the above but with randomized responses and input, but be a bit more verbose than the above example.
"""

response = ollama.chat(
    model="llama3",
    messages=[
        {
            "role": "user",
            "content": f"""{task1}""",
        },
    ],
)
# generated data
try:
    gdata = json.loads(response["message"]["content"])
except Exception as e:
    print(
        f"Problem converting response from LLM to valid JSON. Response received: {response}. Response type: {type(response)}"
    )

# Insert to Weaviate
client = weaviate.connect_to_wcs(
    cluster_url=os.environ.get("WEAVIATE_HOST_URL"),
    auth_credentials=weaviate.auth.AuthApiKey(os.environ.get("WEAVIATE_API_KEY")),
    headers={"X-OpenAI-Api-Key": os.environ.get("OPENAI_API_KEY")},
)

try:
    profiles = client.collections.get("Profile").with_tenant("testTenant")

    uuid = profiles.data.insert(gdata)

    print(uuid)  # the return value is the object's UUID

finally:
    client.close()

# Send to Neo4j
url = os.environ.get("NEO4J_IMPORT_URL")
headers = {
    "Content-Type": "application/json",
    "Authorization": os.environ.get("BASIC_AUTH"),
}
gdata["tenant"] = "testTenant"
data = gdata

try:
    n4j_response = requests.post(url, headers=headers, json=data)

    if n4j_response.status_code == 200:
        print("Data sent to Neo4j import endpoint successfully")
    else:
        print(f"Error: {n4j_response.status_code} - {n4j_response.text}")
except Exception as e:
    print(f"Problem sending data to Neo4j import endpoint at {url}. Error: {e}")
