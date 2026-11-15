import React, { useEffect, useState } from "react";
import { Link } from "react-router";

const Logout = () => {
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    // Clear any stored authentication tokens or session details
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
    } catch {
      // ignore
    }
    setCleared(true);
  }, []);

  return (
    <div className="bg-[#020617] min-h-screen flex flex-col justify-center items-center px-4 selection:bg-green-500 selection:text-black">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-3xl mx-auto mb-6 text-green-400">
          <svg
            className="w-8 h-8 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight">
          Signed Out Successfully
        </h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Your session has ended securely. Your solved problems and progress
          remain saved in your account.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-8">
          <Link
            to="/login"
            className="w-full py-3 px-4 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-sm transition shadow-lg shadow-green-500/25 text-center active:scale-95"
          >
            Sign Back In
          </Link>

          <Link
            to="/"
            className="w-full py-3 px-4 rounded-xl bg-[#020617] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition text-center"
          >
            Return to Homepage
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-xs text-slate-500 flex items-center justify-center gap-2">
          <span>&lt;/&gt; CodeForge Platform</span>
        </div>
      </div>
    </div>
  );
};

export default Logout;
