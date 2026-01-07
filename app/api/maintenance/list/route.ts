import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/maintenance/list
 * Fetch all maintenance requests for the authenticated user
 * Query params:
 *   - urgency: optional filter by urgency level (high|medium|low)
 *   - page: optional page number for pagination (default: 1)
 *   - limit: optional items per page (default: 20)
 */
export async function GET(request: Request) {
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

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const urgencyFilter = searchParams.get("urgency");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // 3. Build where clause
    const where: any = {
      userId: session.user.id,
    };

    // Add urgency filter if provided
    if (urgencyFilter && ["high", "medium", "low"].includes(urgencyFilter)) {
      where.urgency = urgencyFilter;
    }

    // 4. Calculate pagination
    const skip = (page - 1) * limit;

    // 5. Fetch requests from database
    const [requests, totalCount] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.maintenanceRequest.count({ where }),
    ]);

    // 6. Return success response
    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("List Requests Error:", error);

    // Handle database errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch requests. Please try again.",
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
