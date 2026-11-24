import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { getAllQuestions, logoutUser, getUserStats } from "../services/api";
import {
  FiSearch,
  FiX,
  FiShuffle,
  FiLock,
  FiCheck,
  FiCalendar,
  FiBarChart2,
  FiAward,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiActivity,
} from "react-icons/fi";
import { BsFire, BsCoin } from "react-icons/bs";

const Dashboard = () => {
  const navigate = useNavigate();

  // Authentication & User State
  const [user, setUser] = useState(null);

  // Questions State
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Solved, Unsolved
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Local Solved Tracking
  const [solvedIds, setSolvedIds] = useState(() => {
    try {
      const saved = localStorage.getItem("solved_question_ids");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Load User
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

  // Fetch Questions from backend
  const fetchQuestionsList = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await getAllQuestions();
      if (res?.success && Array.isArray(res.data)) {
        setQuestions(res.data);
      } else {
        setQuestions([]);
        setFetchError("Unexpected response format from server.");
      }

      // If user is logged in, fetch their solved questions from backend
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const targetUsername = parsedUser?.username || user?.username;

      if (targetUsername) {
        try {
          const profile = await getUserStats(targetUsername);
          if (Array.isArray(profile?.solvedQuestions) && profile.solvedQuestions.length > 0) {
            setSolvedIds((prev) => {
              const merged = new Set(prev);
              profile.solvedQuestions.forEach((qid) => {
                merged.add(qid);
                merged.add(Number(qid));
              });
              return merged;
            });
          }
        } catch (profErr) {
          console.warn("Could not load backend solved questions for user:", profErr);
        }
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
      setFetchError(err.message || "Failed to connect to backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionsList();
  }, []);

  // Toggle question solved state
  const toggleSolved = (id) => {
    setSolvedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(
          "solved_question_ids",
          JSON.stringify(Array.from(next))
        );
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Sign out handler
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/logout");
    }
  };

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const qId = String(q.questionId || "");
      const title = String(q.title || "").toLowerCase();
      const slug = String(q.slug || "").toLowerCase();
      const term = search.toLowerCase();

      const matchesSearch =
        !term || title.includes(term) || qId.includes(term) || slug.includes(term);

      const matchesDifficulty =
        selectedDifficulty === "All" ||
        q.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

      const isSolved = solvedIds.has(q._id || q.questionId);
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Solved" && isSolved) ||
        (statusFilter === "Unsolved" && !isSolved);

      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [questions, search, selectedDifficulty, statusFilter, solvedIds]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = questions.length;
    let easyTotal = 0;
    let mediumTotal = 0;
    let hardTotal = 0;

    let solvedTotal = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    questions.forEach((q) => {
      const diff = (q.difficulty || "").toLowerCase();
      const isSolved = solvedIds.has(q._id || q.questionId);

      if (diff === "easy") {
        easyTotal++;
        if (isSolved) easySolved++;
      } else if (diff === "medium") {
        mediumTotal++;
        if (isSolved) mediumSolved++;
      } else if (diff === "hard") {
        hardTotal++;
        if (isSolved) hardSolved++;
      }

      if (isSolved) solvedTotal++;
    });

    return {
      total,
      solvedTotal,
      easyTotal,
      easySolved,
      mediumTotal,
      mediumSolved,
      hardTotal,
      hardSolved,
    };
  }, [questions, solvedIds]);

  // Pick random question
  const pickRandom = () => {
    if (questions.length === 0) return;
    const randomIndex = Math.floor(Math.random() * questions.length);
    const chosen = questions[randomIndex];
    setSearch(chosen.title);
  };

  // Calendar Helpers
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const currentUsername =
    user?.username ||
    (user?.email ? user.email.split("@")[0] : null) ||
    user?.name ||
    "dev_coder5";

  return (
    <div className="bg-[#020617] min-h-screen text-slate-100 font-sans selection:bg-green-500 selection:text-black">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#020617]/90 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand & Main Nav */}
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
              <span className="px-3 py-1.5 rounded-lg text-white font-semibold bg-slate-800/80">
                Problems
              </span>
              <Link
                to={`/profile/${encodeURIComponent(currentUsername)}`}
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition"
              >
                User Dashboard
              </Link>
            </nav>
          </div>

          {/* Right: User Bar & Badges */}
          <div className="flex items-center gap-3">
            {/* Streak Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400">
              <BsFire className="w-3.5 h-3.5 text-amber-400" />
              <span>1</span>
            </div>

            {/* Coins */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-yellow-400">
              <BsCoin className="w-3.5 h-3.5 text-yellow-400" />
              <span>120</span>
            </div>

            {/* User Avatar & Name */}
            <Link
              to={`/profile/${encodeURIComponent(currentUsername)}`}
              className="flex items-center gap-2 pl-2 hover:opacity-85 transition group"
              title="View User Dashboard"
            >
              <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 font-bold text-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="text-sm font-semibold text-white hidden md:inline-block max-w-[120px] truncate group-hover:text-green-400 transition-colors">
                {user?.name || user?.email || "User"}
              </span>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/40 transition ml-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Dashboard Layout ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ══════════════════════════════════════════════════════════════════
              MIDDLE CONTENT: ALL QUESTIONS & PRACTICE LIST (Col 8)
             ══════════════════════════════════════════════════════════════════ */}
          <main className="lg:col-span-8 flex flex-col gap-6">
            {/* Quick Filter Bar */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h1 className="text-xl font-black text-white flex items-center gap-2">
                    <span>Problem Repository</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-green-400 border border-slate-700">
                      {filteredQuestions.length} Questions
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Practice, solve, and track your coding interview challenges.
                  </p>
                </div>

                {/* Random Pick Button */}
                <button
                  onClick={pickRandom}
                  disabled={questions.length === 0}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-green-400 transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <FiShuffle className="w-3.5 h-3.5" />
                  <span>Pick Random</span>
                </button>
              </div>

              {/* Search & Filter Controls */}
              <div className="pt-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by title, #, or slug..."
                    className="w-full pl-9 pr-8 py-2 bg-[#020617] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition"
                  />
                  <FiSearch className="absolute left-3 top-2.5 text-slate-500 text-xs w-3.5 h-3.5" />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Difficulty Filters */}
                <div className="flex items-center gap-1 bg-[#020617] p-1 rounded-xl border border-slate-800 shrink-0">
                  {["All", "Easy", "Medium", "Hard"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => {
                        setSelectedDifficulty(diff);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        selectedDifficulty === diff
                          ? diff === "Easy"
                            ? "bg-emerald-500 text-black font-bold"
                            : diff === "Medium"
                            ? "bg-amber-500 text-black font-bold"
                            : diff === "Hard"
                            ? "bg-rose-500 text-white font-bold"
                            : "bg-green-500 text-black font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 bg-[#020617] p-1 rounded-xl border border-slate-800 shrink-0">
                  {["All", "Solved", "Unsolved"].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setStatusFilter(st);
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        statusFilter === st
                          ? "bg-slate-700 text-white font-bold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Questions Table Card */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm font-semibold text-slate-300">
                    Loading questions from server...
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Fetching from /api/admin/qs/getallques
                  </p>
                </div>
              ) : fetchError ? (
                <div className="py-16 px-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-2xl flex items-center justify-center mx-auto mb-3">
                    <FiAlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Unable to load questions
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                    {fetchError}
                  </p>
                  <button
                    onClick={fetchQuestionsList}
                    className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold text-xs rounded-xl transition"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="py-16 px-6 text-center">
                  <p className="text-sm font-semibold text-slate-300">
                    No questions match your current filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedDifficulty("All");
                      setStatusFilter("All");
                    }}
                    className="mt-3 text-xs text-green-400 hover:underline font-bold"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-[#020617] text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">Status</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4 w-28">Difficulty</th>
                        <th className="py-3 px-4 w-24 text-center">Type</th>
                        <th className="py-3 px-4 w-24 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium text-xs">
                      {paginatedQuestions.map((q, idx) => {
                        const isSolved = solvedIds.has(q._id || q.questionId);
                        const displayId =
                          q.questionId || (currentPage - 1) * pageSize + idx + 1;

                        return (
                          <tr
                            key={q._id || q.questionId || idx}
                            className="hover:bg-slate-800/40 transition group"
                          >
                            {/* Solved Status Checkbox */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() =>
                                  toggleSolved(q._id || q.questionId)
                                }
                                title={
                                  isSolved
                                    ? "Mark as unsolved"
                                    : "Mark as solved"
                                }
                                className={`w-5 h-5 rounded flex items-center justify-center transition border ${
                                  isSolved
                                    ? "bg-green-500 border-green-500 text-black"
                                    : "border-slate-700 hover:border-slate-500 bg-[#020617]"
                                }`}
                              >
                                {isSolved && (
                                  <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
                                )}
                              </button>
                            </td>

                            {/* Question Title & Slug */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/problem/${q.questionId || q._id}`}
                                  className="font-semibold text-white hover:text-green-400 transition cursor-pointer text-sm"
                                >
                                  {displayId}. {q.title}
                                </Link>
                                {q.isPremium && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold flex items-center gap-1">
                                    <FiLock className="w-2.5 h-2.5" />
                                    <span>Premium</span>
                                  </span>
                                )}
                              </div>
                              {q.slug && (
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {q.slug}
                                </span>
                              )}
                            </td>

                            {/* Difficulty */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                                  q.difficulty?.toLowerCase() === "easy"
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : q.difficulty?.toLowerCase() === "medium"
                                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                    : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                }`}
                              >
                                {q.difficulty || "Medium"}
                              </span>
                            </td>

                            {/* Free / Premium Badge */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="text-[10px] text-slate-400">
                                {q.isPremium ? "Premium" : "Free"}
                              </span>
                            </td>

                            {/* Action / Solve Button */}
                            <td className="py-3.5 px-4 text-right">
                              <Link
                                to={`/problem/${q.questionId || q._id}`}
                                className="inline-block px-3 py-1 rounded-lg bg-slate-800 hover:bg-green-500 hover:text-black text-xs font-semibold text-slate-200 transition"
                              >
                                Solve
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Footer */}
              {!isLoading && filteredQuestions.length > 0 && (
                <div className="px-5 py-3.5 bg-[#020617] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div>
                    Showing{" "}
                    <span className="font-semibold text-white">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-white">
                      {Math.min(
                        currentPage * pageSize,
                        filteredQuestions.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-white">
                      {filteredQuestions.length}
                    </span>{" "}
                    questions
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition font-medium flex items-center gap-1"
                    >
                      <FiChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <span className="px-2 font-mono text-white">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition font-medium flex items-center gap-1"
                    >
                      <span>Next</span>
                      <FiChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT SIDEBAR: CALENDAR & PROGRESS WIDGETS (Col 4)
             ══════════════════════════════════════════════════════════════════ */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Calendar Widget */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-amber-400 text-base" />
                  <h3 className="font-bold text-sm text-white">
                    {monthNames[month]} {year}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="w-7 h-7 rounded-lg bg-[#020617] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs transition"
                  >
                    <FiChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="w-7 h-7 rounded-lg bg-[#020617] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs transition"
                  >
                    <FiChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-500 mb-2">
                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {/* Empty padding days for previous month */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}

                {/* Days of current month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isToday =
                    isCurrentMonth && dayNum === today.getDate();
                  const isStreakDay =
                    dayNum % 2 === 1 && dayNum <= (isCurrentMonth ? today.getDate() : 25);

                  return (
                    <div
                      key={`day-${dayNum}`}
                      className={`h-8 flex flex-col items-center justify-center rounded-lg transition relative cursor-pointer ${
                        isToday
                          ? "bg-green-500 text-black font-black shadow-md shadow-green-500/30"
                          : isStreakDay
                          ? "bg-[#020617] text-white hover:bg-slate-800 border border-emerald-500/30"
                          : "text-slate-400 hover:bg-slate-800/60"
                      }`}
                    >
                      <span className="text-[11px]">{dayNum}</span>
                      {isStreakDay && !isToday && (
                        <span className="w-1 h-1 rounded-full bg-emerald-400 -mt-0.5" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Monthly Activity Summary */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <FiActivity className="text-green-400 w-3 h-3" />
                  <span>Current Streak: <strong className="text-white">1 Day</strong></span>
                </div>
                <div>
                  Active: <strong className="text-white">14 Days</strong>
                </div>
              </div>
            </div>

            {/* Solved Progress Breakdown Card */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <FiBarChart2 className="w-4 h-4 text-green-400" />
                  <span>Session Progress</span>
                </h3>
                <span className="text-xs font-mono text-green-400 font-bold">
                  {stats.solvedTotal}/{stats.total} Solved
                </span>
              </div>

              {/* Difficulty Progress Bars */}
              <div className="space-y-3.5">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-400 font-semibold">Easy</span>
                    <span className="text-slate-400 font-mono">
                      {stats.easySolved} / {stats.easyTotal}
                    </span>
                  </div>
                  <div className="w-full bg-[#020617] rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          stats.easyTotal > 0
                            ? (stats.easySolved / stats.easyTotal) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-400 font-semibold">Medium</span>
                    <span className="text-slate-400 font-mono">
                      {stats.mediumSolved} / {stats.mediumTotal}
                    </span>
                  </div>
                  <div className="w-full bg-[#020617] rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          stats.mediumTotal > 0
                            ? (stats.mediumSolved / stats.mediumTotal) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Hard */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-rose-400 font-semibold">Hard</span>
                    <span className="text-slate-400 font-mono">
                      {stats.hardSolved} / {stats.hardTotal}
                    </span>
                  </div>
                  <div className="w-full bg-[#020617] rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          stats.hardTotal > 0
                            ? (stats.hardSolved / stats.hardTotal) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
