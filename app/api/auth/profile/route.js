// app/api/auth/profile/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];

    // Call the backend API to get profile
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const response = await fetch(`${backendUrl}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || data.message || "Failed to fetch profile",
          message: data.message,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile retrieved successfully",
      data: data.data || data,
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
