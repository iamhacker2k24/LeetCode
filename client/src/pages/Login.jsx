import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser, checkAuthUser } from "../services/api";
import { FiAlertTriangle, FiMail, FiArrowLeft } from "react-icons/fi";

// Schema validation for login
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // If user already has a valid session cookie, redirect appropriately
  useEffect(() => {
    let isMounted = true;
    const verifyAuth = async () => {
      try {
        const { isAuthenticated } = await checkAuthUser();
        if (isAuthenticated && isMounted) {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get("redirect");
          let userRole = "";
          try {
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            userRole = (stored?.role || "").toLowerCase();
          } catch {
            // ignore
          }

          if (redirect) {
            navigate(redirect, { replace: true });
          } else if (userRole === "admin") {
            navigate("/admin", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
          return;
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      const response = await loginUser(data.email, data.password);
      if (response?.success) {
        if (response.msg) {
          localStorage.setItem("user", JSON.stringify(response.msg));
        }
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        const userRole = (response?.msg?.role || "").toLowerCase();

        if (redirect) {
          navigate(redirect);
        } else if (userRole === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setServerError(response?.msg || "Login failed. Please try again.");
      }
    } catch (err) {
      setServerError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="bg-[#020617] min-h-screen flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-green-500/30 mb-4 animate-pulse">
          &lt;/&gt;
        </div>
        <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#020617] min-h-screen flex flex-col justify-center items-center px-4 py-12 selection:bg-green-500 selection:text-black">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Brand Logo Header */}
      <div className="mb-6 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-green-500/30 group-hover:scale-105 transition-transform">
            &lt;/&gt;
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            Code<span className="text-green-400">Forge</span>
          </span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-8 sm:p-9 shadow-2xl shadow-black/50">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Enter your credentials to continue your practice
          </p>
        </div>

        {serverError && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                {...register("email")}
                className={`w-full px-4 py-3 bg-[#020617] text-white text-sm border rounded-xl placeholder-slate-500 focus:outline-none transition ${
                  errors.email
                    ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-slate-700/80 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                }`}
              />
              <FiMail className="absolute right-3.5 top-3.5 text-slate-500 w-4 h-4 pointer-events-none" />
            </div>
            {errors.email && (
              <p className="text-rose-400 text-xs mt-1.5 font-medium flex items-center gap-1">
                <span>•</span>
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                className={`w-full pl-4 pr-11 py-3 bg-[#020617] text-white text-sm border rounded-xl placeholder-slate-500 focus:outline-none transition ${
                  errors.password
                    ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-slate-700/80 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-white transition px-1 py-0.5"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-rose-400 text-xs mt-1.5 font-medium flex items-center gap-1">
                <span>•</span>
                <span>{errors.password.message}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-green-500 hover:bg-green-400 text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Switch Link */}
        <div className="mt-7 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-bold text-green-400 hover:text-green-300 hover:underline transition ml-1"
            >
              Sign Up
            </Link>
          </p>
          <div className="mt-4">
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition inline-flex items-center gap-1.5"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
