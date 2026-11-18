import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
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
  const emailFromState = location.state?.email || sessionUser?.email || "dev_coder@example.com";
  const defaultUsername =
    location.state?.username ||
    (emailFromState.includes("@") ? emailFromState.split("@")[0] : "dev_coder");

  const [formData, setFormData] = useState({
    username: defaultUsername,
    name: sessionUser?.name || "Dev",
    role: "Full-Stack Engineer & Competitive Programmer",
    location: "Global",
    website: "https://github.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  // Auto-sync if location state changes
  useEffect(() => {
    if (location.state?.email) {
      const autoUser = location.state.email.split("@")[0];
      setFormData((prev) => ({
        ...prev,
        username: prev.username || autoUser,
        name: prev.name === "Dev" && autoUser ? autoUser.charAt(0).toUpperCase() + autoUser.slice(1) : prev.name,
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Save profile details to localStorage (Demo persistence until backend API is provided)
    try {
      const profileData = {
        ...formData,
        email: emailFromState,
      };

      localStorage.setItem("user_profile", JSON.stringify(profileData));

      // Update active user object
      const updatedUser = {
        ...(sessionUser || {}),
        name: formData.name,
        username: formData.username,
        role: formData.role,
        email: emailFromState,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Local profile storage error:", err);
    }

    setSuccessToast(true);

    // Navigate to dashboard
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 700);
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
              Personalize your public developer card and coding portfolio
            </p>
          </div>

          {/* Live Avatar Preview */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 p-0.5 shadow-lg shadow-green-500/20 shrink-0">
            <div className="w-full h-full bg-[#020617] rounded-[14px] flex items-center justify-center text-green-400 font-black text-xl">
              {(formData.name || formData.username || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {successToast && (
          <div className="my-5 p-3.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 shrink-0" />
            <span>Profile successfully updated! Redirecting to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Row 1: Username & Full Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username (Auto-given by email before @) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Username (auto from email)
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
                  placeholder="dev_coder"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#020617] text-white text-sm border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
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

          {/* Role / Professional Headline */}
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
                required
                value={formData.role}
                onChange={handleChange}
                placeholder="Full-Stack Engineer & Competitive Programmer"
                className="w-full pl-10 pr-4 py-2.5 bg-[#020617] text-white text-sm border border-slate-700/80 rounded-xl placeholder-slate-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition"
              />
            </div>
          </div>

          {/* Location */}
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

          {/* Website / Portfolio */}
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

          {/* Socials: GitHub & LinkedIn */}
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
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-3 px-4 bg-green-500 hover:bg-green-400 text-black font-extrabold text-sm rounded-xl transition duration-200 shadow-lg shadow-green-500/25 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />
                  <span>Saving profile...</span>
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
