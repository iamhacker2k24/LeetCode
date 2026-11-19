import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  createUserDetails,
  checkUniqueUsername,
} from "../services/api";
import {
  FiUser,
  FiAtSign,
  FiBriefcase,
  FiMapPin,
  FiGlobe,
  FiGithub,
  FiLinkedin,
  FiArrowRight,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email or initial username from location state or existing user session
  const [sessionUser, setSessionUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Calculate default values
  const emailFromState = location.state?.email || sessionUser?.email || "";
  const defaultUsername =
    location.state?.username ||
    (emailFromState.includes("@") ? emailFromState.split("@")[0] : "dev_coder5");

  const [formData, setFormData] = useState({
    username: defaultUsername,
    name: sessionUser?.name || "Dev",
    role: "Full-Stack Engineer & Competitive Programmer",
    location: "Global",
    website: "https://github.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  });

  // Unique username validation state
  const [usernameStatus, setUsernameStatus] = useState("idle"); // "idle" | "checking" | "available" | "unavailable"
  const [usernameMsg, setUsernameMsg] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successToast, setSuccessToast] = useState(false);

  // Sync default username if location state changes
  useEffect(() => {
    if (location.state?.email && !location.state?.username) {
      const autoUser = location.state.email.split("@")[0];
      setFormData((prev) => ({
        ...prev,
        username: autoUser || prev.username,
      }));
    }
  }, [location.state]);

  // Real-time debounced unique username check: POST /api/user/getuniqueusername
  useEffect(() => {
    const rawUsername = formData.username?.trim();
    if (!rawUsername) {
      setUsernameStatus("idle");
      setUsernameMsg("");
      return;
    }

    setUsernameStatus("checking");
    setUsernameMsg("Checking availability...");

    const timer = setTimeout(async () => {
      try {
        const res = await checkUniqueUsername(rawUsername);
        if (res.isAvailable) {
          setUsernameStatus("available");
          setUsernameMsg(res.msg || "you can use this username");
        } else {
          setUsernameStatus("unavailable");
          setUsernameMsg(res.msg || "Username is already taken");
        }
      } catch (err) {
        setUsernameStatus("unavailable");
        setUsernameMsg(err.message || "Failed to check username");
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedUsername = formData.username?.trim();
    const trimmedName = formData.name?.trim();

    if (!trimmedUsername || !trimmedName) {
      setServerError("Username and Full Name are mandatory fields.");
      return;
    }

    if (usernameStatus === "unavailable") {
      setServerError("Please choose an available username before submitting.");
      return;
    }

    if (usernameStatus === "checking") {
      setServerError("Please wait while username availability is being checked.");
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    setSuccessToast(false);

    try {
      const payload = {
        username: trimmedUsername,
        name: trimmedName,
        role: formData.role?.trim() || "Full-Stack Engineer & Competitive Programmer",
        location: formData.location?.trim() || "Global",
        website: formData.website?.trim() || "https://github.com",
        github: formData.github?.trim() || "https://github.com",
        linkedin: formData.linkedin?.trim() || "https://linkedin.com",
      };

      // Call backend API: POST http://localhost:3000/api/user/userdetails
      const response = await createUserDetails(payload);
      const createdDetails =
        response?.CreateUserDetails || response?.data || response?.msg || payload;

      // Save to localStorage so UserDashboard and app reflect live details
      try {
        localStorage.setItem("user_profile", JSON.stringify(createdDetails));
        const updatedUser = {
          ...(sessionUser || {}),
          name: createdDetails.name || trimmedName,
          username: createdDetails.username || trimmedUsername,
          role: createdDetails.role || payload.role,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch {
        // ignore
      }

      setSuccessToast(true);

      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/dashboard");
      }, 700);
    } catch (err) {
      console.error("Create user details error:", err);
      setServerError(err.message || "Failed to save profile details.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#020617] min-h-screen flex flex-col justify-center items-center px-4 py-12 selection:bg-green-500 selection:text-black">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

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

      {/* Main Profile Setup Card */}
      <div className="w-full max-w-xl bg-[#0f172a] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] font-bold uppercase tracking-wider">
                Step 2 of 2
              </span>
              <span className="text-xs text-slate-400">Profile Setup</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
              Complete Your Profile
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Fields marked with <span className="text-rose-400 font-bold">*</span> are mandatory
            </p>
          </div>

          {/* Live Avatar Preview */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 p-0.5 shadow-lg shadow-green-500/20 shrink-0">
            <div className="w-full h-full bg-[#020617] rounded-[14px] flex items-center justify-center text-green-400 font-black text-xl">
              {(formData.name || formData.username || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="my-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <FiAlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Success Confirmation Toast */}
        {successToast && (
          <div className="my-5 p-3.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 shrink-0" />
            <span>Profile successfully saved! Redirecting to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Row 1: Username & Full Name (Both Mandatory with *) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username (Mandatory *, auto-given from email before @, checked for uniqueness) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username <span className="text-rose-400 font-bold">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FiAtSign className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="dev_coder5"
                  className={`w-full pl-10 pr-9 py-2.5 bg-[#020617] text-white text-sm border rounded-xl placeholder-slate-500 focus:outline-none transition ${
                    usernameStatus === "available"
                      ? "border-green-500/60 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                      : usernameStatus === "unavailable"
                      ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-700/80 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  }`}
                />
                {/* Status Indicator Icon */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {usernameStatus === "checking" && (
                    <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  {usernameStatus === "available" && (
                    <FiCheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  {usernameStatus === "unavailable" && (
                    <FiAlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              </div>

              {/* Real-time Unique Username Feedback */}
              {usernameStatus === "available" && (
                <p className="text-[11px] text-green-400 font-medium mt-1 flex items-center gap-1">
                  <span>&bull;</span>
                  <span>{usernameMsg || "you can use this username"}</span>
                </p>
              )}
              {usernameStatus === "unavailable" && (
                <p className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                  <span>&bull;</span>
                  <span>{usernameMsg || "Username is already taken"}</span>
                </p>
              )}
              {usernameStatus === "checking" && (
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Checking username availability...
                </p>
              )}
            </div>

            {/* Full Name (Mandatory *) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-400 font-bold">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FiUser className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dev"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#020617] text-white text-sm border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Role / Professional Headline (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Professional Role / Title
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FiBriefcase className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Full-Stack Engineer & Competitive Programmer"
                className="w-full pl-10 pr-4 py-2.5 bg-[#020617] text-white text-sm border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition"
              />
            </div>
          </div>

          {/* Location (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FiMapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Global"
                className="w-full pl-10 pr-4 py-2.5 bg-[#020617] text-white text-sm border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition"
              />
            </div>
          </div>

          {/* Website / Portfolio (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Personal Website / Portfolio
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FiGlobe className="w-4 h-4" />
              </div>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://github.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#020617] text-white text-sm border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition font-mono text-xs"
              />
            </div>
          </div>

          {/* Socials: GitHub & LinkedIn (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GitHub URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                GitHub Profile
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FiGithub className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#020617] text-white text-sm border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition font-mono text-xs"
                />
              </div>
            </div>

            {/* LinkedIn URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                LinkedIn Profile
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FiLinkedin className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#020617] text-white text-sm border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || usernameStatus === "unavailable" || usernameStatus === "checking"}
              className="w-full sm:flex-1 py-3 px-4 bg-green-500 hover:bg-green-400 text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />
                  <span>Saving details...</span>
                </>
              ) : (
                <>
                  <span>Complete Setup & Enter Dashboard</span>
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
