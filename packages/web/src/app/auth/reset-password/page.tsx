"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import type { PasswordReset } from "@pmp/shared";
import { useToast } from "@/components/ToastProvider";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      const message = "Invalid or missing reset token.";
      setErrorMessage(message);
      setStatus("error");
      toast.error(message);
      return;
    }

    if (password !== confirmPassword) {
      const message = "Passwords do not match.";
      setErrorMessage(message);
      setStatus("error");
      toast.error(message);
      return;
    }

    if (password.length < 8) {
      const message = "Password must be at least 8 characters long.";
      setErrorMessage(message);
      setStatus("error");
      toast.error(message);
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await apiRequest<void>("/auth/reset-password", {
        method: "POST",
        body: { token, newPassword: password } as PasswordReset,
      });
      setStatus("success");
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error: unknown) {
      console.error("Password reset failed", error);
      const message = "Failed to reset password. The link may have expired.";
      setStatus("error");
      setErrorMessage(message);
      toast.error(message);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
        <div className="text-5xl mb-4" aria-hidden="true">
          ⚠️
        </div>
        <h2 className="text-2xl font-bold text-white">Invalid Link</h2>
        <p className="mt-2 text-sm text-gray-400">
          This password reset link is invalid or has expired. Please request a
          new one.
        </p>
        <div className="mt-6">
          <Link
            href="/auth/forgot-password"
            className="font-medium text-primary-400 hover:text-primary-300 transition"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
        <div className="text-5xl mb-4" aria-hidden="true">
          ✅
        </div>
        <h2 className="text-3xl font-extrabold text-white">Password Reset!</h2>
        <p className="mt-2 text-sm text-gray-400">
          Your password has been successfully reset. Redirecting you to login...
        </p>
        <div className="mt-6">
          <Link
            href="/auth/login"
            className="font-medium text-primary-400 hover:text-primary-300 transition"
          >
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Please enter your new password below.
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
              placeholder="********"
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-colors"
              placeholder="********"
            />
          </div>
        </div>

        {status === "error" && (
          <div className="rounded-md bg-red-900/30 p-4 border border-red-800">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-400">Error</h3>
                <div className="mt-2 text-sm text-red-300">
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={status === "loading"}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
              status === "loading"
                ? "bg-primary-700 cursor-not-allowed"
                : "bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary-500"
            } transition-colors shadow-lg hover:shadow-primary-900/20`}
          >
            {status === "loading" ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
