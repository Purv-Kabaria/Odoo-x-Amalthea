import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";

export async function GET() {
  const startTime = Date.now();
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    services: {
      database: "unknown",
      api: "healthy"
    },
    responseTime: 0,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    }
  };

  try {
    // Test database connection
    await connectToDatabase();
    healthCheck.services.database = "connected";
    
    // Calculate response time
    healthCheck.responseTime = Date.now() - startTime;
    
    return NextResponse.json(healthCheck, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    healthCheck.status = "unhealthy";
    healthCheck.services.database = "disconnected";
    healthCheck.responseTime = Date.now() - startTime;
    
    // Add error details in development
    if (process.env.NODE_ENV === "development") {
      healthCheck.error = {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      };
    }
    
    return NextResponse.json(healthCheck, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
