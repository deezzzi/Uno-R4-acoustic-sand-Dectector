// import { NextResponse } from 'next/server';

// // This function handles GET requests to the API proxy. It fetches data from the specified API_URL, handles errors, and returns the data as a JSON response.


// export async function GET() {
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.106';
//   if (!API_URL) {
//     return NextResponse.error();
//   }

//   const controller = new AbortController();

//   // Create a timeout promise that will abort the fetch and reject after 10 seconds.
//   const timeoutPromise = new Promise<Response>((_resolve, reject) => {
//     setTimeout(() => {
//       controller.abort();
//       reject(new Error('Timeout'));
//     }, 10000);
//   });

//   try {
//     // Start the fetch and race it against the timeout promise.
//     const fetchPromise = fetch(API_URL, { signal: controller.signal });
//     const response = await Promise.race([fetchPromise, timeoutPromise]);

//     if (!response.ok) {
//       throw new Error(`Network response was not ok: ${response.statusText}`);
//     }
//     const data = await response.json();
//     return NextResponse.json(data);
//   } catch (error: unknown) {
//     // If the error is due to timeout or abort, return fallback data.
//     if (error instanceof Error) {
//       if (error.message === 'Timeout' || error.name === 'AbortError') {
//         return NextResponse.json({
//           sandLevel: 0,          // Replace with cached or sensible fallback data if available
//           samplingRate: 0,
//           timestamp: new Date().toISOString(),
//           sampleInterval: 1000
//         });
//       }
//       return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
//     }
//     return new NextResponse(JSON.stringify({ error: 'Unknown error occurred' }), { status: 500 });
//   }
// }


// export async function GET() {
//   // Temporary fallback for debugging purposes
//   return NextResponse.json({
//     sandLevel: 0,
//     samplingRate: 0,
//     timestamp: new Date().toISOString(),
//     sampleInterval: 34000
//   });
// }



// ----------------------------------------------




// "use server";

// import { NextResponse } from 'next/server';

// // In-memory storage for sensor data (for demonstration purposes)
// let latestSensorData = {
//   sandLevel: 0,
//   samplingRate: 1,
//   sampleInterval: 1000,
//   timestamp: Date.now(),
// };

// // GET handler returns the last received sensor data
// export async function GET(request: Request) {
//   return NextResponse.json(latestSensorData);
// }

// // POST handler updates sensor data from external hardware
// export async function POST(request: Request) {
//   try {
//     const data = await request.json();
    
//     // Validate incoming data (adjust as needed)
//     if (typeof data.sandLevel !== 'number') {
//       throw new Error("Invalid data format: sandLevel must be a number.");
//     }
    
//     // Update sensor data (with defaults if some fields are missing)
//     latestSensorData = {
//       sandLevel: data.sandLevel,
//       samplingRate: data.samplingRate || 1,
//       sampleInterval: data.sampleInterval || 1000,
//       timestamp: Date.now(),
//     };
    
//     return NextResponse.json({ message: "Sensor data updated successfully" });
//   } catch (err: unknown) {
//     console.error("Error updating sensor data:", err);
//     return new Response("Failed to update sensor data", { status: 500 });
//   }
// }





// --------------------


"use server";

import { NextResponse } from 'next/server';

// In-memory storage for sensor data (for demonstration purposes)
let latestSensorData = {
  sandLevel: 0,
  samplingRate: 1,
  sampleInterval: 1000,
  timestamp: Date.now(),
};

// GET handler returns the last received sensor data with CORS headers
export async function GET(request: Request) {
  const response = NextResponse.json(latestSensorData);
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
}

// POST handler updates sensor data from external hardware with CORS headers
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate incoming data (adjust as needed)
    if (typeof data.sandLevel !== 'number') {
      throw new Error("Invalid data format: sandLevel must be a number.");
    }
    
    // Update sensor data (with defaults if some fields are missing)
    latestSensorData = {
      sandLevel: data.sandLevel,
      samplingRate: data.samplingRate || 1,
      sampleInterval: data.sampleInterval || 1000,
      timestamp: Date.now(),
    };
    
    const response = NextResponse.json({ message: "Sensor data updated successfully" });
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  } catch (err: unknown) {
    console.error("Error updating sensor data:", err);
    return new Response("Failed to update sensor data", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
}

// OPTIONS handler for preflight CORS requests
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}