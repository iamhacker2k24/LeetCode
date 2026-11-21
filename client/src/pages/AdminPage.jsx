import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { getAllQuestions, logoutUser } from "../services/api";
import {
  FiShield,
  FiDatabase,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiEye,
  FiCheckCircle,
  FiAlertTriangle,
  FiSearch,
  FiUsers,
  FiCpu,
  FiActivity,
  FiClock,
  FiCode,
  FiLayers,
  FiExternalLink,
  FiCheck,
  FiX,
  FiArrowLeft,
  FiSave,
} from "react-icons/fi";

// Initial Demo Questions (Falls back to this if backend returns empty)
const DEMO_QUESTIONS = [
  {
    _id: "6af959cb5e1afdb97bf70e4d",
    questionId: "1",
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    category: "Array",
    isPremium: false,
    acceptance: "52.8%",
    submissions: 18450,
  },
  {
    _id: "6af959cb5e1afdb97bf70e4e",
    questionId: "2",
    title: "Add Two Numbers",
    slug: "add-two-numbers",
    difficulty: "Medium",
    category: "Linked List",
    isPremium: false,
    acceptance: "42.1%",
    submissions: 12210,
  },
  {
    _id: "6af959cb5e1afdb97bf70e4f",
    questionId: "3",
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "Medium",
    category: "Sliding Window",
    isPremium: false,
    acceptance: "35.2%",
    submissions: 9840,
  },
  {
    _id: "6af959cb5e1afdb97bf70e50",
    questionId: "4",
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    difficulty: "Hard",
    category: "Binary Search",
    isPremium: true,
    acceptance: "39.4%",
    submissions: 6420,
  },
  {
    _id: "6af959cb5e1afdb97bf70e51",
    questionId: "20",
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Easy",
    category: "Stack",
    isPremium: false,
    acceptance: "41.0%",
    submissions: 24500,
  },
  {
    _id: "6af959cb5e1afdb97bf70e52",
    questionId: "42",
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    difficulty: "Hard",
    category: "Dynamic Programming",
    isPremium: true,
    acceptance: "61.7%",
    submissions: 8120,
  },
];

// Initial Demo Users
const DEMO_USERS = [
  {
    id: "usr_1",
    name: "Dev Patel",
    username: "dev_coder5",
    email: "dev123@gmail.com",
    role: "Admin",
    solved: 348,
    joinedDate: "Nov 12, 2026",
    status: "Active",
  },
  {
    id: "usr_2",
    name: "Alex Rivera",
    username: "alex_algorithms",
    email: "alex@tech.io",
    role: "User",
    solved: 182,
    joinedDate: "Oct 28, 2026",
    status: "Active",
  },
  {
    id: "usr_3",
    name: "Sarah Chen",
    username: "sarah_c",
    email: "sarah.chen@google.com",
    role: "User",
    solved: 420,
    joinedDate: "Sep 15, 2026",
    status: "Active",
  },
  {
    id: "usr_4",
    name: "Marcus Vance",
    username: "vancetech",
    email: "marcus@mit.edu",
    role: "User",
    solved: 94,
    joinedDate: "Nov 02, 2026",
    status: "Active",
  },
];

