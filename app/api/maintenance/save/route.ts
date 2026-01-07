import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/maintenance/save
 * Save an analyzed maintenance request to the database
 */
export async function POST(request: Request) {
  try {
    // 1. Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please log in to save requests.",
        },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();

    // 3. Validate required fields
    const requiredFields = ["description", "diagnosis", "urgency"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          details: missingFields,
        },
        { status: 400 }
      );
    }

    // 4. Normalize urgency to lowercase
    const urgency = body.urgency?.toLowerCase();
    if (!["low", "medium", "high"].includes(urgency)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid urgency value. Must be low, medium, or high.",
        },
        { status: 400 }
      );
    }

    // 5. Lazy load Prisma to avoid initialization during build
    const { prisma } = await import("@/lib/prisma");

    // 6. Save to database
    const savedRequest = await prisma.maintenanceRequest.create({
      data: {
        userId: session.user.id,
        description: body.description,
        propertyAddress: body.propertyAddress || null,
        category: body.category || null,
        diagnosis: body.diagnosis,
        urgency: urgency as "low" | "medium" | "high",
        estimatedCost: body.estimatedCost || null,
        contractorType: body.contractorType || null,
        nextSteps: body.nextSteps || null,
        status: "analyzed",
      },
    });

    // 6. Return success response
    return NextResponse.json({
      success: true,
      data: {
        id: savedRequest.id,
        createdAt: savedRequest.createdAt,
      },
    });
  } catch (error) {
    console.error("Save Request Error:", error);

    // Handle database errors
    if (error instanceof Error) {
      // Prisma unique constraint violation
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          {
            success: false,
            error: "Duplicate request.",
          },
          { status: 409 }
        );
      }

      // Foreign key constraint (user doesn't exist)
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found. Please log in again.",
          },
          { status: 404 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save request. Please try again.",
      },
      { status: 500 }
    );
  }
}
