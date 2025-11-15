"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <h1 className="text-3xl font-bold mb-6 text-center text-black">Login</h1>

        <form className="flex flex-col gap-4">
          {/* Email */}
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1 text-black">Email</span>
            <input
              type="email"
              className="border rounded-lg p-2 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              required
            />
          </label>

          {/* Password */}
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1 text-black">Password</span>
            <input
              type="password"
              className="border rounded-lg p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              required
            />
          </label>

          {/* Login Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-600 underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
