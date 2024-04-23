import { NextRequest, NextResponse } from 'next/server'
import weaviate, { WeaviateClient, ObjectsBatcher, ApiKey } from 'weaviate-ts-client';

export async function POST(request: NextRequest) {
    const res = await request.json()

    const { firstName, techStack, openSource, learnTech, email } = res;

    const client: WeaviateClient = weaviate.client({
      scheme: 'https',
      host: process.env.WEAVIATE_HOST_URL || "",  // Replace with your Weaviate endpoint
      apiKey: new ApiKey(process.env.WEAVIATE_API_KEY|| ""),  // Replace with your Weaviate instance API key
      headers: { 'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || ""},  // Replace with your inference API key
    });

    try {
 
      let result = await client.data
        .creator()
        .withClassName('Profile')
        .withTenant('GitHubApr23')
        .withProperties({
          email: email,
          firstName: firstName,
          techStack: techStack,
          openSource: openSource,
          learnTech: learnTech,
        })
        .do();
  
      console.log(JSON.stringify(result, null, 2));  // the returned value is the object
  
      return new NextResponse(
        JSON.stringify(
          {
            "response": "success", 
          }), {
        status: 200,
      });
    } catch (error) {

      return new NextResponse(
        JSON.stringify(
          {
            "response": "error", 
            "error": error
          }), {
        status: 401,
      });
    }

}