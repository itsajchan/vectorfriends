import os
import resend
import ollama
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

        res1 = profiles.query.near_text(
            item.properties.get('openSource'),
            target_vector='learnTech',
            limit=1,
            return_metadata=MetadataQuery(distance=True)
        )

        res2 = profiles.query.near_text(
            item.properties.get('techStack'),
            target_vector='learnTech',
            limit=1,
            return_metadata=MetadataQuery(distance=True)
        )

        res3 = profiles.query.near_text(
            item.properties.get('learnTech'),
            target_vector='learnTech',
            limit=2,
            return_metadata=MetadataQuery(distance=True)
        )
        
        res4 = profiles.query.near_text(
            item.properties.get('learnTech'),
            target_vector='openSource',
            limit=1,
            return_metadata=MetadataQuery(distance=True)
        )

        res5 = profiles.query.near_text(
            item.properties.get('techStack'),
            target_vector='openSource',
            limit=1,
            return_metadata=MetadataQuery(distance=True)
        )

        res6 = profiles.query.near_text(
            item.properties.get('openSource'),
            target_vector='openSource',
            limit=2,
            return_metadata=MetadataQuery(distance=True)
        )

        res7 = profiles.query.near_text(
            item.properties.get('learnTech'),
            target_vector='techStack',
            limit=1,
            return_metadata=MetadataQuery(distance=True)
        )

        res8 = profiles.query.near_text(
            item.properties.get('openSource'),
            target_vector='techStack',
            limit=1,
            return_metadata=MetadataQuery(distance=True)
        )

        res9 = profiles.query.near_text(
            item.properties.get('techStack'),
            target_vector='techStack',
            limit=2,
            return_metadata=MetadataQuery(distance=True)
        )


        results = []
        responses = [res1, res2, res3, res4, res5, res6, res7, res8, res9]

        for response in responses:
            process_objects(response.objects, results, item.properties.get('email'))

        print('----------------')
        print('----------------')
        print('----------------')

        for person in results:
            print(person.get('distance'), person.get('email'), person.get('uuid'))

            task1 = f'''
                Given the following profiles on these two people, create 3 super short prompts to jumpstart their conversation. Don't respond with addition context, just give the prompts as a valid HTML bulleted unordered list.

                Profile 1:
                {person}

                Profile 2:
                {item.properties}
            '''

            print(task1)

            response = ollama.chat(model='llama3:8b-instruct-q5_1', messages=[
            {
                'role': 'user',
                'content': f'''{task1}''',
            },
            ])

            print(response['message']['content'])

            resend.api_key = os.environ.get("RESEND_API_KEY")

            r = resend.Emails.send({
            "from": "Adam From Weaviate <no-reply@ajchan.io>",
            "to": ["achan99@gmail.com", "adam@weaviate.io"],
            "subject": "Connecting you two!",
            "html": f'''Hi there! I'd love to put you two in touch as you have similarities as identified by Weaviate Vector Search.
            
                <br/><br/>

                {response['message']['content']}

                <br/><br/>

                Please stay in touch with me too! My name is Adam, and you can connect with me on LinkedIn and Twitter here:
                <ul>
                    <li><a href="https://www.linkedin.com/in/itsajchan/">LinkedIn</a></li>
                    <li><a href="https://www.twitter.com/itsajchan/">Twitter</a></li>
                </ul>

                <br/><br/>

                And if you ever want to build anything with <a href="https://www.weaviate.io">Weaviate</a>, I'm here to help!

                <br/><br/>
                Here are the upcoming events and other exciting ways to see what Weaviate is getting up to these days.
                <ul>
                    <li>
                        <a href="https://hubs.ly/Q02tMNTM0">Free Weaviate Trial</a>
                        <a href="https://lu.ma/dspy">DSPy Event with Weaviate + Arize + Cohere + DSpy</a>
                        <a href="https://lu.ma/GitHubHackNight-May14">May 14 Hack Night here at GitHub</a>
                    </li>
                </ul>

                <br/><br/>
                Best,<br/>
                Adam
            
            '''
            })

            import sys
            sys.exit()




finally:
    client.close()
