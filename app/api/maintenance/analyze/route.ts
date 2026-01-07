import { NextResponse } from "next/server";
import { maintenanceRequestSchema } from "@/lib/validations";
import { analyzeMaintenanceRequest, parseAIResponse } from "@/lib/ai";

/**
 * POST /api/maintenance/analyze
 * Analyze a maintenance request using AI
 */
export async function POST(request: Request) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();

    // Validate input schema
    const validatedData = maintenanceRequestSchema.parse(body);

    // 2. Construct context for AI
    const contextParts = [];
    if (validatedData.propertyAddress) {
      contextParts.push(`Property Address: ${validatedData.propertyAddress}`);
    }
    if (validatedData.category) {
      contextParts.push(`Category: ${validatedData.category}`);
    }

    const context = contextParts.length > 0 ? contextParts.join("\n") : undefined;

    // 3. Call AI to analyze the request
    const aiText = await analyzeMaintenanceRequest(
      validatedData.description,
      context
    );

    // 4. Parse AI response into structured format
    const analysis = parseAIResponse(aiText);

    // 5. Return structured data
    return NextResponse.json({
      success: true,
      data: {
        description: validatedData.description,
        propertyAddress: validatedData.propertyAddress,
        category: validatedData.category,
        ...analysis,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("AI Analysis Error:", error);

    // Handle different error types
    if (error instanceof Error) {
      // Zod validation error
      if (error.name === "ZodError") {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid input data",
            details: error.message,
          },
          { status: 400 }
        );
      }

      // OpenAI API key missing
      if (error.message.includes("OpenAI API key is missing")) {
        return NextResponse.json(
          {
            success: false,
            error: "AI service not configured. Please contact support.",
          },
          { status: 503 }
        );
      }

      // Timeout error
      if (error.message.includes("timeout") || error.name === "AbortError") {
        return NextResponse.json(
          {
            success: false,
            error: "Analysis timed out. Please try again.",
          },
          { status: 504 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze request. Please try again.",
      },
      { status: 500 }
    );
  }
}
