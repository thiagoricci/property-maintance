"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

type FilterType = "all" | "high" | "medium" | "low";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredCount, setFilteredCount] = useState(0);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch requests when session is available or filter changes
    if (status === "authenticated") {
      fetchRequests();
    }
  }, [status, filter]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = filter === "all"
        ? "/api/maintenance/list"
        : `/api/maintenance/list?urgency=${filter}`;

      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch requests");
      }

      setRequests(result.data);
      setFilteredCount(result.data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch requests");
      setRequests([]);
    } finally {
      setIsLoading(false);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + "...";
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">
          Welcome, {session.user?.name || "User"}!
        </h1>
        <p className="text-black">
          Manage your maintenance requests and get AI-powered analysis for your
          property issues.
        </p>
      </div>

      {/* Main Action Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Submit New Maintenance Request
            </h2>
            <p className="text-white">
              Get instant AI-powered analysis with cost estimates and
              recommendations
            </p>
          </div>
          <button
            onClick={() => router.push("/requests/new")}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md"
          >
            Create Request
          </button>
        </div>
      </div>

      {/* Request History Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black">
            Request History
          </h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {filteredCount} {filteredCount === 1 ? "request" : "requests"}
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "high", "medium", "low"] as FilterType[]).map((filterType) => (
            <button
              key={filterType}
              onClick={() => handleFilterChange(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
        )}

        {/* Empty State */}
        {!isLoading && !error && requests.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-black mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012 2v2a2 2 0 012 2h2a2 2 0 012-2V9a2 2 0 00-2-2h-2m-6 9l2 2 4-4"
              />
            </svg>
            <h3 className="text-lg font-semibold text-black mb-2">
              No Requests Yet
            </h3>
            <p className="text-black mb-4">
              {filter === "all"
                ? "You haven't submitted any maintenance requests yet. Get started by creating your first request."
                : `No requests with ${filter} urgency found. Try a different filter.`}
            </p>
            {filter === "all" && (
              <button
                onClick={() => router.push("/requests/new")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Request
              </button>
            )}
          </div>
        )}

        {/* Request List */}
        {!isLoading && !error && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                onClick={() => router.push(`/requests/${request.id}`)}
                className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyBadge(
                          request.urgency
                        )}`}
                      >
                        {request.urgency?.toUpperCase() || "PENDING"}
                      </span>
                      <span className="text-sm text-black">
                        {formatDate(request.createdAt)}
                      </span>
                      {request.category && (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          {request.category}
                        </span>
                      )}
                    </div>
                    <p className="text-black font-medium mb-2">
                      {truncateDescription(request.description)}
                    </p>
                    {request.diagnosis && (
                      <p className="text-sm text-black line-clamp-2">
                        {request.diagnosis}
                      </p>
                    )}
                  </div>
                  <svg
                    className="w-5 h-5 text-black flex-shrink-0 ml-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => router.push("/requests/new")}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <h3 className="font-semibold text-black mb-2">
            Quick Start
          </h3>
          <p className="text-sm text-black">
            Submit a new maintenance request to get instant AI analysis
          </p>
        </div>
        <div
          onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <h3 className="font-semibold text-black mb-2">
            View History
          </h3>
          <p className="text-sm text-black">
            Browse your past requests and their analysis results
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer opacity-60">
          <h3 className="font-semibold text-black mb-2">
            Track Status
          </h3>
          <p className="text-sm text-black">
            Monitor the status of your ongoing maintenance issues
          </p>
        </div>
      </div>
    </div>
  );
}
