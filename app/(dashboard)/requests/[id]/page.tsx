"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface MaintenanceRequest {
  id: string;
  description: string;
  propertyAddress: string | null;
  category: string | null;
  diagnosis: string | null;
  urgency: string | null;
  estimatedCost: string | null;
  contractorType: string | null;
  nextSteps: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();

  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (params.id && session) {
      fetchRequest();
    }
  }, [params.id, session]);

  const fetchRequest = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/maintenance/${params.id}`);
      const result = await response.json();

      if (!result.success) {
        if (response.status === 404) {
          throw new Error("Request not found");
        } else if (response.status === 403) {
          throw new Error("You don't have permission to view this request");
        } else {
          throw new Error(result.error || "Failed to fetch request");
        }
      }

      setRequest(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch request");
      setRequest(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/maintenance/${params.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to delete request");
      }

      // Redirect to dashboard after successful deletion
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete request");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getUrgencyBadge = (urgency: string | null) => {
    if (!urgency) {
      return "bg-gray-100 text-gray-800 border-gray-200";
    }
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

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
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
            <span>{error}</span>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Request Details
            </h1>
            <p className="text-black">
              View the complete analysis of your maintenance request
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Original Request Info */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-black mb-4">
          Original Request
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Description
            </label>
            <p className="text-black leading-relaxed">
              {request.description}
            </p>
          </div>
          {request.propertyAddress && (
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Property Address
              </label>
              <p className="text-black">{request.propertyAddress}</p>
            </div>
          )}
          {request.category && (
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Category
              </label>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {request.category}
              </span>
            </div>
          )}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Status
              </label>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {request.status.toUpperCase()}
              </span>
            </div>
            {request.urgency && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Urgency
                </label>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyBadge(
                    request.urgency
                  )}`}
                >
                  {request.urgency.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      {request.diagnosis && (
        <div className="space-y-6 mb-6">
          {/* Diagnosis Card */}
          <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-semibold text-black mb-3">
              Diagnosis
            </h2>
            <p className="text-black leading-relaxed">
              {request.diagnosis}
            </p>
          </div>

          {/* Urgency Card */}
          {request.urgency && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-black mb-3">
                Urgency Level
              </h2>
              <div className="flex items-center">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${getUrgencyBadge(
                    request.urgency
                  )}`}
                >
                  {request.urgency.toUpperCase()}
                </span>
                <span className="ml-4 text-sm text-black">
                  {request.urgency === "high" &&
                    "Requires immediate attention"}
                  {request.urgency === "medium" &&
                    "Should be addressed soon"}
                  {request.urgency === "low" &&
                    "Can wait for scheduled maintenance"}
                </span>
              </div>
            </div>
          )}

          {/* Estimated Cost Card */}
          {request.estimatedCost && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-black mb-3">
                Estimated Cost
              </h2>
              <p className="text-2xl font-bold text-blue-600">
                {request.estimatedCost}
              </p>
              <p className="text-sm text-black mt-2">
                * This is an estimate based on typical market rates. Actual costs may
                vary based on location and severity.
              </p>
            </div>
          )}

          {/* Contractor Type Card */}
          {request.contractorType && (
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
                  {request.contractorType}
                </span>
              </div>
            </div>
          )}

          {/* Next Steps Card */}
          {request.nextSteps && (
            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-green-500">
              <h2 className="text-xl font-semibold text-black mb-3">
                Recommended Next Steps
              </h2>
              <div className="space-y-3">
                {request.nextSteps
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
          )}
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-black mb-3">
          Timestamps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-black">Created:</span>
            <p className="text-black mt-1">
              {formatTimestamp(request.createdAt)}
            </p>
          </div>
          <div>
            <span className="font-medium text-black">Last Updated:</span>
            <p className="text-black mt-1">
              {formatTimestamp(request.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? "Deleting..." : "Delete Request"}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-black mb-2">
              Delete Request?
            </h3>
            <p className="text-black mb-6">
              This action cannot be undone. Are you sure you want to delete this
              maintenance request?
            </p>
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
