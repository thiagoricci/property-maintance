"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface AnalysisData {
  description: string;
  propertyAddress?: string;
  category?: string;
  diagnosis: string;
  urgency: "low" | "medium" | "high";
  estimatedCost: string;
  contractorType: string;
  nextSteps: string;
  timestamp: string;
}

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Parse analysis data from URL
    const dataParam = searchParams.get("data");
    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam));
        setAnalysisData(decodedData);
      } catch (error) {
        console.error("Failed to parse analysis data:", error);
        router.push("/requests/new");
      }
    } else {
      // No data provided, redirect to form
      router.push("/requests/new");
    }
  }, [searchParams, router]);

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/maintenance/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to save request");
      }

      setSaveSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save request"
      );
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!analysisData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">
          Analysis Results
        </h1>
        <p className="text-black">
          AI-powered analysis of your maintenance issue
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Request saved successfully! Redirecting to dashboard...
            </span>
          </div>
        </div>
      )}

      {/* Analysis Cards */}
      <div className="space-y-6">
        {/* Diagnosis Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold text-black mb-3">
            Diagnosis
          </h2>
          <p className="text-black leading-relaxed">
            {analysisData.diagnosis}
          </p>
        </div>

        {/* Urgency Card */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-black mb-3">
            Urgency Level
          </h2>
          <div className="flex items-center">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border ${getUrgencyBadge(
                analysisData.urgency
              )}`}
            >
              {analysisData.urgency.toUpperCase()}
            </span>
            <span className="ml-4 text-sm text-black">
              {analysisData.urgency === "high" &&
                "Requires immediate attention"}
              {analysisData.urgency === "medium" &&
                "Should be addressed soon"}
              {analysisData.urgency === "low" &&
                "Can wait for scheduled maintenance"}
            </span>
          </div>
        </div>

        {/* Estimated Cost Card */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-black mb-3">
            Estimated Cost
          </h2>
          <p className="text-2xl font-bold text-blue-600">
            {analysisData.estimatedCost}
          </p>
          <p className="text-sm text-black mt-2">
            * This is an estimate based on typical market rates. Actual costs may
            vary based on location and severity.
          </p>
        </div>

        {/* Contractor Type Card */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-black mb-3">
            Recommended Contractor
          </h2>
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-blue-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-lg font-medium text-black">
              {analysisData.contractorType}
            </span>
          </div>
        </div>

        {/* Next Steps Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-green-500">
          <h2 className="text-xl font-semibold text-black mb-3">
            Recommended Next Steps
          </h2>
          <div className="space-y-3">
            {analysisData.nextSteps
              .split(/\d+\.|\n/)
              .filter((step) => step.trim())
              .map((step, index) => (
                <div key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <p className="text-black leading-relaxed">{step.trim()}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Original Request Info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-3">
            Original Request
          </h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-black">Description:</span>
              <p className="text-black mt-1">
                {analysisData.description}
              </p>
            </div>
            {analysisData.propertyAddress && (
              <div>
                <span className="font-medium text-black">
                  Property Address:
                </span>
                <p className="text-black mt-1">
                  {analysisData.propertyAddress}
                </p>
              </div>
            )}
            {analysisData.category && (
              <div>
                <span className="font-medium text-black">Category:</span>
                <p className="text-black mt-1">
                  {analysisData.category}
                </p>
              </div>
            )}
            <div>
              <span className="font-medium text-black">
                Analysis Date:
              </span>
              <p className="text-black mt-1">
                {formatTimestamp(analysisData.timestamp)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {saveError && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{saveError}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex items-center justify-center space-x-4">
        <button
          onClick={() => router.push("/requests/new")}
          className="px-6 py-3 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || saveSuccess}
        >
          Submit Another Request
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading || saveSuccess}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save to History"
          )}
        </button>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <AnalysisContent />
    </Suspense>
  );
}
