
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
    profiles = client.collections.get("Profile")
    named_vectors = ["techStack", "openSource", "learnTech"]


    data_object = profiles.query.near_text('data', target_vector='learnTech', include_vector=named_vectors)
    

    print(data_object)

    for n in named_vectors:
        print(f"Vector '{n}': {data_object.vector[n][:5]}...")

finally:
    client.close()
