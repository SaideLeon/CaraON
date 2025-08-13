
import { NextRequest, NextResponse } from 'next/server';

// This route acts as a proxy to get the agent hierarchy for a specific instance.

export async function GET(
    req: NextRequest, 
    { params }: { params: { instanceId: string } }
) {
  const { instanceId } = params;

  if (!instanceId) {
    return NextResponse.json({ error: 'Instance ID is required' }, { status: 400 });
  }

  try {
    // The external API endpoint for fetching an instance's hierarchy.
    const externalApiUrl = `https://ariac.sariac.qzz.io/agent/instances/${instanceId}`;

    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('External API Error:', errorData);
        return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('Error in get agent hierarchy proxy route:', error);
    return NextResponse.json(
      { error: 'Internal server error in the proxy route.' },
      { status: 500 }
    );
  }
}
