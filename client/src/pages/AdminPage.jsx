import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  getAllQuestions,
  logoutUser,
  loginUser,
  checkAuthAdmin,
  createQuestion,
  deleteQuestion,
  createTestCase,
  createCodeTemplate,
  createAdminUser,
  dismissAdminUser,
} from "../services/api";
import {
  FiShield,
  FiDatabase,
  FiPlus,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertTriangle,
  FiSearch,
  FiUsers,
  FiCpu,
  FiActivity,
  FiCode,
  FiLayers,
  FiArrowLeft,
  FiSave,
  FiRefreshCw,
  FiUserCheck,
  FiUserX,
  FiMail,
  FiLock,
} from "react-icons/fi";

const AdminPage = () => {
  const navigate = useNavigate();

  // Authentication State
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Admin Login Form State (Shown when not authenticated as admin)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Active Console Tab: "questions" | "create" | "admins" | "system"
  const [activeTab, setActiveTab] = useState("questions");

  // Questions State (Empty initial state - loads from real API)
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // Admin Management Form State
  const [adminTargetEmail, setAdminTargetEmail] = useState("");
  const [isAdminActionLoading, setIsAdminActionLoading] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3200);
  };

  // Verify Admin Authentication on Mount via /api/admin/admincheck (with fallback)
  const verifyAdmin = useCallback(async () => {
    setIsCheckingAuth(true);
    try {
      const res = await checkAuthAdmin();
      if (res.isAdmin) {
        setIsAdminVerified(true);
        let storedUser = null;
        try {
          storedUser = JSON.parse(localStorage.getItem("user") || "null");
        } catch {
          storedUser = null;
        }
        setCurrentUser(storedUser || res.data);
      } else {
        setIsAdminVerified(false);
        setCurrentUser(null);
      }
    } catch {
      setIsAdminVerified(false);
      setCurrentUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    verifyAdmin();
  }, [verifyAdmin]);

  // Fetch real questions from backend when verified
  const fetchQuestionsList = useCallback(async () => {
    setIsLoadingQuestions(true);
    setFetchError(null);
    try {
      const res = await getAllQuestions();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.questions)
        ? res.questions
        : [];
      setQuestions(list);
    } catch (err) {
      console.error("Failed to load questions from backend:", err);
      setFetchError(err.message || "Failed to fetch question bank");
      setQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, []);

  useEffect(() => {
    if (isAdminVerified) {
      fetchQuestionsList();
    }
  }, [isAdminVerified, fetchQuestionsList]);

  // Handle Admin Portal Login Submit (No Sign-Up)
  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Please enter both email and password.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await loginUser(loginEmail.trim(), loginPassword);
      if (res?.success) {
        const userObj = res.msg;
        if (userObj) {
          localStorage.setItem("user", JSON.stringify(userObj));
        }

        const role = (userObj?.role || "").toLowerCase();
        if (role !== "admin" && role !== "owner") {
          setLoginError(
            `Access Denied: Account '${loginEmail}' has role '${role}'. Only administrators or owners may access this portal.`
          );
          setIsLoggingIn(false);
          return;
        }

        // Verify admin status
        const adminCheck = await checkAuthAdmin();
        if (adminCheck.isAdmin) {
          setIsAdminVerified(true);
          setCurrentUser(userObj);
          showToast(`Welcome back, ${userObj?.name || "Admin"}!`);
        } else {
          setLoginError("Administrative check failed. Please check your credentials.");
        }
      } else {
        setLoginError(res?.msg || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setLoginError(err.message || "Failed to sign in to admin console.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const titleMatch = (q.title || "").toLowerCase().includes(searchQuery.toLowerCase());
      const slugMatch = (q.slug || "").toLowerCase().includes(searchQuery.toLowerCase());
      const idMatch = String(q.questionId || "").includes(searchQuery);
      const matchesSearch = titleMatch || slugMatch || idMatch;

      const matchesDiff =
        selectedDifficulty === "All" ||
        (q.difficulty || "").toLowerCase() === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesDiff;
    });
  }, [questions, searchQuery, selectedDifficulty]);

  // Real Dashboard Metric Counters
  const easyCount = questions.filter((q) => q.difficulty?.toLowerCase() === "easy").length;
  const mediumCount = questions.filter((q) => q.difficulty?.toLowerCase() === "medium").length;
  const hardCount = questions.filter((q) => q.difficulty?.toLowerCase() === "hard").length;
  const premiumCount = questions.filter((q) => q.isPremium).length;

  // Form State for "Create Question"
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
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
    pythonTemplate: "class Solution:\n    def solve(self, nums, target):\n        pass",
    cppTemplate: "class Solution {\npublic:\n    vector<int> solve(vector<int>& nums, int target) {\n        \n    }\n};",
    javaTemplate: "class Solution {\n    public int[] solve(int[] nums, int target) {\n        return new int[]{};\n    }\n}",
    cTemplate: "int* solve(int* nums, int numsSize, int target, int* returnSize) {\n    \n}",
  });

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

  const handleCreateQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.title.trim()) {
      showToast("Please provide a question title", "error");
      return;
    }

    setIsSubmittingQuestion(true);
    try {
      const generatedSlug =
        newQuestion.slug?.trim() ||
        newQuestion.title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-");

      const questionPayload = {
        title: newQuestion.title.trim(),
        slug: generatedSlug,
        description: newQuestion.description?.trim() || "No description provided.",
        difficulty: newQuestion.difficulty || "Easy",
        topics: [newQuestion.category?.trim() || "Array"],
        constraints: newQuestion.constraints
          ? newQuestion.constraints.split("\n").map((c) => c.trim()).filter(Boolean)
          : [],
        isPremium: Boolean(newQuestion.isPremium),
      };

      const res = await createQuestion(questionPayload);
      const createdQues = res?.data || res;
      const assignedId = createdQues?.questionId;

      if (assignedId && (newQuestion.sampleInput || newQuestion.sampleOutput)) {
        try {
          await createTestCase({
            questionId: assignedId,
            questionSlug: createdQues?.slug || generatedSlug,
            input: newQuestion.sampleInput?.trim() || "sample input",
            expectedOutput: newQuestion.sampleOutput?.trim() || "sample output",
            explanation: newQuestion.explanation?.trim() || "",
            isSample: true,
            isHidden: false,
          });
        } catch (tcErr) {
          console.warn("Testcase creation error:", tcErr);
        }
      }

      if (
        assignedId &&
        (newQuestion.pythonTemplate ||
          newQuestion.cppTemplate ||
          newQuestion.javaTemplate ||
          newQuestion.cTemplate)
      ) {
        try {
          await createCodeTemplate(assignedId, {
            questionId: assignedId,
            python: newQuestion.pythonTemplate || "",
            cpp: newQuestion.cppTemplate || "",
            java: newQuestion.javaTemplate || "",
            C: newQuestion.cTemplate || newQuestion.cppTemplate || "",
          });
        } catch (tplErr) {
          console.warn("Template creation error:", tplErr);
        }
      }

      showToast(`Question #${assignedId || ""} "${newQuestion.title}" created successfully!`);
      await fetchQuestionsList();

      setNewQuestion({
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
        pythonTemplate: "class Solution:\n    def solve(self, nums, target):\n        pass",
        cppTemplate: "class Solution {\npublic:\n    vector<int> solve(vector<int>& nums, int target) {\n        \n    }\n};",
        javaTemplate: "class Solution {\n    public int[] solve(int[] nums, int target) {\n        return new int[]{};\n    }\n}",
        cTemplate: "int* solve(int* nums, int numsSize, int target, int* returnSize) {\n    \n}",
      });

      setActiveTab("questions");
    } catch (err) {
      console.error("Create question error:", err);
      showToast(err.message || "Failed to create question on server", "error");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (targetQues) => {
    const slugToDelete = targetQues?.slug;
    if (!slugToDelete) {
      showToast("Cannot delete: question slug is missing", "error");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${targetQues.title || slugToDelete}"?`)) {
      return;
    }

    try {
      await deleteQuestion(slugToDelete);
      showToast(`Question "${targetQues.title || slugToDelete}" deleted successfully.`);
      await fetchQuestionsList();
    } catch (err) {
      console.error("Delete question error:", err);
      showToast(err.message || "Failed to delete question from backend", "error");
    }
  };

  // Promote User to Admin
  const handlePromoteAdmin = async (e) => {
    e.preventDefault();
    if (!adminTargetEmail.trim()) {
      showToast("Please enter an email address", "error");
      return;
    }

    setIsAdminActionLoading(true);
    try {
      const res = await createAdminUser(adminTargetEmail.trim());
      showToast(res?.msg || `User ${adminTargetEmail} promoted to Admin successfully!`);
      setAdminTargetEmail("");
    } catch (err) {
      showToast(err.message || "Failed to promote user to Admin", "error");
    } finally {
      setIsAdminActionLoading(false);
    }
  };

  // Dismiss Admin to User
  const handleDismissAdmin = async () => {
    if (!adminTargetEmail.trim()) {
      showToast("Please enter the email address of the admin to dismiss", "error");
      return;
    }

    if (!window.confirm(`Dismiss ${adminTargetEmail} from Admin role back to regular User?`)) {
      return;
    }

    setIsAdminActionLoading(true);
    try {
      const res = await dismissAdminUser(adminTargetEmail.trim());
      showToast(res?.msg || `Admin ${adminTargetEmail} revoked back to User.`);
      setAdminTargetEmail("");
    } catch (err) {
      showToast(err.message || "Failed to revoke admin privileges", "error");
    } finally {
      setIsAdminActionLoading(false);
    }
  };

  // Logout Handler
  const handleAdminLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    } finally {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.clear();
      } catch {
        // ignore
      }
      setIsAdminVerified(false);
      setCurrentUser(null);
    }
  };

  // Loading Screen while verifying admin session
  if (isCheckingAuth) {
    return (
      <div className="bg-[#020617] min-h-screen flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-green-500/30 mb-4 animate-pulse">
          &lt;/&gt;
        </div>
        <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-mono tracking-wide">
          Verifying administrative credentials...
        </p>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ADMIN LOGIN VIEW (SAME LIKE USER LOGIN, NO SIGN UP OPTIONS)
  // ════════════════════════════════════════════════════════════════════════════
  if (!isAdminVerified) {
    return (
      <div className="bg-[#020617] min-h-screen flex flex-col justify-center items-center px-4 py-12 selection:bg-green-500 selection:text-black relative">
        {/* Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        {/* Brand Header */}
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-green-500/30 group-hover:scale-105 transition-transform">
              &lt;/&gt;
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Code<span className="text-green-400">Forge</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <FiShield className="w-3 h-3" />
                <span>Admin</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Admin Login Card */}
        <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-8 sm:p-9 shadow-2xl shadow-black/50">
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span>Admin Portal Sign In</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              Enter your administrative credentials to access the console
            </p>
          </div>

          {/* Error Alert */}
          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
              <FiAlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLoginSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@codeforge.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
                <FiMail className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
                <FiLock className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Admin Credentials...</span>
                </>
              ) : (
                <>
                  <FiShield className="w-4 h-4" />
                  <span>Sign In to Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Footer - No Sign-Up Option, Only Back to Home */}
          <div className="mt-7 pt-6 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500">
              Admin accounts are provisioned exclusively by platform owners. Public sign-up is not available.
            </p>
            <div className="mt-4">
              <Link
                to="/"
                className="text-xs text-slate-400 hover:text-slate-200 transition inline-flex items-center gap-1.5"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VERIFIED ADMIN CONSOLE DASHBOARD
  // ════════════════════════════════════════════════════════════════════════════
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
              <span>Problems</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 font-black text-xs flex items-center justify-center">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-white">
                  {currentUser?.name || "Admin"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentUser?.email || "admin@codeforge.io"}
                </span>
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

      {/* ── Main Dashboard Body ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Admin Console</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live management of questions, test cases, code templates, and administrative roles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchQuestionsList}
              disabled={isLoadingQuestions}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-xs flex items-center gap-1.5 border border-slate-700"
              title="Refresh Question Bank"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${isLoadingQuestions ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setActiveTab("create")}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs rounded-xl transition duration-200 shadow-lg shadow-green-500/20 flex items-center gap-2 active:scale-95"
            >
              <FiPlus className="w-4 h-4 stroke-[3]" />
              <span>Create Question</span>
            </button>
          </div>
        </div>

        {/* ── Live Metric Summary Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Questions</span>
              <FiDatabase className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{questions.length}</div>
            <div className="mt-2 text-[11px] text-slate-400">
              In active database repository
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Easy Difficulty</span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="text-2xl font-black text-green-400 font-mono">{easyCount}</div>
            <p className="mt-2 text-[11px] text-slate-400">
              {questions.length > 0 ? `${Math.round((easyCount / questions.length) * 100)}% of total` : "0%"}
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Medium Difficulty</span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            </div>
            <div className="text-2xl font-black text-yellow-400 font-mono">{mediumCount}</div>
            <p className="mt-2 text-[11px] text-slate-400">
              {questions.length > 0 ? `${Math.round((mediumCount / questions.length) * 100)}% of total` : "0%"}
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Hard Difficulty</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">{hardCount}</div>
            <p className="mt-2 text-[11px] text-slate-400">
              {premiumCount > 0 ? `${premiumCount} Premium marked` : "0 Premium"}
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
            <span>Questions List ({questions.length})</span>
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
            onClick={() => setActiveTab("admins")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === "admins"
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <FiShield className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Roles</span>
          </button>

          <button
            onClick={() => setActiveTab("system")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === "system"
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <FiCpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Judge & System</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 1: QUESTION REPOSITORY
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "questions" && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions by title, slug, or ID..."
                  className="w-full pl-10 pr-4 py-2 bg-[#020617] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-green-400 transition"
                />
              </div>

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

            {fetchError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
                <span>{fetchError}</span>
                <button
                  onClick={fetchQuestionsList}
                  className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded text-rose-200 font-semibold"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">#ID</th>
                    <th className="py-3 px-4">Title & Slug</th>
                    <th className="py-3 px-3">Difficulty</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {isLoadingQuestions ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400 font-mono">
                        <div className="w-6 h-6 border-2 border-slate-700 border-t-green-400 rounded-full animate-spin mx-auto mb-2" />
                        Loading questions from database...
                      </td>
                    </tr>
                  ) : filteredQuestions.length > 0 ? (
                    filteredQuestions.map((q) => {
                      const diff = (q.difficulty || "Easy").toLowerCase();
                      const diffColor =
                        diff === "easy"
                          ? "text-green-400 bg-green-500/10 border-green-500/20"
                          : diff === "medium"
                          ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                          : "text-rose-400 bg-rose-500/10 border-rose-500/20";

                      const qKey = q._id || q.questionId;
                      const qDisplayId = q.questionId || q._id;

                      return (
                        <tr
                          key={qKey}
                          className="hover:bg-slate-800/30 transition group"
                        >
                          <td className="py-3.5 px-3 text-slate-400 font-mono font-bold">
                            #{qDisplayId}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            <div className="flex items-center gap-2">
                              <span>{q.title}</span>
                              {q.isPremium && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 text-[10px] font-mono border border-amber-500/30">
                                  PRO
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                              /{q.slug || "no-slug"}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold capitalize ${diffColor}`}
                            >
                              {q.difficulty || "Easy"}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-400 font-mono">
                            {q.isPremium ? (
                              <span className="text-amber-400">Premium</span>
                            ) : (
                              <span className="text-slate-400">Free</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/problem/${q.questionId || q._id}`}
                                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Preview Problem in Code Editor"
                              >
                                <FiEye className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                onClick={() => handleDeleteQuestion(q)}
                                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                                title="Delete Question from Database"
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
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        <FiDatabase className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-sm font-semibold">No questions found</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {searchQuery
                            ? "Try adjusting your search query."
                            : "The question repository is empty. Create your first problem!"}
                        </p>
                        <button
                          onClick={() => setActiveTab("create")}
                          className="mt-3 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold rounded-lg transition"
                        >
                          + Create Question
                        </button>
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
                Creates the question, sample test case, and starter code templates directly in your database.
              </p>
            </div>

            <form onSubmit={handleCreateQuestionSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Problem Title <span className="text-rose-400">*</span>
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

                <div className="sm:col-span-3">
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

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tier Access
                  </label>
                  <select
                    value={newQuestion.isPremium ? "true" : "false"}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({ ...prev, isPremium: e.target.value === "true" }))
                    }
                    className="w-full px-3 py-2 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-green-400"
                  >
                    <option value="false">Free Access</option>
                    <option value="true">Premium Only</option>
                  </select>
                </div>
              </div>

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
                    Category / Topic
                  </label>
                  <input
                    type="text"
                    value={newQuestion.category}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({ ...prev, category: e.target.value }))
                    }
                    placeholder="e.g. Array, Dynamic Programming, Tree"
                    className="w-full px-3 py-2 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Problem Description
                </label>
                <textarea
                  rows="4"
                  value={newQuestion.description}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
                  className="w-full p-3 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-green-400 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Constraints (one per line)
                </label>
                <textarea
                  rows="2"
                  value={newQuestion.constraints}
                  onChange={(e) =>
                    setNewQuestion((prev) => ({ ...prev, constraints: e.target.value }))
                  }
                  placeholder="2 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9"
                  className="w-full p-3 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-green-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Sample Testcase Input
                  </label>
                  <textarea
                    rows="3"
                    value={newQuestion.sampleInput}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({ ...prev, sampleInput: e.target.value }))
                    }
                    placeholder="nums = [2,7,11,15], target = 9"
                    className="w-full p-3 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Sample Expected Output
                  </label>
                  <textarea
                    rows="3"
                    value={newQuestion.sampleOutput}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({ ...prev, sampleOutput: e.target.value }))
                    }
                    placeholder="[0,1]"
                    className="w-full p-3 bg-[#020617] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FiCode className="w-4 h-4 text-green-400" />
                  <span>Starter Code Templates</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-mono">
                      Python 3 Template
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

                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-mono">
                      C++ Template
                    </label>
                    <textarea
                      rows="3"
                      value={newQuestion.cppTemplate}
                      onChange={(e) =>
                        setNewQuestion((prev) => ({ ...prev, cppTemplate: e.target.value }))
                      }
                      className="w-full p-3 bg-[#020617] border border-slate-700 rounded-xl text-green-400 text-xs font-mono focus:outline-none focus:border-green-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isSubmittingQuestion}
                  className="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs rounded-xl transition duration-200 shadow-md shadow-green-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingQuestion ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiSave className="w-4 h-4" />
                  )}
                  <span>{isSubmittingQuestion ? "Saving to Backend..." : "Publish Question"}</span>
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
            TAB 3: ADMIN ROLES & PRIVILEGES (CONNECTED TO BACKEND API)
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "admins" && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiShield className="w-5 h-5 text-amber-400" />
                <span>Admin Privileges Management</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Promote registered users to Admin role or revoke administrative privileges via the backend API.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <form onSubmit={handlePromoteAdmin} className="space-y-4 bg-[#020617] p-5 rounded-2xl border border-slate-800">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Target User Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={adminTargetEmail}
                    onChange={(e) => setAdminTargetEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-green-400"
                  />

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isAdminActionLoading}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
                    >
                      <FiUserCheck className="w-4 h-4" />
                      <span>Promote to Admin</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDismissAdmin}
                      disabled={isAdminActionLoading}
                      className="px-4 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 font-bold text-xs rounded-xl transition border border-slate-700/80 hover:border-rose-500/30 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <FiUserX className="w-4 h-4" />
                      <span>Revoke Admin Role</span>
                    </button>
                  </div>
                </form>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
                  <p className="font-semibold text-slate-300">How Role Management Works:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                    <li>Promoting a user calls <code className="text-amber-400 font-mono">POST /api/admin/createAdmin</code> in the server.</li>
                    <li>Revoking an admin calls <code className="text-amber-400 font-mono">POST /api/admin/dismissAdmin</code>.</li>
                    <li>Only accounts with the <code className="text-amber-400 font-mono">owner</code> role can promote or dismiss administrators.</li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#020617] p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FiUsers className="w-4 h-4 text-blue-400" />
                  <span>Current Active Session</span>
                </h3>
                <div className="space-y-2 text-xs text-slate-400 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">Name:</span>
                    <span className="text-white font-bold">{currentUser?.name || "Administrator"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-300">{currentUser?.email || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-500">Current Role:</span>
                    <span className="text-amber-400 font-bold uppercase">{currentUser?.role || "Admin"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Access Level:</span>
                    <span className="text-green-400">Full Console Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 4: SYSTEM & JUDGE INTEGRATION
           ════════════════════════════════════════════════════════════════════ */}
        {activeTab === "system" && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FiCpu className="w-5 h-5 text-emerald-400" />
                <span>Code Execution & Judge Architecture</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time configuration of the OnlineCompiler service and language judge runtimes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-[#020617] border border-slate-800 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FiActivity className="w-4 h-4 text-green-400" />
                  <span>Execution Backend Engine</span>
                </h3>
                <div className="space-y-2.5 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Compiler Engine:</span>
                    <span className="text-green-400">OnlineCompiler API</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Judge Route:</span>
                    <span className="text-slate-300">/api/user/qs/submitques</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Live Test Run:</span>
                    <span className="text-slate-300">/api/user/qs/runques</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Evaluation:</span>
                    <span className="text-emerald-400 font-bold">Asynchronous Judging</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-[#020617] border border-slate-800 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FiLayers className="w-4 h-4 text-blue-400" />
                  <span>Active Language Compilers</span>
                </h3>
                <div className="space-y-2.5 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Python:</span>
                    <span className="text-white">python</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">C++:</span>
                    <span className="text-white">cpp</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Java:</span>
                    <span className="text-white">java</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">C:</span>
                    <span className="text-white">c</span>
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
