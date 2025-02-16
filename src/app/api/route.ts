"use server";

// In-memory storage for sensor data (for demonstration purposes)
let latestSensorData = {
  sandLevel: 0,
  samplingRate: 1,
  sampleInterval: 1000,
  timestamp: Date.now(),
};

// GET handler returns the last received sensor data with CORS headers
export async function GET() {
  const body = JSON.stringify(latestSensorData);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
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
    
    const body = JSON.stringify({ message: "Sensor data updated successfully" });
    return new Response(body, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: unknown) {
    console.error("Error updating sensor data:", err);
    return new Response("Failed to update sensor data", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}

// OPTIONS handler for preflight CORS requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}