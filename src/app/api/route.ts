// import { NextResponse } from 'next/server';


// export async function GET() {
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.106';
//   if (!API_URL) {
//     return NextResponse.error();
//   }

   // Set a timeout for the fetch request 7 seconds



import { NextResponse } from 'next/server';

// This function handles GET requests to the API proxy. It fetches data from the specified API_URL, handles errors, and returns the data as a JSON response.


export async function GET() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.106';
  if (!API_URL) {
    return NextResponse.error();
  }

  const controller = new AbortController();

  // Create a timeout promise that will abort the fetch and reject after 10 seconds.
  const timeoutPromise = new Promise<Response>((_resolve, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error('Timeout'));
    }, 10000);
  });

  try {
    // Start the fetch and race it against the timeout promise.
    const fetchPromise = fetch(API_URL, { signal: controller.signal });
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    // If the error is due to timeout or abort, return fallback data.
    if (error instanceof Error) {
      if (error.message === 'Timeout' || error.name === 'AbortError') {
        return NextResponse.json({
          sandLevel: 0,          // Replace with cached or sensible fallback data if available
          samplingRate: 0,
          timestamp: new Date().toISOString(),
          sampleInterval: 1000
        });
      }
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new NextResponse(JSON.stringify({ error: 'Unknown error occurred' }), { status: 500 });
  }
}