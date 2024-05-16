import neo4j from 'neo4j-driver'
import { NextRequest, NextResponse } from 'next/server'
import weaviate, { WeaviateClient, ObjectsBatcher, ApiKey } 
from 'weaviate-ts-client';

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
 
      const properties = {
        email: email,
        firstName: firstName,
        techStack: techStack,
        openSource: openSource,
        learnTech: learnTech,
      }

      // Send data to Weaviate
      let result = await client.data
        .creator()
        .withClassName('Profile')
        .withTenant(process.env.TENANT_ID || "tenant_id_missing")
        .withProperties(properties)
        .do();
  
      // TODO: Extract shared UUID
      // const uuid = result.uuid

      console.log(JSON.stringify(result, null, 2));  // the returned value is the object

      // TODO: Pass shared UUID to Neo4j
      const extendedProperties = {
        ...properties,
        tenant: process.env.TENANT_ID || "tenant_id_missing"
      }

      // Send data to an endpoint which will add the property data into an existing graph
      const n4j_result = await fetch(process.env.NEO4J_IMPORT_URL || "", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.BASIC_AUTH || ""
      },
        body: JSON.stringify(extendedProperties)
      });

      console.log(n4j_result, null, 2);

      return new NextResponse(
        JSON.stringify(
          {
            "response": "success", 
          }), {
        status: 200,
      });
    } catch (error) {

      console.log(error)

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