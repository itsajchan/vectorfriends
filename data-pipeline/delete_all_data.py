
import weaviate
import os

from dotenv import load_dotenv

load_dotenv("../.env")

client = weaviate.connect_to_wcs(
    cluster_url=os.environ.get("WEAVIATE_HOST_URL"),
    auth_credentials=weaviate.auth.AuthApiKey(os.environ.get("WEAVIATE_API_KEY")),
    headers={
        "X-OpenAI-Api-Key": os.environ.get("OPENAI_API_KEY")
    }
)

try:
    client.collections.delete('Profile')


finally:
    client.close()
