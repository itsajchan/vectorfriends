
from weaviate.classes.config import Configure, Property, DataType
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
    client.collections.create(
        "Profile",
        properties=[  # Define properties
            Property(name="firstName", data_type=DataType.TEXT),
            Property(name="email", data_type=DataType.TEXT),
            Property(name="techStack", data_type=DataType.TEXT),
            Property(name="openSource", data_type=DataType.TEXT),
            Property(name="learnTech", data_type=DataType.TEXT),
        ],

        vectorizer_config=[
            # Set a named vector
            Configure.NamedVectors.text2vec_openai(
                name="techStack", source_properties=["techStack"]
            ),
            # Set another named vector
            Configure.NamedVectors.text2vec_openai(
                name="openSource", source_properties=["openSource"]
            ),
            # Set another named vector
            Configure.NamedVectors.text2vec_openai(
                name="learnTech", source_properties=["learnTech"]
            ),
        ],
    )


finally:
    client.close()
