"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code || !state) {
          setError("Missing authentication information");
          setIsLoading(false);
          return;
        }

        // Construct the callback URL for the HRM API
        const hrmAuthCallbackUrl = `https://api.hrm.kaopiz.com/api/auth/callback?redirect=%2Fdashboard&code=${code}&state=${state}`;

        // Call the HRM API callback endpoint
        const res = await fetch(hrmAuthCallbackUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Error during authentication");
        }

        const data = await res.json();

        if (data.token) {
          // Save token to session via API route
          const sessionRes = await fetch("/api/auth/session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: data.token,
              userId: data.user?.id || "unknown", // Assuming API returns user info
            }),
          });

          if (!sessionRes.ok) {
            throw new Error("Error saving session");
          }

          // Save token to localStorage for client-side access (optional, consider security implications)
          localStorage.setItem("auth_token", data.token);

          // Redirect user to the main page
          router.push("/");
        } else {
          throw new Error("Token not received");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred during the authentication process");
      } finally {
        setIsLoading(false);
      }
    }

    handleCallback();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Authenticating...</h1>{" "}
          {/* Changed from "Đang xác thực..." */}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Authentication Error</h1>{" "}
          {/* Changed from "Lỗi xác thực" */}
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Optional: Show a success message before redirecting
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Authentication Successful</h1>{" "}
        {/* Changed from "Xác thực thành công" */}
        <p>Redirecting...</p> {/* Changed from "Đang chuyển hướng..." */}
      </div>
    </div>
  );
}
