import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  logoutUser,
  getUserStats,
  getSolvedMap,
  getAllQuestions,
} from "../services/api";
import {
  FiCheckCircle,
  FiXCircle,
  FiActivity,
  FiBarChart2,
  FiAward,
  FiClock,
  FiCode,
  FiExternalLink,
  FiEdit3,
  FiGithub,
  FiLinkedin,
  FiGlobe,
  FiMapPin,
  FiFileText,
  FiLayers,
  FiHeart,
  FiStar,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { BsFire, BsCoin, BsTrophy } from "react-icons/bs";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { username: routeUsername } = useParams();

  // Authentication & session user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [cachedProfile, setCachedProfile] = useState(() => {
    try {
      const stored = localStorage.getItem("user_profile");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Live state from server
  const [liveProfile, setLiveProfile] = useState(null);
  const [liveSolvedMap, setLiveSolvedMap] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeTab, setActiveTab] = useState("solved");

  // Determine active username (URL parameter takes precedence, then session)
  const sessionUsername =
    cachedProfile?.username ||
    currentUser?.username ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "");

  const activeUsername = (routeUsername || sessionUsername || "").trim();

  // Fetch real server data
  const loadProfileData = useCallback(async () => {
    if (!activeUsername) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const [statsResult, solvedResult, questionsResult] = await Promise.allSettled([
        getUserStats(activeUsername),
        getSolvedMap(activeUsername),
        getAllQuestions(),
      ]);

      let errorEncountered = null;

      // Handle user stats
      if (statsResult.status === "fulfilled" && statsResult.value) {
        setLiveProfile(statsResult.value);
      } else if (statsResult.status === "rejected") {
        console.warn("User stats fetch failed:", statsResult.reason);
        errorEncountered = statsResult.reason?.message || "Failed to load user profile";
      }

      // Handle solved map
      if (solvedResult.status === "fulfilled" && solvedResult.value) {
        setLiveSolvedMap(solvedResult.value);
      } else if (solvedResult.status === "rejected") {
        console.warn("SolvedMap fetch failed:", solvedResult.reason);
      }

      // Handle system questions (for dynamic total question counts)
      if (questionsResult.status === "fulfilled" && questionsResult.value) {
        const qList = Array.isArray(questionsResult.value)
          ? questionsResult.value
          : questionsResult.value?.questions || questionsResult.value?.data || [];
        setAllQuestions(qList);
      }

      if (errorEncountered && !liveProfile && !cachedProfile) {
        setFetchError(errorEncountered);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setFetchError(err.message || "Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  }, [activeUsername]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout API call error:", err);
    } finally {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.clear();
      } catch {
        // ignore
      }
      navigate("/logout");
    }
  };

  // Profile data resolution from server
  const profile = liveProfile || cachedProfile || {};
  const isOwnProfile =
    !routeUsername ||
    (sessionUsername && routeUsername.toLowerCase() === sessionUsername.toLowerCase());

  const displayName = profile.name || (isOwnProfile ? currentUser?.name : "") || activeUsername;
  const displayRole = profile.role || (isOwnProfile ? "Member" : "User");
  const displayLocation = profile.location || "Not specified";
  const displayWebsite = profile.website || "";
  const displayGithub = profile.github || "";
  const displayLinkedin = profile.linkedin || "";
  const globalRank = profile.globalRank ?? 0;
  const topPercentile = profile.topPercentile ?? 0;
  const coins = profile.coins ?? 0;
  const streak = liveSolvedMap?.currentStreak ?? profile.streak ?? 0;
  const views = profile.views ?? 0;

  // Question difficulty counts from real database questions
  const totalQuestions = allQuestions.length;
  const easyTotal = allQuestions.filter(
    (q) => q.difficulty?.toLowerCase() === "easy"
  ).length;
  const mediumTotal = allQuestions.filter(
    (q) => q.difficulty?.toLowerCase() === "medium"
  ).length;
  const hardTotal = allQuestions.filter(
    (q) => q.difficulty?.toLowerCase() === "hard"
  ).length;

  // Real solved counts from SolvedMap
  const easySolved = Number(liveSolvedMap?.easySolved ?? 0);
  const medSolved = Number(liveSolvedMap?.Medium ?? liveSolvedMap?.mediumSolved ?? 0);
  const hardSolved = Number(liveSolvedMap?.Hard ?? liveSolvedMap?.hardSolved ?? 0);
  const totalSolved = Number(
    liveSolvedMap?.acceptedSolutions ??
      profile.solvedQuestions?.length ??
      (easySolved + medSolved + hardSolved)
  );
  const totalSubmissions = Number(liveSolvedMap?.totalSubmissions ?? 0);
  const acceptanceRate =
    totalSubmissions > 0
      ? ((totalSolved / totalSubmissions) * 100).toFixed(1)
      : "0.0";

  // Percentages calculated from real database questions
  const easyPct = easyTotal > 0 ? Math.min(100, Math.round((easySolved / easyTotal) * 100)) : 0;
  const medPct = mediumTotal > 0 ? Math.min(100, Math.round((medSolved / mediumTotal) * 100)) : 0;
  const hardPct = hardTotal > 0 ? Math.min(100, Math.round((hardSolved / hardTotal) * 100)) : 0;
  const totalPct = totalQuestions > 0 ? Math.min(100, Math.round((totalSolved / totalQuestions) * 100)) : 0;

  // Circular Chart math
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const easyDash = (easyPct / 100) * circumference;
  const medDash = (medPct / 100) * circumference;
  const hardDash = (hardPct / 100) * circumference;

  // Real languages from SolvedMap
  const languages = useMemo(() => {
    const langMap = liveSolvedMap?.languageSolve;
    if (!langMap || typeof langMap !== "object") return [];
    const entries =
      langMap instanceof Map ? Array.from(langMap.entries()) : Object.entries(langMap);
    const colorPalette = ["#38bdf8", "#a855f7", "#f97316", "#facc15", "#10b981", "#ec4899", "#6366f1"];
    return entries
      .filter(([_, count]) => Number(count) > 0)
      .map(([name, count], i) => ({
        name: name.toUpperCase(),
        solved: Number(count),
        color: colorPalette[i % colorPalette.length],
      }));
  }, [liveSolvedMap]);

  // Real topics from SolvedMap
  const topics = useMemo(() => {
    const topicMap = liveSolvedMap?.TopicSolved;
    if (!topicMap || typeof topicMap !== "object") return [];
    const entries =
      topicMap instanceof Map ? Array.from(topicMap.entries()) : Object.entries(topicMap);
    return entries
      .filter(([_, count]) => Number(count) > 0)
      .map(([name, count]) => ({
        name: name.replace(/_/g, " "),
        count: Number(count),
      }));
  }, [liveSolvedMap]);

  // Real solved, liked, and starred questions lists
  const solvedQuestionIds = useMemo(() => {
    return Array.isArray(profile.solvedQuestions) ? profile.solvedQuestions : [];
  }, [profile.solvedQuestions]);

  const likedQuestionIds = useMemo(() => {
    return Array.isArray(profile.likeQuestion) ? profile.likeQuestion : [];
  }, [profile.likeQuestion]);

  const starredQuestionIds = useMemo(() => {
    return Array.isArray(profile.starQues) ? profile.starQues : [];
  }, [profile.starQues]);

  // Helper to resolve question object by ID
  const getQuestionDetails = useCallback(
    (qid) => {
      return (
        allQuestions.find(
          (q) => String(q._id) === String(qid) || String(q.questionId) === String(qid)
        ) || {
          _id: qid,
          questionId: qid,
          title: `Question #${qid}`,
          difficulty: "Standard",
        }
      );
    },
    [allQuestions]
  );

  return (
    <div className="bg-[#020617] min-h-screen text-slate-100 font-sans selection:bg-green-500 selection:text-black">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#020617]/90 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-green-500/30 group-hover:scale-105 transition-transform">
                &lt;/&gt;
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                Code<span className="text-green-400">Forge</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
              >
                Problems
              </Link>
              <span className="px-3 py-1.5 rounded-lg text-white font-semibold bg-slate-800/80">
                User Profile
              </span>
            </nav>
          </div>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400">
                <BsFire className="w-3.5 h-3.5 text-amber-400" />
                <span>{streak} Days Streak</span>
              </div>
            )}

            {coins > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-yellow-400">
                <BsCoin className="w-3.5 h-3.5 text-yellow-400" />
                <span>{coins}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 text-black font-extrabold text-xs flex items-center justify-center shadow-sm">
                {(displayName || activeUsername || "U").charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-white hidden md:inline-block max-w-[120px] truncate">
                {displayName || activeUsername}
              </span>
            </div>

            {currentUser && (
              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/40 transition ml-2"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Container ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-green-400 rounded-full animate-spin" />
            <p className="text-sm text-slate-400 font-mono">
              Fetching profile data from server for @{activeUsername}...
            </p>
          </div>
        )}

        {/* Server Fetch Error Banner */}
        {!isLoading && fetchError && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-200">Notice from Server</p>
                <p className="text-xs text-amber-300/90 mt-0.5 font-mono">{fetchError}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Note: Backend endpoints <code className="text-amber-400 font-mono">/userstats/:username</code> require registered profile details in the database.
                </p>
              </div>
            </div>
            <button
              onClick={loadProfileData}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Content Layout */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ══════════════════════════════════════════════════════════════════
                LEFT SIDEBAR: USER PROFILE & SOCIALS (Col 4)
               ══════════════════════════════════════════════════════════════════ */}
            <aside className="lg:col-span-4 flex flex-col gap-6">
              {/* Profile Card */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 p-0.5 shadow-lg shadow-green-500/20">
                      <div className="w-full h-full bg-[#020617] rounded-[14px] flex items-center justify-center text-green-400 font-black text-3xl">
                        {(displayName || activeUsername || "U").charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-black text-white truncate">{displayName}</h1>
                    <p className="text-xs font-mono text-slate-400 mt-0.5 truncate">
                      @{activeUsername}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] font-semibold uppercase tracking-wider">
                        {displayRole}
                      </span>
                      {globalRank > 0 && (
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                          <FiAward className="w-3.5 h-3.5 text-yellow-400" />
                          Rank #{globalRank.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Profile Action */}
                {isOwnProfile && (
                  <Link
                    to="/profile-setup"
                    className="w-full mt-5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition border border-slate-700/60"
                  >
                    <FiEdit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit Profile Details</span>
                  </Link>
                )}

                {/* Profile Meta & Links */}
                <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{displayLocation}</span>
                  </div>

                  {displayWebsite && (
                    <div className="flex items-center gap-2">
                      <FiGlobe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a
                        href={displayWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-green-400 transition truncate text-slate-300"
                      >
                        {displayWebsite.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}

                  {displayGithub && (
                    <div className="flex items-center gap-2">
                      <FiGithub className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a
                        href={displayGithub}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-green-400 transition truncate text-slate-300"
                      >
                        {displayGithub.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}

                  {displayLinkedin && (
                    <div className="flex items-center gap-2">
                      <FiLinkedin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a
                        href={displayLinkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-green-400 transition truncate text-slate-300"
                      >
                        {displayLinkedin.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>

                {/* Community Metrics (Only displayed if provided by server) */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-center">
                  <div className="bg-[#020617] rounded-xl p-3 border border-slate-800">
                    <p className="text-[11px] text-slate-400 font-medium">Profile Views</p>
                    <p className="text-lg font-black text-blue-400 mt-1 font-mono">{views}</p>
                  </div>
                  <div className="bg-[#020617] rounded-xl p-3 border border-slate-800">
                    <p className="text-[11px] text-slate-400 font-medium">Current Streak</p>
                    <p className="text-lg font-black text-amber-400 mt-1 font-mono">{streak} Days</p>
                  </div>
                </div>
              </div>

              {/* Languages Used (From SolvedMap) */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h2 className="text-sm font-bold text-white flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FiCode className="w-4 h-4 text-green-400" />
                    <span>Languages Solved</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{languages.length}</span>
                </h2>

                {languages.length === 0 ? (
                  <p className="text-xs text-slate-500 italic mt-4">
                    No solved language data recorded yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {languages.map((lang, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: lang.color }}
                          />
                          <span className="font-semibold text-slate-200">{lang.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                          <span className="font-bold text-white">{lang.solved}</span>
                          <span>solved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Solved Topics (From SolvedMap) */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h2 className="text-sm font-bold text-white flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FiLayers className="w-4 h-4 text-blue-400" />
                    <span>Solved Topics</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{topics.length}</span>
                </h2>

                {topics.length === 0 ? (
                  <p className="text-xs text-slate-500 italic mt-4">
                    No topic distribution recorded yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {topics.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#020617] border border-slate-800 text-xs font-medium text-slate-300"
                      >
                        <span>{skill.name}</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-green-400 font-bold">
                          {skill.count}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* ══════════════════════════════════════════════════════════════════
                RIGHT MAIN CONTENT: STATS & LISTS (Col 8)
               ══════════════════════════════════════════════════════════════════ */}
            <main className="lg:col-span-8 flex flex-col gap-8">
              {/* Solved Problems Analytics */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-2">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <FiBarChart2 className="w-5 h-5 text-green-400" />
                      <span>Solved Problems Analytics</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Calculated from real question bank and submission records
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold font-mono">
                      Acceptance: {acceptanceRate}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-6">
                  {/* Circular Donut Graph */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-4">
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                        {/* Background circle */}
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke="#1e293b"
                          strokeWidth="12"
                        />
                        {/* Hard segment */}
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke="#ef4444"
                          strokeWidth="12"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference - hardDash * 0.3}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                        {/* Medium segment */}
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke="#eab308"
                          strokeWidth="12"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference - medDash * 0.5}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                        {/* Easy segment */}
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke="#22c55e"
                          strokeWidth="12"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference - easyDash * 0.7}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                      </svg>

                      {/* Donut Center Label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className="text-3xl font-black text-white tracking-tight font-mono">
                          {totalSolved}
                        </span>
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                          Solved
                        </span>
                        {totalQuestions > 0 && (
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                            of {totalQuestions}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs text-slate-400 font-medium mt-3 font-mono">
                      Total Submissions: <strong className="text-slate-200">{totalSubmissions}</strong>
                    </span>
                  </div>

                  {/* Difficulty Progress Bars */}
                  <div className="md:col-span-7 flex flex-col gap-4">
                    {/* Easy Bar */}
                    <div className="bg-[#020617] p-3.5 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-green-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-400" />
                          Easy
                        </span>
                        <span className="font-mono text-white font-bold">
                          {easySolved}{" "}
                          <span className="text-slate-500 font-normal">/ {easyTotal}</span>
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-700"
                          style={{ width: `${easyPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Medium Bar */}
                    <div className="bg-[#020617] p-3.5 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-yellow-400" />
                          Medium
                        </span>
                        <span className="font-mono text-white font-bold">
                          {medSolved}{" "}
                          <span className="text-slate-500 font-normal">/ {mediumTotal}</span>
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 rounded-full transition-all duration-700"
                          style={{ width: `${medPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Hard Bar */}
                    <div className="bg-[#020617] p-3.5 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-rose-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          Hard
                        </span>
                        <span className="font-mono text-white font-bold">
                          {hardSolved}{" "}
                          <span className="text-slate-500 font-normal">/ {hardTotal}</span>
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-700"
                          style={{ width: `${hardPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Quick Metric Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-center font-mono">
                  <div className="p-2.5 bg-[#020617] rounded-xl border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-sans">Total Submissions</span>
                    <p className="text-base font-black text-white mt-0.5">{totalSubmissions}</p>
                  </div>
                  <div className="p-2.5 bg-[#020617] rounded-xl border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-sans">Accepted Solutions</span>
                    <p className="text-base font-black text-green-400 mt-0.5">{totalSolved}</p>
                  </div>
                  <div className="p-2.5 bg-[#020617] rounded-xl border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-sans">Current Streak</span>
                    <p className="text-base font-black text-amber-400 mt-0.5">{streak} Days</p>
                  </div>
                  <div className="p-2.5 bg-[#020617] rounded-xl border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-sans">Starred Problems</span>
                    <p className="text-base font-black text-yellow-400 mt-0.5">{starredQuestionIds.length}</p>
                  </div>
                </div>
              </div>

              {/* User Question Lists (Solved, Liked, Starred) */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <FiFileText className="w-5 h-5 text-blue-400" />
                    <span>Question Activity</span>
                  </h2>

                  {/* Tabs: Solved, Liked, Starred */}
                  <div className="flex items-center gap-1 bg-[#020617] p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setActiveTab("solved")}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                        activeTab === "solved"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      <span>Solved ({solvedQuestionIds.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("liked")}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                        activeTab === "liked"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <FiHeart className="w-3.5 h-3.5" />
                      <span>Liked ({likedQuestionIds.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("starred")}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                        activeTab === "starred"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <FiStar className="w-3.5 h-3.5" />
                      <span>Starred ({starredQuestionIds.length})</span>
                    </button>
                  </div>
                </div>

                {/* Tab Content Display */}
                <div className="mt-4">
                  {/* Solved Questions Tab */}
                  {activeTab === "solved" && (
                    <div>
                      {solvedQuestionIds.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                          <FiCheckCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                          <p className="text-sm">No solved questions recorded yet for @{activeUsername}.</p>
                          <Link
                            to="/dashboard"
                            className="inline-block mt-3 text-xs text-green-400 hover:underline"
                          >
                            Explore Questions &rarr;
                          </Link>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-800/80">
                          {solvedQuestionIds.map((qid, idx) => {
                            const q = getQuestionDetails(qid);
                            return (
                              <div
                                key={idx}
                                className="py-3 flex items-center justify-between hover:bg-slate-800/20 px-3 rounded-xl transition"
                              >
                                <div className="flex items-center gap-3">
                                  <FiCheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                                  <div>
                                    <Link
                                      to={`/problem/${q._id || q.questionId}`}
                                      className="font-semibold text-white text-sm hover:text-green-400 transition flex items-center gap-1.5"
                                    >
                                      <span>{q.title || `Problem #${qid}`}</span>
                                      <FiExternalLink className="w-3 h-3 text-slate-500" />
                                    </Link>
                                    {q.difficulty && (
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        Difficulty: {q.difficulty}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-green-400 font-mono font-semibold">
                                  Solved
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Liked Questions Tab */}
                  {activeTab === "liked" && (
                    <div>
                      {likedQuestionIds.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                          <FiHeart className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                          <p className="text-sm">No liked questions recorded yet.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-800/80">
                          {likedQuestionIds.map((qid, idx) => {
                            const q = getQuestionDetails(qid);
                            return (
                              <div
                                key={idx}
                                className="py-3 flex items-center justify-between hover:bg-slate-800/20 px-3 rounded-xl transition"
                              >
                                <div className="flex items-center gap-3">
                                  <FiHeart className="w-4 h-4 text-rose-400 shrink-0" />
                                  <Link
                                    to={`/problem/${q._id || q.questionId}`}
                                    className="font-semibold text-white text-sm hover:text-rose-400 transition flex items-center gap-1.5"
                                  >
                                    <span>{q.title || `Problem #${qid}`}</span>
                                    <FiExternalLink className="w-3 h-3 text-slate-500" />
                                  </Link>
                                </div>
                                <span className="text-xs text-rose-400 font-mono">Liked</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Starred Questions Tab */}
                  {activeTab === "starred" && (
                    <div>
                      {starredQuestionIds.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                          <FiStar className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                          <p className="text-sm">No starred questions recorded yet.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-800/80">
                          {starredQuestionIds.map((qid, idx) => {
                            const q = getQuestionDetails(qid);
                            return (
                              <div
                                key={idx}
                                className="py-3 flex items-center justify-between hover:bg-slate-800/20 px-3 rounded-xl transition"
                              >
                                <div className="flex items-center gap-3">
                                  <FiStar className="w-4 h-4 text-amber-400 shrink-0" />
                                  <Link
                                    to={`/problem/${q._id || q.questionId}`}
                                    className="font-semibold text-white text-sm hover:text-amber-400 transition flex items-center gap-1.5"
                                  >
                                    <span>{q.title || `Problem #${qid}`}</span>
                                    <FiExternalLink className="w-3 h-3 text-slate-500" />
                                  </Link>
                                </div>
                                <span className="text-xs text-amber-400 font-mono">Starred</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
