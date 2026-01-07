import React from "react";

export type InputType = "text" | "email" | "password" | "textarea";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  type?: InputType;
  required?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  type = "text",
  required = false,
  className = "",
  ...props
}: InputProps) {
  const baseClasses =
    "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black placeholder-gray-400 min-h-[44px]";
  const errorClasses = error ? "border-red-500" : "border-gray-800";

  if (type === "textarea") {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-black">
            {label} {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          className={`${baseClasses} ${errorClasses} ${className}`}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-gray-600">{helperText}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-black">
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-gray-600">{helperText}</p>
      )}
    </div>
  );
}
