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
      
      // Extract the data we need
      const extractedData = {
        // Funzies: image, current employment
        image: entityData['image'] as string | undefined,
        currentEmployment: entityData['employments']?.[0] as {
          description?: string;
          employer?: { name: string };
          title?: string;
          from?: string;
          to?: string;
        } | undefined,
        
        // Vector embeddings: description, allDescriptions, employments.description
        description: entityData['description'] as string | undefined,
        allDescriptions: entityData['allDescriptions'] as string[] | undefined,
        employmentDescriptions: (entityData['employments'] as Array<{ description?: string }> | undefined)?.map(employment => employment['description']).filter(Boolean) || [],
        
        // KG nodes: employments.employer, skills
        skills: (entityData['skills'] as Array<{ name: string }> | undefined)?.map(skill => skill.name) || [],
        employers: (entityData['employments'] as Array<{ employer?: { name: string } }> | undefined)?.map(employment => employment['employer']?.name).filter(Boolean) || []
      };

      console.log("[Weaviate] description: ", extractedData.description);
      console.log("[Weaviate] allDescriptions: ", extractedData.allDescriptions);
      console.log("[Weaviate] employments.description: ", extractedData.employmentDescriptions);
      console.log("[Neo4j] skills: ", extractedData.skills);
      console.log("[Neo4j] employments.employer: ", extractedData.employers);

      return new NextResponse(
        JSON.stringify({
          response: "success",
          data: extractedData
        }), {
        status: 200,
      });

    }
    catch (error) {
      console.log(error);
      return new NextResponse(
        JSON.stringify({
          response: "error", 
          error: error
        }), {
        status: 500,
      });
    }

}