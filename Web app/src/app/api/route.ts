import { NextResponse } from 'next/server';

export async function GET() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.106';
  if (!API_URL) {
    return NextResponse.error();
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
