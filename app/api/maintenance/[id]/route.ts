import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/maintenance/[id]
 * Fetch a single maintenance request by ID
 * Verifies user owns the request before returning data
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please log in to view requests.",
        },
        { status: 401 }
      );
    }

    // 2. Extract request ID from params
    const requestId = params.id;

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          error: "Request ID is required.",
        },
        { status: 400 }
      );
    }

    // 3. Lazy load Prisma to avoid initialization during build
    const { prisma } = await import("@/lib/prisma");

    // 4. Fetch request from database
    const request = await prisma.maintenanceRequest.findUnique({
      where: {
        id: requestId,
      },
    });

    // 5. Check if request exists
    if (!request) {
      return NextResponse.json(
        {
          success: false,
          error: "Request not found.",
        },
        { status: 404 }
      );
    }

    // 6. Verify user owns the request (security check)
    if (request.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to view this request.",
        },
        { status: 403 }
      );
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get Request Error:", error);

    // Handle database errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch request. Please try again.",
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/maintenance/[id]
 * Delete a maintenance request by ID
 * Verifies user owns the request before deleting
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please log in to delete requests.",
        },
        { status: 401 }
      );
    }

    // 2. Extract request ID from params
    const requestId = params.id;

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          error: "Request ID is required.",
        },
        { status: 400 }
      );
    }

    // 3. Lazy load Prisma to avoid initialization during build
    const { prisma } = await import("@/lib/prisma");

    // 4. Fetch request to verify ownership
    const existingRequest = await prisma.maintenanceRequest.findUnique({
      where: {
        id: requestId,
      },
    });

    // 5. Check if request exists
    if (!existingRequest) {
      return NextResponse.json(
        {
          success: false,
          error: "Request not found.",
        },
        { status: 404 }
      );
    }

    // 6. Verify user owns the request (security check)
    if (existingRequest.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to delete this request.",
        },
        { status: 403 }
      );
    }

    // 7. Delete the request
    await prisma.maintenanceRequest.delete({
      where: {
        id: requestId,
      },
    });

    // 8. Return success response
    return NextResponse.json({
      success: true,
      message: "Request deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Request Error:", error);

    // Handle database errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete request. Please try again.",
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
