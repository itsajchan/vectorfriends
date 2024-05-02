import os
import pprint
import weaviate

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
    profiles = client.collections.get("Profile").with_tenant(os.environ.get("EVENT_NAME"))
    pp = pprint.PrettyPrinter(indent=4)


    for item in profiles.iterator():
        pp.pprint({
            'uuid': item.uuid,
            'properties': item.properties
        })


finally:
    client.close()
