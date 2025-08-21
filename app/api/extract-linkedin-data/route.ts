import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const res = await request.json()

    const { fullName, email, linkedInUri } = res;

    // Log the extracted data
    console.log('Extracted data:');
    console.log('Name:', fullName);
    console.log('Email:', email);
    console.log('LinkedIn URL:', linkedInUri);

    // Send this data to Diffbot Enhance and pull whatever data Diffbot has here
    try {
      const token = process.env.DIFFBOT_TOKEN;
      if (!token) {
        return new NextResponse(
          JSON.stringify(
            {
              "response": "error", 
              "error": "Missing DIFFBOT_TOKEN"
            }), {
          status: 401,
        });
      }

      if (!linkedInUri && !email && !fullName) {
        return new NextResponse(
          JSON.stringify(
            {
              "response": "error", 
              "error": "Provide at least one of linkedinUri, email, or fullName"
            }), {
          status: 401,
        });
      }

      const params = new URLSearchParams({ token, type: "Person" });
      if (fullName) params.set("name", fullName);
      if (email) params.set("email", email);
      if (linkedInUri) { params.set("linkedInUri", linkedInUri); params.append("url", linkedInUri); }

      const r = await fetch(`https://kg.diffbot.com/kg/v3/enhance?${params.toString()}`, { headers: { Accept: "application/json" } });
      const data = await r.json();
      console.log(data['data'][0]['entity']);
      const entityData = data['data'][0]['entity'];
      // Funzies: image, current employment
      
      // Vector embeddings: description, allDescriptions, employments.description
      console.log("[Weaviate] description: ", entityData['description']);
      console.log("[Weaviate] allDescriptions: ", entityData['allDescriptions']);
      console.log("[Weaviate] employments.description: ", entityData['employments'].map(employment => employment['description']));
      // KG nodes: employments.employer, skills, 
      console.log("[Neo4j] skills: ", entityData['skills'])
      console.log("[Neo4j] employments.employer: ", entityData['employments'].map(employment => employment['employer']['name']));

    }
    catch (error) {
      console.log(error);
    }

    try {
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