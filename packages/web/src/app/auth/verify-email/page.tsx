/* eslint-disable @typescript-eslint/no-explicit-any -- Error handling uses unknown types caught as any */
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ToastProvider";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const requestedNext = searchParams.get("next");
  const next =
    requestedNext &&
    requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//")
      ? requestedNext
      : "/dashboard";
  const { user, logout, refreshUser } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState<
    "awaiting" | "verifying" | "success" | "error"
  >(token ? "verifying" : "awaiting");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        return;
      }

      try {
        await apiRequest("/auth/verify-email", {
          method: "POST",
          body: { token },
        });
        await refreshUser();
        setStatus("success");
      } catch (error: any) {
        console.error("Email verification failed", error);
        setStatus("error");
        setMessage(
          error.message || "Verification failed. The link may have expired.",
        );
      }
    }

    void verify();
  }, [refreshUser, token]);

  const handleResend = async () => {
    if (!user) {
      toast.error("Please sign in to resend verification email.");
      return;
    }

    setResending(true);
    setDevLink(null);
    try {
      const response = await apiRequest<{ token?: string }>(
        "/auth/resend-verification",
        {
          method: "POST",
        },
      );
      const returnedToken = response.data?.token;

      if (returnedToken && process.env.NODE_ENV !== "production") {
        const link = `/auth/verify-email?token=${encodeURIComponent(returnedToken)}&next=${encodeURIComponent(next)}`;
        setDevLink(link);
        toast.success("Verification link generated (dev mode).");
      } else {
        toast.success("Verification email sent. Please check your inbox.");
      }
    } catch (error: any) {
      const msg =
        error?.message ||
        "Failed to resend verification email. Please try again.";
      toast.error(msg);
      setMessage(msg);
      setStatus("error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl border border-gray-700 text-center shadow-xl">
      {status === "awaiting" && (
        <>
          <h2 className="text-2xl font-bold text-white mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-400 mb-6">
            Check your inbox for the verification link, then open it to complete
            email verification.
          </p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="block w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-lg font-medium transition shadow-lg"
            >
              {resending ? "Sending..." : "Resend Verification Email"}
            </button>
            {devLink && (
              <div className="text-left text-sm bg-gray-900/40 border border-gray-700 rounded-lg p-3">
                <p className="text-gray-300 mb-1 font-medium">
                  Dev verification link
                </p>
                <a
                  href={devLink}
                  className="text-primary-300 underline break-all"
                >
                  {devLink}
                </a>
              </div>
            )}
            {user ? (
              <button
                type="button"
                onClick={() => void logout()}
                className="block w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
              >
                Log out
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="block w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
              >
                Sign in
              </Link>
            )}
          </div>
        </>
      )}

      {status === "verifying" && (
        <>
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Verifying Email...
          </h2>
          <p className="text-gray-400">
            Please wait while we verify your email address.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="text-5xl mb-4" aria-hidden="true">
            🎉
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Email Verified!
          </h2>
          <p className="text-gray-400 mb-6">
            Your email address has been successfully verified. You can now
            access all features of your account.
          </p>
          <Link
            href={next}
            className="block w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition shadow-lg"
          >
            Continue
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="text-5xl mb-4" aria-hidden="true">
            ❌
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Verification Failed
          </h2>
          <p className="text-red-300 mb-6 bg-red-900/20 p-3 rounded-lg border border-red-800/50">
            {message}
          </p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="block w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-60 text-white rounded-lg font-medium transition"
            >
              {resending ? "Sending..." : "Resend Verification Email"}
            </button>
            <Link
              href={user ? next : "/auth/login"}
              className="block w-full text-sm text-gray-400 hover:text-white transition"
            >
              {user ? "Back" : "Sign in"}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