const AdminPage = () => {
  const navigate = useNavigate();

  // Active Tab: "questions" | "create" | "users" | "system"
  const [activeTab, setActiveTab] = useState("questions");

  // Questions State
  const [questions, setQuestions] = useState(DEMO_QUESTIONS);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // Notification Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2800);
  };

  // Fetch real questions if server is connected
  useEffect(() => {
    const fetchBackendQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const res = await getAllQuestions();
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setQuestions(res.data);
        }
      } catch (err) {
        // Fallback to demo data
        console.warn("Backend questions fetch fallback to demo questions:", err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchBackendQuestions();
  }, []);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        (q.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(q.questionId || "").includes(searchQuery) ||
        (q.category || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDiff =
        selectedDifficulty === "All" ||
        (q.difficulty || "").toLowerCase() === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesDiff;
    });
  }, [questions, searchQuery, selectedDifficulty]);

  // Form State for "Create Question"
  const [newQuestion, setNewQuestion] = useState({
    questionId: String(questions.length + 1),
    title: "",
    slug: "",
    difficulty: "Easy",
    category: "Array",
    isPremium: false,
    description: "",
    constraints: "1 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9",
    sampleInput: "nums = [2,7,11,15], target = 9",
    sampleOutput: "[0,1]",
    explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    pythonTemplate: "class Solution:\n    def solve(self, input):\n        pass",
    cppTemplate: "class Solution {\npublic:\n    void solve() {\n        \n    }\n};",
    javaTemplate: "class Solution {\n    public void solve() {\n        \n    }\n}",
  });

  // Auto-slug generator
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setNewQuestion((prev) => ({ ...prev, title, slug }));
  };

  const handleCreateQuestionSubmit = (e) => {
    e.preventDefault();
    if (!newQuestion.title.trim()) {
      showToast("Please provide a question title", "error");
      return;
    }

    const createdItem = {
      _id: `demo_${Date.now()}`,
      questionId: newQuestion.questionId || String(questions.length + 1),
      title: newQuestion.title,
      slug: newQuestion.slug || "new-question",
      difficulty: newQuestion.difficulty,
      category: newQuestion.category,
      isPremium: newQuestion.isPremium,
      acceptance: "0.0%",
      submissions: 0,
    };

    setQuestions((prev) => [createdItem, ...prev]);
    showToast(`Question #${createdItem.questionId} "${createdItem.title}" created successfully!`);

    // Reset Form
    setNewQuestion({
      questionId: String(questions.length + 2),
      title: "",
      slug: "",
      difficulty: "Easy",
      category: "Array",
      isPremium: false,
      description: "",
      constraints: "1 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9",
      sampleInput: "",
      sampleOutput: "",
      explanation: "",
      pythonTemplate: "class Solution:\n    def solve(self, input):\n        pass",
      cppTemplate: "class Solution {\npublic:\n    void solve() {\n        \n    }\n};",
      javaTemplate: "class Solution {\n    public void solve() {\n        \n    }\n}",
    });

    setActiveTab("questions");
  };

  const handleDeleteQuestion = (idToDelete) => {
    setQuestions((prev) => prev.filter((q) => (q._id || q.questionId) !== idToDelete));
    showToast("Question deleted from repository.");
  };

  // Logout Handler
  const handleAdminLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div className="bg-[#020617] min-h-screen text-slate-100 font-sans selection:bg-green-500 selection:text-black">
      {/* ── Toast Notification ─────────────────────────────────────────────── */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
            toast.type === "error"
              ? "bg-rose-950/90 text-rose-300 border-rose-500/40"
              : "bg-[#0f172a]/95 text-green-400 border-green-500/40 shadow-green-500/10"
          }`}
        >
          {toast.type === "error" ? (
            <FiAlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <FiCheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Admin Top Navigation Bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#020617]/90 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Brand & Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-green-500/30 group-hover:scale-105 transition-transform">
                &lt;/&gt;
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Code<span className="text-green-400">Forge</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <FiShield className="w-3 h-3" />
                  <span>Admin</span>
                </span>
              </div>
            </Link>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition font-medium"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>User Problem List</span>
            </Link>
          </div>

          {/* Right Admin Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Judge Online</span>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 font-black text-xs flex items-center justify-center">
                A
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-white">Super Admin</span>
                <span className="text-[10px] text-slate-400">admin@codeforge.io</span>
              </div>
            </div>

            <button
              onClick={handleAdminLogout}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/40 transition ml-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Platform Administration Console</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage questions, test cases, code templates, user accounts, and code execution servers.
            </p>
          </div>

          <button
            onClick={() => setActiveTab("create")}
            className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs rounded-xl transition duration-200 shadow-lg shadow-green-500/20 flex items-center gap-2 active:scale-95 w-fit"
          >
            <FiPlus className="w-4 h-4 stroke-[3]" />
            <span>Add New Question</span>
          </button>
        </div>

        {/* ── Platform Metric Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Questions</span>
              <FiDatabase className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-black text-white">{questions.length}</div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
              <span className="text-green-400 font-bold">
                {questions.filter((q) => q.difficulty === "Easy").length} Easy
              </span>
              <span>&bull;</span>
              <span className="text-yellow-400 font-bold">
                {questions.filter((q) => q.difficulty === "Medium").length} Med
              </span>
              <span>&bull;</span>
              <span className="text-rose-400 font-bold">
                {questions.filter((q) => q.difficulty === "Hard").length} Hard
              </span>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
              <FiUsers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">1,482</div>
            <p className="mt-2 text-[11px] text-slate-400">
              <span className="text-green-400 font-bold">+18 today</span> &bull; 99.4% active rate
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Runs Evaluated</span>
              <FiActivity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">48,920</div>
            <p className="mt-2 text-[11px] text-slate-400">
              Avg execution speed: <strong className="text-white">43 ms</strong>
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Judge Uptime</span>
              <FiCpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">99.98%</div>
            <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              <span>4 Workers healthy</span>
            </p>
          </div>
        </div>

        {/* ── Navigation Tabs ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === "questions"
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <FiDatabase className="w-3.5 h-3.5 text-green-400" />
            <span>Question Repository ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === "create"
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <FiPlus className="w-3.5 h-3.5 text-green-400" />
            <span>Create Question</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === "users"
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <FiUsers className="w-3.5 h-3.5 text-blue-400" />
            <span>User Accounts</span>
          </button>

          <button
            onClick={() => setActiveTab("system")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === "system"
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <FiCpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Judge & System Metrics</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 1: QUESTION REPOSITORY
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "questions" && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions by title, ID, or topic tag..."
                  className="w-full pl-10 pr-4 py-2 bg-[#020617] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-green-400 transition"
                />
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {["All", "Easy", "Medium", "Hard"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedDifficulty === diff
                        ? "bg-slate-800 text-white border border-slate-700"
                        : "bg-[#020617] text-slate-400 hover:text-slate-200 border border-slate-800/80"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">#ID</th>
                    <th className="py-3 px-4">Title & Slug</th>
                    <th className="py-3 px-3">Difficulty</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Submissions</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((q) => {
                      const diffColor =
                        q.difficulty === "Easy"
                          ? "text-green-400 bg-green-500/10 border-green-500/20"
                          : q.difficulty === "Medium"
                          ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                          : "text-rose-400 bg-rose-500/10 border-rose-500/20";

                      return (
                        <tr
                          key={q._id || q.questionId}
                          className="hover:bg-slate-800/30 transition group"
                        >
                          <td className="py-3.5 px-3 text-slate-400 font-bold">
                            #{q.questionId}
                          </td>
                          <td className="py-3.5 px-4 font-sans font-bold text-white">
                            <div className="flex items-center gap-2">
                              <span>{q.title}</span>
                              {q.isPremium && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 text-[10px] font-mono border border-amber-500/30">
                                  PRO
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                              /{q.slug || "slug"}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${diffColor}`}
                            >
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-sans text-slate-300">
                            {q.category || "Algorithms"}
                          </td>
                          <td className="py-3.5 px-3 text-slate-400">
                            {q.submissions ? q.submissions.toLocaleString() : "14,200"}
                          </td>
                          <td className="py-3.5 px-4 text-right font-sans">
                            <div className="flex items-center justify-end gap-2">
                              {/* Open Problem Page */}
                              <Link
                                to={`/problem/${q.questionId}`}
                                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Preview Problem"
                              >
                                <FiEye className="w-3.5 h-3.5" />
                              </Link>

                              {/* Delete Action */}
                              <button
                                onClick={() => handleDeleteQuestion(q._id || q.questionId)}
                                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                                title="Delete Question"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 font-sans">
                        No questions found matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 2: CREATE QUESTION FORM
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "create" && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiPlus className="w-5 h-5 text-green-400" />
                <span>Create & Publish New Problem</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure problem details, sample input/output, and starter code templates.
              </p>
            </div>

            <form onSubmit={handleCreateQuestionSubmit} className="space-y-6">
              {/* Row 1: ID, Title, Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Question ID
                  </label>
                  <input
                    type="text"
                    required
                    value={newQuestion.questionId}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({ ...prev, questionId: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-green-400"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Problem Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newQuestion.title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Reverse Linked List II"
                    className="w-full px-3 py-2 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-green-400"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({ ...prev, difficulty: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-green-400 capitalize"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Slug & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={newQuestion.slug}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="e.g. reverse-linked-list-ii"
                    className="w-full px-3 py-2 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category / Topic Tag
                  </label>
                  <input
                    type="text"
                    value={newQuestion.category}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({ ...prev, category: e.target.value }))
                    }
                    placeholder="e.g. Dynamic Programming, Trees, Graphs"
                    className="w-full px-3 py-2 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Problem Description (Markdown / Text)
                </label>
                <textarea
                  rows="4"
                  value={newQuestion.description}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Given the head of a singly linked list and two integers left and right..."
                  className="w-full p-3 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-green-400 leading-relaxed"
                />
              </div>

              {/* Sample Testcase Input & Expected Output */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Sample Input
                  </label>
                  <textarea
                    rows="3"
                    value={newQuestion.sampleInput}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({ ...prev, sampleInput: e.target.value }))
                    }
                    placeholder="nums = [1,2,3,4,5], target = 5"
                    className="w-full p-3 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Expected Output
                  </label>
                  <textarea
                    rows="3"
                    value={newQuestion.sampleOutput}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({ ...prev, sampleOutput: e.target.value }))
                    }
                    placeholder="[0,4]"
                    className="w-full p-3 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              {/* Python Code Template */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Python Starter Code Template
                </label>
                <textarea
                  rows="3"
                  value={newQuestion.pythonTemplate}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({ ...prev, pythonTemplate: e.target.value }))
                  }
                  className="w-full p-3 bg-[#020617] border border-slate-700 rounded-xl text-green-400 text-xs font-mono focus:outline-none focus:border-green-400"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs rounded-xl transition duration-200 shadow-md shadow-green-500/20 flex items-center gap-2 active:scale-95"
                >
                  <FiSave className="w-4 h-4" />
                  <span>Publish Question</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("questions")}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 3: USER ACCOUNTS (DEMO)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-blue-400" />
                  <span>Registered Platform Users</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage coder accounts, privileges, and verification status.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Username</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Solved</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {DEMO_USERS.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-3 font-sans font-bold text-white">
                        {u.name}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">@{u.username}</td>
                      <td className="py-3.5 px-3 text-slate-400">{u.email}</td>
                      <td className="py-3.5 px-3 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === "Admin"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-green-400 font-bold">{u.solved}</td>
                      <td className="py-3.5 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold">
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 4: SYSTEM & JUDGE STATUS (DEMO)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "system" && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FiCpu className="w-5 h-5 text-emerald-400" />
                <span>Execution Sandbox & Judge Health</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time isolation container parameters and evaluation queue metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FiActivity className="w-4 h-4 text-green-400" />
                  <span>Sandbox Environment</span>
                </h3>
                <div className="space-y-2 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Isolation Layer:</span>
                    <span>Docker / gVisor Container</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Default Memory Limit:</span>
                    <span className="text-green-400">512 MB</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">CPU Time Limit:</span>
                    <span>2.00 seconds</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Network Access:</span>
                    <span className="text-rose-400 font-bold">Disabled (Isolated)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#020617] border border-slate-800 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FiLayers className="w-4 h-4 text-blue-400" />
                  <span>Languages Installed</span>
                </h3>
                <div className="space-y-2 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Python:</span>
                    <span className="text-white">Python 3.14.0</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">C++:</span>
                    <span className="text-white">GCC 13.2 (C++20)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Java:</span>
                    <span className="text-white">OpenJDK 21.0.2</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">C:</span>
                    <span className="text-white">GCC 13.2 (C17)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
