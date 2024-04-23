import os
import json
import ollama
import weaviate
from dotenv import load_dotenv

load_dotenv("../.env")

task1 = '''
Only respond with valid JSON, don't include anything outside of the JSON. Here's an example of JSON I want you to generate. 
{
    "techStack": "<INSERT AN INTERESTING TECHNOLOGY STACK, BE RANDOM!!!",
    "learnTech": "<COME UP WITH AN INTERESTING TECHNOLOGY AREA TO LEARN ABOUT, COULD BE WEB RELATED, AI, BITCOIN, Or ANYTHING! BE VERBOSE>",
    "openSource": "<INSERT A RANDOM OPENSOURCE PROJECT AND EXPLAIN WHAT IT IS>",
    "email": "<GENERATE A RANDOM EMAIL ADDRESS THAT MATCHES THE FIRST NAME>",
    "firstName": "<GENERATE A HIGHLY RANDOMIZED FIRST NAME>",
}

Generate an objects that look like the above but with randomized responses and input, but be a bit more verbose than the above example.
'''

response = ollama.chat(model='llama3:8b-instruct-q5_1', messages=[
  {
    'role': 'user',
    'content': f'''{task1}''',
  },
])


client = weaviate.connect_to_wcs(
    cluster_url=os.environ.get("WEAVIATE_HOST_URL"),
    auth_credentials=weaviate.auth.AuthApiKey(os.environ.get("WEAVIATE_API_KEY")),
    headers={
        "X-OpenAI-Api-Key": os.environ.get("OPENAI_API_KEY")
    }
)

try:
    profiles = client.collections.get("Profile").with_tenant("testTenant")

    uuid = profiles.data.insert(json.loads(response['message']['content']))

    print(uuid)  # the return value is the object's UUID

finally:
    client.close()
