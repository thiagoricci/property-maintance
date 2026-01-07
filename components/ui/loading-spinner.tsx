import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "white" | "gray";
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  color = "blue",
  text,
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const colorClasses = {
    blue: "border-blue-600",
    white: "border-white",
    gray: "border-gray-400",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center">
        <div
          className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]} border-t-transparent`}
        />
        {text && (
          <p
            className={`mt-2 text-sm ${
              color === "white" ? "text-white" : "text-gray-600"
            }`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
