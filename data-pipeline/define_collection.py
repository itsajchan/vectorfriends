import os
import weaviate
from weaviate.classes.tenants import Tenant
from weaviate.classes.config import Configure, Property, DataType

from dotenv import load_dotenv

load_dotenv("../.env")

try:
  client = weaviate.connect_to_wcs(
    cluster_url=os.environ.get("WEAVIATE_HOST_URL"),
    auth_credentials=weaviate.auth.AuthApiKey(os.environ.get("WEAVIATE_API_KEY")),
    headers={
        "X-OpenAI-Api-Key": os.environ.get("OPENAI_API_KEY")
    }
  )
except Exception as e:
  print(e)


try:
    profiles_collection = client.collections.create(
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
        multi_tenancy_config=Configure.multi_tenancy(True)
    )

    profiles_collection.tenants.create(
        tenants=[
            Tenant(name="testTenant"),
            Tenant(name=os.environ.get("EVENT_NAME")),
        ]
    )

    tenants = profiles_collection.tenants.get()

    print(tenants)

finally:
    client.close()
