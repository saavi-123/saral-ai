"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("saral-theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-dm)",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo / Title */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "var(--accent)",
              marginBottom: "16px",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill="var(--accent-text)"
                fillOpacity="0.9"
              />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "24px",
              fontWeight: "700",
              color: "var(--text)",
              margin: "0 0 6px 0",
              letterSpacing: "-0.3px",
            }}
          >
            Cyber AI Agent
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "14px", margin: 0 }}>
            Law Enforcement Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bg2)",
            border: "0.5px solid var(--border)",
            borderRadius: "12px",
            padding: "32px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "18px",
              fontWeight: "600",
              color: "var(--text)",
              margin: "0 0 24px 0",
            }}
          >
            Sign in to continue
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text2)",
                  marginBottom: "6px",
                }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator@saralgroups.com"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "var(--bg3)",
                  border: "0.5px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text)",
                  fontSize: "14px",
                  fontFamily: "var(--font-dm)",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text2)",
                  marginBottom: "6px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "var(--bg3)",
                  border: "0.5px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text)",
                  fontSize: "14px",
                  fontFamily: "var(--font-dm)",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Error message */}
            {error && (
              <div
                style={{
                  padding: "10px 12px",
                  background: "rgba(163, 45, 45, 0.12)",
                  border: "0.5px solid rgba(163, 45, 45, 0.4)",
                  borderRadius: "8px",
                  color: "#e57373",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              style={{
                width: "100%",
                padding: "11px",
                background:
                  loading || !email || !password
                    ? "var(--bg3)"
                    : "var(--accent)",
                color:
                  loading || !email || !password
                    ? "var(--text3)"
                    : "var(--accent-text)",
                border: "0.5px solid var(--border)",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                fontFamily: "var(--font-dm)",
                cursor:
                  loading || !email || !password ? "not-allowed" : "pointer",
                transition: "background 0.15s, color 0.15s",
                marginTop: "4px",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "var(--text3)",
              textAlign: "center",
              margin: "20px 0 0 0",
              lineHeight: "1.5",
            }}
          >
            Access restricted to authorised investigators only.
            <br />
            Contact your administrator to get an account.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <LoginForm />
    </Suspense>
  );
}