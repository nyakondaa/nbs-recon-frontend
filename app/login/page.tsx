"use client";
import { useState } from "react";
import { login } from "@/app/services/api";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        console.log("Attempting login with:", { username, password });
      const res = await login(username, password);
      setMessage(`✅ Login successful! Welcome, ${username}`);
      console.log("Login response:", res);
      localStorage.setItem("token", res.token);
      router.push("/dashboard");
    } catch (err: any) {
      setMessage("❌ Invalid credentials");
    }
  };

  
  const nbsDarkGreen = "#154238"; // A darker, rich green
  const nbsLightGreen = "#76b900"; // The bright, vibrant green from the logo
  const nbsOffWhite = "#f9fafb"; // A soft off-white for contrast

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: nbsDarkGreen }}
    >
      <div 
        className="w-full max-w-md rounded-2xl shadow-2xl p-10"
        style={{ backgroundColor: nbsOffWhite }}
      >
        {/* Logo and Title Section */}
        <div className="flex flex-col items-center mb-8">
          <Image 
            src="/nbs-logo.png" 
            alt="NBS Logo" 
            width={80} 
            height={80} 
          />
          <h1 className="text-3xl font-bold text-gray-800 mt-4 text-center">
            NBS Reconciliation
          </h1>
          <h2 className="text-md text-gray-600 mt-1 text-center">
            Login to your account
          </h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Username Input */}
          <div className="flex flex-col">
            <label
              htmlFor="username"
              className="text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300
                         focus:outline-none focus:ring-2 focus:ring-opacity-50
                         placeholder-gray-500 text-gray-800"
              style={{
                borderColor: nbsLightGreen,
                boxShadow: `0 0 0 2px ${nbsLightGreen}40`
              }}
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300
                         focus:outline-none focus:ring-2 focus:ring-opacity-50
                         placeholder-gray-500 text-gray-800"
              style={{
                borderColor: nbsLightGreen,
                boxShadow: `0 0 0 2px ${nbsLightGreen}40`
              }}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full text-white py-3 rounded-lg font-semibold transition-all duration-300
                         hover:shadow-lg"
            style={{ 
              backgroundColor: nbsLightGreen,
              boxShadow: `0 4px 6px -1px ${nbsLightGreen}60, 0 2px 4px -2px ${nbsLightGreen}60`
            }}
          >
            Login
          </button>
        </form>

        {/* Message and Footer */}
        {message && (
          <p className={`mt-6 text-center text-sm font-medium 
                         ${message.includes("✅") ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <p className="mt-8 text-xs text-center text-gray-500">
          Don’t know your credentials? Contact your system administrator.
        </p>
      </div>
    </div>
  );
}