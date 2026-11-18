import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { logoutUser } from "../services/api";
import {
  FiCheckCircle,
  FiXCircle,
  FiActivity,
  FiBarChart2,
  FiAward,
  FiCalendar,
  FiClock,
  FiCode,
  FiExternalLink,
  FiEdit3,
  FiGithub,
  FiLinkedin,
  FiGlobe,
  FiMapPin,
  FiTrendingUp,
  FiChevronRight,
  FiFileText,
  FiCheck,
  FiLayers,
} from "react-icons/fi";
import { BsFire, BsCoin, BsTrophy, BsShieldCheck } from "react-icons/bs";

// ════════════════════════════════════════════════════════════════════════════
// DUMMY DATA FOR USER DASHBOARD (EASILY REPLACEABLE WITH BACKEND API LATER)
// ════════════════════════════════════════════════════════════════════════════
export const DUMMY_USER_STATS = {
  profile: {
    username: "dev_coder",
    name: "Dev",
    role: "Full-Stack Engineer & Competitive Programmer",
    location: "Global",
    website: "https://github.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    globalRank: 14289,
    topPercentile: 4.2,
    coins: 340,
    streak: 14,
    views: 1420,
    solutionUpvotes: 184,
  },
  solvedStats: {
    totalSolved: 348,
    totalQuestions: 3120,
    beatsPercentage: 84.6,
    easy: {
      solved: 162,
      total: 820,
      beats: 89.2,
    },
    medium: {
      solved: 154,
      total: 1640,
      beats: 78.5,
    },
    hard: {
      solved: 32,
      total: 660,
      beats: 92.1,
    },
    totalSubmissions: 894,
    acceptedSubmissions: 542,
    acceptanceRate: 60.6,
  },
  contestStats: {
    rating: 1842,
    globalRank: 12450,
    topPercentage: 3.8,
    attendedContests: 18,
    ratingHistory: [
      { contest: "Contest 382", rating: 1510 },
      { contest: "Contest 383", rating: 1565 },
      { contest: "Contest 384", rating: 1540 },
      { contest: "Contest 385", rating: 1620 },
      { contest: "Contest 386", rating: 1675 },
      { contest: "Contest 387", rating: 1710 },
      { contest: "Contest 388", rating: 1690 },
      { contest: "Contest 389", rating: 1755 },
      { contest: "Contest 390", rating: 1810 },
      { contest: "Contest 391", rating: 1842 },
    ],
  },
  languages: [
    { name: "Python", solved: 182, color: "#38bdf8" },
    { name: "C++", solved: 94, color: "#a855f7" },
    { name: "Java", solved: 52, color: "#f97316" },
    { name: "JavaScript", solved: 20, color: "#facc15" },
  ],
  skills: [
    { name: "Array", count: 112 },
    { name: "String", count: 84 },
    { name: "Hash Table", count: 76 },
    { name: "Dynamic Programming", count: 48 },
    { name: "Two Pointers", count: 38 },
    { name: "Binary Tree", count: 32 },
    { name: "Depth-First Search", count: 28 },
    { name: "Binary Search", count: 24 },
  ],
  badges: [
    { title: "50 Days Badge 2026", date: "Jan 2026", tier: "Gold" },
    { title: "Knight Medal", date: "Rating 1800+", tier: "Purple" },
    { title: "100 Problems Solved", date: "Dec 2025", tier: "Bronze" },
    { title: "Top 100 Liked", date: "Nov 2025", tier: "Silver" },
  ],
  recentSubmissions: [
    {
      id: "1",
      questionId: "1",
      title: "Two Sum",
      status: "Accepted",
      language: "Python",
      runtime: "38 ms",
      memory: "17.4 MB",
      timeAgo: "2 hours ago",
      difficulty: "Easy",
    },
    {
      id: "2",
      questionId: "20",
      title: "Valid Parentheses",
      status: "Accepted",
      language: "C++",
      runtime: "0 ms",
      memory: "7.2 MB",
      timeAgo: "5 hours ago",
      difficulty: "Easy",
    },
    {
      id: "3",
      questionId: "3",
      title: "Longest Substring Without Repeating Characters",
      status: "Accepted",
      language: "Python",
      runtime: "48 ms",
      memory: "16.8 MB",
      timeAgo: "Yesterday",
      difficulty: "Medium",
    },
    {
      id: "4",
      questionId: "15",
      title: "3Sum",
      status: "Wrong Answer",
      language: "Java",
      runtime: "N/A",
      memory: "N/A",
      timeAgo: "2 days ago",
      difficulty: "Medium",
    },
    {
      id: "5",
      questionId: "23",
      title: "Merge k Sorted Lists",
      status: "Accepted",
      language: "C++",
      runtime: "12 ms",
      memory: "14.1 MB",
      timeAgo: "3 days ago",
      difficulty: "Hard",
    },
    {
      id: "6",
      questionId: "121",
      title: "Best Time to Buy and Sell Stock",
      status: "Accepted",
      language: "Python",
      runtime: "712 ms",
      memory: "27.5 MB",
      timeAgo: "4 days ago",
      difficulty: "Easy",
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// DUMMY 365-DAY SUBMISSION HEATMAP GENERATOR
// ════════════════════════════════════════════════════════════════════════════
function generateHeatmapData() {
  const days = [];
  const today = new Date();
  const totalDays = 52 * 7; // 364 days

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    // Realistic distribution: clusters of submissions with occasional high volume
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const rand = Math.sin(i * 0.15) + Math.cos(i * 0.08);

    let count = 0;
    if (rand > 0.4) {
      count = Math.floor(((rand + 1) * 3) % 7);
      if (isWeekend) count += 1;
    }

    days.push({
      dateStr: d.toISOString().split("T")[0],
      displayDate: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      month: d.toLocaleString("en-US", { month: "short" }),
      dayOfWeek,
      count,
    });
  }

  // Group into 52 weeks (columns), 7 rows each
  const weeks = [];
  for (let w = 0; w < 52; w++) {
    weeks.push(days.slice(w * 7, (w + 1) * 7));
  }

  const totalSubs = days.reduce((acc, curr) => acc + curr.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;

  return { weeks, days, totalSubs, activeDays };
}

const UserDashboard = () => {
  const navigate = useNavigate();

  // User state
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const stored = localStorage.getItem("user_profile");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [submissionTab, setSubmissionTab] = useState("all");
  const [hoveredDay, setHoveredDay] = useState(null);
  const [hoveredContest, setHoveredContest] = useState(null);

  // Load user
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Compute Heatmap
  const { weeks, totalSubs, activeDays } = useMemo(() => generateHeatmapData(), []);

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

  const stats = DUMMY_USER_STATS;
  const userName = userProfile?.name || user?.name || stats.profile.name;
  const userUsername = userProfile?.username || user?.username || stats.profile.username;
  const userEmail = userProfile?.email || user?.email || "dev@codeforge.io";
  const userRole = userProfile?.role || user?.role || stats.profile.role;
  const userLocation = userProfile?.location || stats.profile.location;
  const userWebsite = userProfile?.website || stats.profile.website;
  const userGithub = userProfile?.github || stats.profile.github;
  const userLinkedin = userProfile?.linkedin || stats.profile.linkedin;

  // Solved Percentages
  const easyPct = Math.min(100, Math.round((stats.solvedStats.easy.solved / stats.solvedStats.easy.total) * 100));
  const medPct = Math.min(100, Math.round((stats.solvedStats.medium.solved / stats.solvedStats.medium.total) * 100));
  const hardPct = Math.min(100, Math.round((stats.solvedStats.hard.solved / stats.solvedStats.hard.total) * 100));
  const totalPct = Math.min(100, Math.round((stats.solvedStats.totalSolved / stats.solvedStats.totalQuestions) * 100));

  // Circular Chart math
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const easyDash = (easyPct / 100) * circumference;
  const medDash = (medPct / 100) * circumference;
  const hardDash = (hardPct / 100) * circumference;

  // Filter Submissions
  const filteredSubmissions = useMemo(() => {
    if (submissionTab === "accepted") {
      return stats.recentSubmissions.filter((s) => s.status === "Accepted");
    }
    if (submissionTab === "wrong") {
      return stats.recentSubmissions.filter((s) => s.status !== "Accepted");
    }
    return stats.recentSubmissions;
  }, [submissionTab, stats.recentSubmissions]);

  // Months for heatmap header
  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return (
    <div className="bg-[#020617] min-h-screen text-slate-100 font-sans selection:bg-green-500 selection:text-black">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#020617]/90 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand & Main Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-green-500/30 group-hover:scale-105 transition-transform">
                &lt;/&gt;
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  Code<span className="text-green-400">Forge</span>
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
              >
                Problems
              </Link>
              <span className="px-3 py-1.5 rounded-lg text-white font-semibold bg-slate-800/80">
                User Dashboard
              </span>
              <a
                href="#contests"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition"
              >
                Contests
              </a>
              <a
                href="#discuss"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition"
              >
                Discuss
              </a>
            </nav>
          </div>

          {/* Right: Badges, Coins & User Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400">
              <BsFire className="w-3.5 h-3.5 text-amber-400" />
              <span>{stats.profile.streak} Days Streak</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-yellow-400">
              <BsCoin className="w-3.5 h-3.5 text-yellow-400" />
              <span>{stats.profile.coins}</span>
            </div>

            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 text-black font-extrabold text-xs flex items-center justify-center shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-white hidden md:inline-block max-w-[120px] truncate">
                {userName}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/40 transition ml-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Profile & Dashboard Layout ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ══════════════════════════════════════════════════════════════════
              LEFT SIDEBAR: USER PROFILE & BADGES (Col 4)
             ══════════════════════════════════════════════════════════════════ */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* User Profile Card */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 blur-[80px] rounded-full pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 p-0.5 shadow-lg shadow-green-500/20">
                    <div className="w-full h-full bg-[#020617] rounded-[14px] flex items-center justify-center text-green-400 font-black text-3xl">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-[#0f172a] rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-black text-white truncate">{userName}</h1>
                  <p className="text-xs font-mono text-slate-400 mt-0.5 truncate">
                    @{userUsername}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[11px] font-semibold uppercase tracking-wider">
                      {userRole}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <FiAward className="w-3.5 h-3.5 text-yellow-400" />
                      Rank #{stats.profile.globalRank.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action: Edit Profile */}
              <Link
                to="/profile-setup"
                className="w-full mt-5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition border border-slate-700/60"
              >
                <FiEdit3 className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit Profile</span>
              </Link>

              {/* User Bio & Meta */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{userLocation}</span>
                </div>
                {userWebsite && (
                  <div className="flex items-center gap-2">
                    <FiGlobe className="w-3.5 h-3.5 text-slate-500" />
                    <a href={userWebsite} target="_blank" rel="noreferrer" className="hover:text-green-400 transition truncate">
                      {userWebsite.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FiGithub className="w-3.5 h-3.5 text-slate-500" />
                  <a href={userGithub} target="_blank" rel="noreferrer" className="hover:text-green-400 transition truncate">
                    {userGithub.replace(/^https?:\/\//, "")}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <FiLinkedin className="w-3.5 h-3.5 text-slate-500" />
                  <a href={userLinkedin} target="_blank" rel="noreferrer" className="hover:text-green-400 transition truncate">
                    {userLinkedin.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </div>

              {/* Community Rank & Upvotes */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-center">
                <div className="bg-[#020617] rounded-xl p-3 border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-medium">Top Percentile</p>
                  <p className="text-lg font-black text-green-400 mt-1">Top {stats.profile.topPercentile}%</p>
                </div>
                <div className="bg-[#020617] rounded-xl p-3 border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-medium">Solution Upvotes</p>
                  <p className="text-lg font-black text-amber-400 mt-1">{stats.profile.solutionUpvotes}</p>
                </div>
              </div>
            </div>

            {/* Badges Shelf */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <BsTrophy className="w-4 h-4 text-amber-400" />
                  <span>Badges & Honors</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono">{stats.badges.length} Total</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {stats.badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#020617] border border-slate-800 rounded-2xl flex flex-col items-center text-center group hover:border-slate-700 transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform">
                      <BsShieldCheck className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-bold text-white line-clamp-1">{badge.title}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{badge.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages Used */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-4 border-b border-slate-800">
                <FiCode className="w-4 h-4 text-green-400" />
                <span>Languages Solved</span>
              </h2>

              <div className="mt-4 space-y-3">
                {stats.languages.map((lang, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                      <span className="font-semibold text-slate-200">{lang.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                      <span className="font-bold text-white">{lang.solved}</span>
                      <span>problems</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Problem Topics */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-4 border-b border-slate-800">
                <FiLayers className="w-4 h-4 text-blue-400" />
                <span>Top Solved Topics</span>
              </h2>

              <div className="flex flex-wrap gap-2 mt-4">
                {stats.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#020617] border border-slate-800 text-xs font-medium text-slate-300 hover:border-slate-700 transition"
                  >
                    <span>{skill.name}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-green-400 font-bold">
                      {skill.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT COLUMN: GRAPHS & SUBMISSIONS (Col 8)
             ══════════════════════════════════════════════════════════════════ */}
          <main className="lg:col-span-8 flex flex-col gap-8">
            {/* ─────────────────────────────────────────────────────────────
                SECTION 1: SUBMITTED QUESTIONS PROGRESS GRAPH ("submiited questiongrph")
               ───────────────────────────────────────────────────────────── */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-2">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <FiBarChart2 className="w-5 h-5 text-green-400" />
                    <span>Solved Problems Analytics</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time question breakdown and acceptance metrics
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold">
                    Beats {stats.solvedStats.beatsPercentage}% of users
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
                      {/* Hard solved segment (Red/Rose) */}
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
                        className="transition-all duration-1000"
                      />
                      {/* Medium solved segment (Amber/Yellow) */}
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
                        className="transition-all duration-1000"
                      />
                      {/* Easy solved segment (Green) */}
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
                        className="transition-all duration-1000"
                      />
                    </svg>

                    {/* Donut Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-3xl font-black text-white tracking-tight">
                        {stats.solvedStats.totalSolved}
                      </span>
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                        Solved
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                        of {stats.solvedStats.totalQuestions}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-medium mt-3">
                    Acceptance Rate: <strong className="text-slate-200">{stats.solvedStats.acceptanceRate}%</strong>
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
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-bold">
                          {stats.solvedStats.easy.solved}{" "}
                          <span className="text-slate-500 font-normal">/ {stats.solvedStats.easy.total}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Beats {stats.solvedStats.easy.beats}%</span>
                      </div>
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
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-bold">
                          {stats.solvedStats.medium.solved}{" "}
                          <span className="text-slate-500 font-normal">/ {stats.solvedStats.medium.total}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Beats {stats.solvedStats.medium.beats}%</span>
                      </div>
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
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-bold">
                          {stats.solvedStats.hard.solved}{" "}
                          <span className="text-slate-500 font-normal">/ {stats.solvedStats.hard.total}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Beats {stats.solvedStats.hard.beats}%</span>
                      </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-center">
                <div className="p-2.5 bg-[#020617] rounded-xl border border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Total Submissions</span>
                  <p className="text-base font-black text-white mt-0.5">{stats.solvedStats.totalSubmissions}</p>
                </div>
                <div className="p-2.5 bg-[#020617] rounded-xl border border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Accepted Solutions</span>
                  <p className="text-base font-black text-green-400 mt-0.5">{stats.solvedStats.acceptedSubmissions}</p>
                </div>
                <div className="p-2.5 bg-[#020617] rounded-xl border border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Current Streak</span>
                  <p className="text-base font-black text-amber-400 mt-0.5">{stats.profile.streak} Days</p>
                </div>
                <div className="p-2.5 bg-[#020617] rounded-xl border border-slate-800/80">
                  <span className="text-[11px] text-slate-400">Profile Views</span>
                  <p className="text-base font-black text-blue-400 mt-0.5">{stats.profile.views}</p>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                SECTION 2: ACTIVITY SUBMISSION HEATMAP GRAPH ("keatest graph")
               ───────────────────────────────────────────────────────────── */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <FiActivity className="w-5 h-5 text-emerald-400" />
                    <span>Submission Heatmap Activity</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <strong className="text-white">{totalSubs} submissions</strong> across {activeDays} active days in the last year
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-xs font-bold text-white border border-slate-700">
                    Year 2026
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-[#020617] text-xs font-medium text-slate-400 border border-slate-800 cursor-pointer hover:text-white transition">
                    2025
                  </span>
                </div>
              </div>

              {/* Heatmap Tooltip Bar */}
              <div className="h-6 mt-3 flex items-center text-xs text-slate-400 font-mono">
                {hoveredDay ? (
                  <span className="text-green-400 font-bold">
                    {hoveredDay.count > 0 ? `${hoveredDay.count} submissions on ${hoveredDay.displayDate}` : `No submissions on ${hoveredDay.displayDate}`}
                  </span>
                ) : (
                  <span className="text-slate-500">Hover over any square to see activity detail</span>
                )}
              </div>

              {/* Heatmap Container */}
              <div className="overflow-x-auto pb-2 pt-1 scrollbar-thin">
                <div className="min-w-[700px] flex flex-col gap-1.5">
                  {/* Month header row */}
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono px-2">
                    {monthLabels.map((m, idx) => (
                      <span key={idx}>{m}</span>
                    ))}
                  </div>

                  {/* 52 columns x 7 rows grid */}
                  <div className="flex gap-1">
                    {weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-1">
                        {week.map((day, dIdx) => {
                          // Determine color intensity
                          let bg = "bg-[#1e293b]"; // 0
                          if (day.count === 1) bg = "bg-emerald-800";
                          else if (day.count === 2) bg = "bg-emerald-600";
                          else if (day.count >= 3 && day.count < 5) bg = "bg-green-500";
                          else if (day.count >= 5) bg = "bg-emerald-400 shadow-sm shadow-emerald-400/50";

                          return (
                            <div
                              key={dIdx}
                              onMouseEnter={() => setHoveredDay(day)}
                              onMouseLeave={() => setHoveredDay(null)}
                              className={`w-3 h-3 rounded-[3px] ${bg} transition-colors cursor-pointer hover:ring-2 hover:ring-white`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-4 text-[11px]">
                  <span>Total Active Days: <strong className="text-white">{activeDays}</strong></span>
                  <span>Max Streak: <strong className="text-amber-400">36 Days</strong></span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded-[3px] bg-[#1e293b]" />
                  <div className="w-3 h-3 rounded-[3px] bg-emerald-800" />
                  <div className="w-3 h-3 rounded-[3px] bg-emerald-600" />
                  <div className="w-3 h-3 rounded-[3px] bg-green-500" />
                  <div className="w-3 h-3 rounded-[3px] bg-emerald-400" />
                  <span>More</span>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                SECTION 3: CONTEST RATING PROGRESSION GRAPH
               ───────────────────────────────────────────────────────────── */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-2">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <FiTrendingUp className="w-5 h-5 text-amber-400" />
                    <span>Contest Rating History</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Current Rating: <strong className="text-amber-400 font-bold">{stats.contestStats.rating}</strong> (Guardian Tier, Top {stats.contestStats.topPercentage}%)
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {stats.contestStats.attendedContests} Contests Attended
                </div>
              </div>

              {/* Interactive SVG Rating Line Graph */}
              <div className="mt-6">
                <div className="h-44 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 140" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path
                      d="M 20 120 L 20 90 L 80 80 L 140 85 L 200 65 L 260 52 L 320 42 L 380 48 L 440 32 L 500 20 L 560 12 L 560 120 Z"
                      fill="url(#ratingGrad)"
                    />

                    {/* Smooth Line */}
                    <path
                      d="M 20 90 L 80 80 L 140 85 L 200 65 L 260 52 L 320 42 L 380 48 L 440 32 L 500 20 L 560 12"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    {[
                      { x: 20, y: 90, c: stats.contestStats.ratingHistory[0] },
                      { x: 80, y: 80, c: stats.contestStats.ratingHistory[1] },
                      { x: 140, y: 85, c: stats.contestStats.ratingHistory[2] },
                      { x: 200, y: 65, c: stats.contestStats.ratingHistory[3] },
                      { x: 260, y: 52, c: stats.contestStats.ratingHistory[4] },
                      { x: 320, y: 42, c: stats.contestStats.ratingHistory[5] },
                      { x: 380, y: 48, c: stats.contestStats.ratingHistory[6] },
                      { x: 440, y: 32, c: stats.contestStats.ratingHistory[7] },
                      { x: 500, y: 20, c: stats.contestStats.ratingHistory[8] },
                      { x: 560, y: 12, c: stats.contestStats.ratingHistory[9] },
                    ].map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r="5"
                        fill="#020617"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        className="cursor-pointer hover:r-7 transition-all"
                        onMouseEnter={() => setHoveredContest(pt.c)}
                        onMouseLeave={() => setHoveredContest(null)}
                      />
                    ))}
                  </svg>
                </div>

                {/* Contest Tooltip / Info */}
                <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800">
                  <span className="font-mono">
                    {hoveredContest ? (
                      <span className="text-amber-400 font-bold">
                        {hoveredContest.contest} &bull; Rating: {hoveredContest.rating}
                      </span>
                    ) : (
                      "Hover over points on the curve to inspect contest ratings"
                    )}
                  </span>
                  <span className="text-[11px] text-slate-500">Global Ranking: #{stats.contestStats.globalRank}</span>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                SECTION 4: RECENT SUBMISSIONS LIST
               ───────────────────────────────────────────────────────────── */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-blue-400" />
                  <span>Recent Submissions</span>
                </h2>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-[#020617] p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setSubmissionTab("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      submissionTab === "all"
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSubmissionTab("accepted")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      submissionTab === "accepted"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Accepted
                  </button>
                  <button
                    onClick={() => setSubmissionTab("wrong")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      submissionTab === "wrong"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Wrong Answer
                  </button>
                </div>
              </div>

              {/* Submissions List */}
              <div className="divide-y divide-slate-800/80 mt-2">
                {filteredSubmissions.map((sub) => {
                  const isAccepted = sub.status === "Accepted";
                  const diffColor =
                    sub.difficulty === "Easy"
                      ? "text-green-400 bg-green-500/10 border-green-500/20"
                      : sub.difficulty === "Medium"
                      ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                      : "text-rose-400 bg-rose-500/10 border-rose-500/20";

                  return (
                    <div
                      key={sub.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/20 px-3 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3">
                        {isAccepted ? (
                          <FiCheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                        ) : (
                          <FiXCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        )}

                        <div>
                          <Link
                            to={`/problem/${sub.questionId}`}
                            className="font-bold text-white text-sm hover:text-green-400 transition flex items-center gap-1.5"
                          >
                            <span>{sub.title}</span>
                            <FiExternalLink className="w-3 h-3 text-slate-500" />
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                            <span className={`px-2 py-0.2 rounded-full border text-[10px] font-semibold ${diffColor}`}>
                              {sub.difficulty}
                            </span>
                            <span>&bull;</span>
                            <span className="text-slate-300 font-semibold">{sub.language}</span>
                            <span>&bull;</span>
                            <span>Runtime: {sub.runtime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col sm:items-end justify-between text-xs text-slate-500 font-mono pl-8 sm:pl-0">
                        <span className={isAccepted ? "text-green-400 font-bold" : "text-rose-400 font-bold"}>
                          {sub.status}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5">{sub.timeAgo}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
