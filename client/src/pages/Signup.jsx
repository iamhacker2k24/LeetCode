import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerUser } from "../services/api";
import { FiAlertTriangle, FiArrowLeft } from "react-icons/fi";

// Schema validation for sign up
const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name is too long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      const response = await registerUser(data.name, data.email, data.password);
      if (response?.success) {
        if (response.msg) {
          localStorage.setItem("user", JSON.stringify(response.msg));
        }
        navigate("/dashboard");
      } else {
        setServerError(response?.msg || "Registration failed. Please try again.");
      }
    } catch (err) {
      setServerError(
        err.message || "Registration failed. Please check your details and retry."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#020617] min-h-screen flex flex-col justify-center items-center px-4 py-12 selection:bg-green-500 selection:text-black">
      {/* Background Ambient Glow */}
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

      {/* Main Signup Card */}
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-8 sm:p-9 shadow-2xl shadow-black/50">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Join thousands of developers leveling up their algorithmic skills
          </p>
        </div>

        {serverError && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Alex Chen"
              {...register("name")}
              className={`w-full px-4 py-2.5 bg-[#020617] text-white text-sm border rounded-xl placeholder-slate-500 focus:outline-none transition ${
                errors.name
                  ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  : "border-slate-700/80 focus:border-green-400 focus:ring-1 focus:ring-green-400"
              }`}
            />
            {errors.name && (
              <p className="text-rose-400 text-xs mt-1 font-medium flex items-center gap-1">
                <span>•</span>
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              {...register("email")}
              className={`w-full px-4 py-2.5 bg-[#020617] text-white text-sm border rounded-xl placeholder-slate-500 focus:outline-none transition ${
                errors.email
                  ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  : "border-slate-700/80 focus:border-green-400 focus:ring-1 focus:ring-green-400"
              }`}
            />
            {errors.email && (
              <p className="text-rose-400 text-xs mt-1 font-medium flex items-center gap-1">
                <span>•</span>
                <span>{errors.email.message}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`w-full pl-4 pr-11 py-2.5 bg-[#020617] text-white text-sm border rounded-xl placeholder-slate-500 focus:outline-none transition ${
                  errors.password
                    ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-slate-700/80 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-white transition px-1 py-0.5"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-rose-400 text-xs mt-1 font-medium flex items-center gap-1">
                <span>•</span>
                <span>{errors.password.message}</span>
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={`w-full px-4 py-2.5 bg-[#020617] text-white text-sm border rounded-xl placeholder-slate-500 focus:outline-none transition ${
                errors.confirmPassword
                  ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  : "border-slate-700/80 focus:border-green-400 focus:ring-1 focus:ring-green-400"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-rose-400 text-xs mt-1 font-medium flex items-center gap-1">
                <span>•</span>
                <span>{errors.confirmPassword.message}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3 px-4 bg-green-500 hover:bg-green-400 text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer Switch Link */}
        <div className="mt-7 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-green-400 hover:text-green-300 hover:underline transition ml-1"
            >
              Sign In
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

export default Signup;
