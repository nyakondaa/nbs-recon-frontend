"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoadingRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard"); // ✅ redirect target
    }, 50); // redirect after 2 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-t-green-500 border-gray-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700 text-lg">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
}
