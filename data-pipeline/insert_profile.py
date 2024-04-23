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
    profiles = client.collections.get("Profile").with_tenant("testTenant")

    uuid = profiles.data.insert({
       "techStack": "Angular + Django + Redis",
        "learnTech": "Artificial Intelligence and Natural Language Processing",
        "openSource": "Image Classification - A tool built with TensorFlow to classify images",
        "email": "Martin.chen@icloud.com",
        "firstName": "Martin"
})

    print(uuid)  # the return value is the object's UUID

finally:
    client.close()
