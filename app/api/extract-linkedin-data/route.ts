import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const res = await request.json()

    const { firstName, email, linkedInUrl } = res;

    // Log the extracted data
    console.log('Extracted data:');
    console.log('Name:', firstName);
    console.log('Email:', email);
    console.log('LinkedIn URL:', linkedInUrl);

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