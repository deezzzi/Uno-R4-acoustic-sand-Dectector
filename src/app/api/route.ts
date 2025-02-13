import { NextResponse } from 'next/server';

// This function handles GET requests to the API proxy. It fetches data from the specified API_URL, handles errors, and returns the data as a JSON response.

export async function GET() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.106';
  if (!API_URL) {
    return NextResponse.error();
  }

   // Set a timeout for the fetch request 7 seconds
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 40000);
  
  try 
  {
    const response = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) { // Changed from error: any to error: unknown
    console.error('Error fetching data:', error);
    if (error instanceof Error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
      return new NextResponse(JSON.stringify({ error: 'Unknown error occurred' }), { status: 500 });
  }
} 
