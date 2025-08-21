import weaviate from 'weaviate-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const res = await request.json()

    // Extract the Diffbot data from the request
    const { data } = res;

    console.log('Received Diffbot data for vector ingestion:');
    console.log('Image:', data?.image);
    console.log('Current Employment:', data?.currentEmployment);
    console.log('Description:', data?.description);
    console.log('All Descriptions:', data?.allDescriptions);
    console.log('Employment Descriptions:', data?.employmentDescriptions);
    console.log('Skills:', data?.skills);
    console.log('Employers:', data?.employers);

    // Best practice: store your credentials in environment variables
    const weaviateUrl = process.env.WEAVIATE_URL as string;
    const weaviateApiKey = process.env.WEAVIATE_API_KEY as string;

    const client = await weaviate.connectToWeaviateCloud(
      weaviateUrl,  
      {
        authCredentials: new weaviate.ApiKey(weaviateApiKey),  
      }
    )

    try {
      // Check if the collection exists, create if it doesn't
      const collections = await client.collections.listAll();
      const collectionExists = collections.some((col: any) => col.name === 'HackerFriendsProfiles');
      
      if (!collectionExists) {
        await client.collections.create({
          name: 'HackerFriendsProfiles',
          properties: [
            { name: 'name', dataType: 'text' as const },
            { name: 'email', dataType: 'text' as const },
            { name: 'linkedinUri', dataType: 'text' as const },
            { name: 'description', dataType: 'text' as const },
            { name: 'allDescriptions', dataType: 'text' as const },
            { name: 'employmentDescriptions', dataType: 'text' as const },
            { name: 'skills', dataType: 'text' as const },
            { name: 'employers', dataType: 'text' as const },
          ],
          vectorizers: [
            weaviate.configure.vectors.text2VecWeaviate({
                name: 'description_vector',
                sourceProperties: ['description', 'allDescriptions', 'employmentDescriptions'],
                model: 'Snowflake/snowflake-arctic-embed-l-v2.0',
              },
            ),
          ],
        });
        console.log('Created HackerFriendsProfiles collection');
      }

      // Store the Diffbot data into Weaviate
      const myCollection = client.collections.get('HackerFriendsProfiles');

      // Prepare the data object for insertion
      const dataObject = {
        name: res.firstName || 'Unknown',
        email: res.email || '',
        linkedinUri: res.linkedInUrl || '',
        description: data?.description || '',
        allDescriptions: Array.isArray(data?.allDescriptions) ? data.allDescriptions.join(' ') : (data?.allDescriptions || ''),
        employmentDescriptions: Array.isArray(data?.employmentDescriptions) ? data.employmentDescriptions.join(' ') : '',
        skills: Array.isArray(data?.skills) ? data.skills.join(', ') : '',
        employers: Array.isArray(data?.employers) ? data.employers.join(', ') : ''
      };

      console.log('Inserting data object:', dataObject);
      const insertResponse = await myCollection.data.insert(dataObject);
      console.log('Weaviate insert response:', insertResponse);

      return new NextResponse(
        JSON.stringify({
          "response": "success", 
          "message": "Diffbot data successfully ingested into Weaviate",
          "weaviateId": insertResponse.uuid
        }), {
        status: 200,
      });

    } catch (error) {
      console.error('Error in vector ingestion:', error);
      return new NextResponse(
        JSON.stringify({
          "response": "error", 
          "error": error
        }), {
        status: 500,
      });
    } finally {
      client.close();
    }
}