
import { NextRequest, NextResponse } from 'next/server';

// This route acts as a proxy for the external agent hierarchy API.
// It ensures that the method, headers, and body are correctly formatted,
// just like the successful cURL command.

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // The external API endpoint for updating the hierarchy.
    const externalApiUrl = 'https://ariac.sariac.qzz.io/agent/hierarchy';

    // Forward the request to the external API with the correct settings.
    const response = await fetch(externalApiUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Handle non-OK responses from the external API.
    if (!response.ok) {
        const errorData = await response.json();
        console.error('External API Error:', errorData);
        return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('Error in agent hierarchy proxy route:', error);
    return NextResponse.json(
      { error: 'Internal server error in the proxy route.' },
      { status: 500 }
    );
  }
}
