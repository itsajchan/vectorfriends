import os
import pprint
import weaviate
from weaviate.classes.query import MetadataQuery

from dotenv import load_dotenv

load_dotenv("../.env")

def process_objects(objects, results, profile_email):
    for o in objects:

        if profile_email == o.properties.get('email'):
            # Skip the the object in analysis if it is the same as the profile under evaluation
            continue

        # Check if the object is already in results
        if any(result['uuid'] == o.uuid for result in results):
            continue

        # Store new object into results
        data = o.properties
        data['distance'] = o.metadata.distance
        data['uuid'] = o.uuid
        results.append(data)


client = weaviate.connect_to_wcs(
    cluster_url=os.environ.get("WEAVIATE_HOST_URL"),
    auth_credentials=weaviate.auth.AuthApiKey(os.environ.get("WEAVIATE_API_KEY")),
    headers={
        "X-OpenAI-Api-Key": os.environ.get("OPENAI_API_KEY")
    }
)

try:
    profiles = client.collections.get("Profile").with_tenant("testTenant")

    for item in profiles.iterator():

        print("---- Examining ----")
        print(f"{item.properties.get('firstName')} - {item.properties.get('email')}")

        res1 = profiles.query.near_text(item.properties.get('openSource'), target_vector='learnTech', limit=1, return_metadata=MetadataQuery(distance=True))
        res2 = profiles.query.near_text(item.properties.get('techStack'), target_vector='learnTech', limit=1, return_metadata=MetadataQuery(distance=True))
        res3 = profiles.query.near_text(item.properties.get('learnTech'), target_vector='learnTech', limit=2, return_metadata=MetadataQuery(distance=True))

        res4 = profiles.query.near_text(item.properties.get('learnTech'), target_vector='openSource', limit=1, return_metadata=MetadataQuery(distance=True))
        res5 = profiles.query.near_text(item.properties.get('techStack'), target_vector='openSource', limit=1, return_metadata=MetadataQuery(distance=True))
        res6 = profiles.query.near_text(item.properties.get('openSource'), target_vector='openSource', limit=2, return_metadata=MetadataQuery(distance=True))

        res7 = profiles.query.near_text(item.properties.get('learnTech'), target_vector='techStack', limit=1, return_metadata=MetadataQuery(distance=True))
        res8 = profiles.query.near_text(item.properties.get('openSource'), target_vector='techStack', limit=1, return_metadata=MetadataQuery(distance=True))
        res9 = profiles.query.near_text(item.properties.get('techStack'), target_vector='techStack', limit=2, return_metadata=MetadataQuery(distance=True))

        results = []
        responses = [res1, res2, res3, res4, res5, res6, res7, res8, res9]

        for response in responses:
            process_objects(response.objects, results, item.properties.get('email'))

        print('----------------')
        print('----------------')
        print('----------------')

        for profiles in results:
            print(profiles.get('distance'), profiles.get('email'), profiles.get('uuid'))

        import sys
        sys.exit()


finally:
    client.close()
