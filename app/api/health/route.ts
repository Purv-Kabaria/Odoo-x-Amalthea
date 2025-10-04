import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";

export async function GET() {
  try {
    await connectToDatabase();
    
    return NextResponse.json(
      { 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        database: "connected"
      }, 
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        status: "unhealthy", 
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 503 }
    );
  }
}
