// app/api/auth/profile/route.js - MINIMAL WORKING VERSION
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    console.log("Profile API called");

    // For now, just return a test response
    return NextResponse.json({
      success: true,
      message: "Profile API is working",
      data: {
        id: "test-id",
        email: "test@example.com",
        name: "Test User",
        user_type: "customer",
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch profile",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Creating profile with data:", body);

    return NextResponse.json({
      success: true,
      message: "Profile created",
      data: {
        id: "new-test-id",
        email: body.email || "test@example.com",
        name: body.name || "Test User",
        user_type: body.user_type || "customer",
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create profile",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
