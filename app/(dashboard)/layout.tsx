"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ErrorBoundary } from "@/components/ui";
import { Button } from "@/components/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-xl font-bold text-black hover:text-gray-700">
              Property Maintenance AI
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link
                href="/dashboard"
                className="text-black hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="text-sm text-black">Loading...</div>
            ) : session?.user ? (
              <>
                <div className="hidden sm:block text-sm text-black">
                  <span className="font-medium text-black">
                    {session.user.name || "User"}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  isLoading={isLoading}
                >
                  {isLoading ? "Signing out..." : "Logout"}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
    </ErrorBoundary>
  );
}
