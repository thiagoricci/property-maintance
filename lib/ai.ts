import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { MAINTENANCE_ANALYSIS_SYSTEM_PROMPT } from "./ai/prompts";

/**
 * Configure OpenAI model for AI analysis
 * Uses gpt-4-turbo-preview for cost-effective, fast responses
 */
export const aiModel = openai("gpt-4-turbo-preview");

/**
 * Analyze a maintenance request using AI
 * @param description - The issue description from the user
 * @param context - Optional context (property address, category, etc.)
 * @returns AI-generated analysis as text
 */
export async function analyzeMaintenanceRequest(
  description: string,
  context?: string
): Promise<string> {
  // Validate API key is present
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key is missing. Please set OPENAI_API_KEY environment variable."
    );
  }

  // Construct prompt with context if provided
  const prompt = context
    ? `${context}\n\nIssue Description: ${description}`
    : description;

  // Call AI with timeout
  const { text } = await generateText({
    model: aiModel,
    system: MAINTENANCE_ANALYSIS_SYSTEM_PROMPT,
    prompt,
    temperature: 0.7,
    timeout: 10000, // 10 seconds
  });

  return text;
}

/**
 * Parse AI response into structured format
 * Extracts the 5 required components from the AI text response
 */
export function parseAIResponse(aiText: string): {
  diagnosis: string;
  urgency: "low" | "medium" | "high";
  estimatedCost: string;
  contractorType: string;
  nextSteps: string;
} {
  const lines = aiText.split("\n").filter((line) => line.trim());

  let diagnosis = "";
  let urgency: "low" | "medium" | "high" = "medium";
  let estimatedCost = "";
  let contractorType = "";
  let nextSteps = "";

  let currentSection = "";

  for (const line of lines) {
    const upperLine = line.toUpperCase();

    if (upperLine.includes("DIAGNOSIS:")) {
      currentSection = "diagnosis";
      diagnosis = line.replace(/.*DIAGNOSIS:\s*/i, "").trim();
    } else if (upperLine.includes("URGENCY:")) {
      currentSection = "urgency";
      const urgencyText = line
        .replace(/.*URGENCY:\s*/i, "")
        .trim()
        .toLowerCase();
      urgency = urgencyText.includes("high")
        ? "high"
        : urgencyText.includes("low")
        ? "low"
        : "medium";
    } else if (upperLine.includes("ESTIMATED COST:")) {
      currentSection = "estimatedCost";
      estimatedCost = line.replace(/.*ESTIMATED COST:\s*/i, "").trim();
    } else if (upperLine.includes("CONTRACTOR TYPE:")) {
      currentSection = "contractorType";
      contractorType = line.replace(/.*CONTRACTOR TYPE:\s*/i, "").trim();
    } else if (upperLine.includes("NEXT STEPS:")) {
      currentSection = "nextSteps";
      nextSteps = line.replace(/.*NEXT STEPS:\s*/i, "").trim();
    } else if (currentSection && line.trim()) {
      // Append to current section
      if (currentSection === "diagnosis") {
        diagnosis += " " + line.trim();
      } else if (currentSection === "estimatedCost") {
        estimatedCost += " " + line.trim();
      } else if (currentSection === "contractorType") {
        contractorType += " " + line.trim();
      } else if (currentSection === "nextSteps") {
        nextSteps += " " + line.trim();
      }
    }
  }

  // Fallback values if parsing failed
  if (!diagnosis) {
    diagnosis = aiText.substring(0, 200); // Use first 200 chars as fallback
  }
  if (!estimatedCost) {
    estimatedCost = "Contact contractor for estimate";
  }
  if (!contractorType) {
    contractorType = "General contractor";
  }
  if (!nextSteps) {
    nextSteps = "Contact a professional for assessment";
  }

  return {
    diagnosis: diagnosis.trim(),
    urgency,
    estimatedCost: estimatedCost.trim(),
    contractorType: contractorType.trim(),
    nextSteps: nextSteps.trim(),
  };
}
