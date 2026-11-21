import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { checkAuthUser } from "../services/api";
import {
  FiZap,
  FiPlay,
  FiTarget,
  FiSearch,
  FiX,
  FiBriefcase,
  FiAward,
} from "react-icons/fi";

// Mock problem database representing real LeetCode problems
const INITIAL_PROBLEMS = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    acceptance: "52.8%",
    category: "Array",
    tags: ["Array", "Hash Table"],
    companies: ["Google", "Meta", "Amazon", "Apple"],
    solved: true,
    frequency: "98%",
  },
  {
    id: 2,
    title: "Add Two Numbers",
    difficulty: "Medium",
    acceptance: "42.1%",
    category: "Linked List",
    tags: ["Linked List", "Math", "Recursion"],
    companies: ["Amazon", "Microsoft", "Meta"],
    solved: false,
    frequency: "85%",
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    acceptance: "35.2%",
    category: "Sliding Window",
    tags: ["Hash Table", "String", "Sliding Window"],
    companies: ["Google", "Amazon", "Microsoft", "Apple"],
    solved: true,
    frequency: "92%",
  },
  {
    id: 4,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    acceptance: "39.4%",
    category: "Binary Search",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    companies: ["Google", "Meta", "Amazon"],
    solved: false,
    frequency: "78%",
  },
  {
    id: 20,
    title: "Valid Parentheses",
    difficulty: "Easy",
    acceptance: "40.9%",
    category: "Stack",
    tags: ["String", "Stack"],
    companies: ["Meta", "Amazon", "Microsoft", "Google"],
    solved: true,
    frequency: "95%",
  },
  {
    id: 42,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    acceptance: "61.7%",
    category: "Dynamic Programming",
    tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
    companies: ["Amazon", "Google", "Meta", "Apple"],
    solved: false,
    frequency: "96%",
  },
  {
    id: 53,
    title: "Maximum Subarray",
    difficulty: "Medium",
    acceptance: "51.2%",
    category: "Dynamic Programming",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    companies: ["Amazon", "Apple", "Microsoft"],
    solved: true,
    frequency: "89%",
  },
  {
    id: 76,
    title: "Minimum Window Substring",
    difficulty: "Hard",
    acceptance: "42.5%",
    category: "Sliding Window",
    tags: ["Hash Table", "String", "Sliding Window"],
    companies: ["Meta", "Google", "Amazon"],
    solved: false,
    frequency: "81%",
  },
  {
    id: 121,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    acceptance: "54.6%",
    category: "Array",
    tags: ["Array", "Dynamic Programming"],
    companies: ["Amazon", "Meta", "Google", "Microsoft"],
    solved: true,
    frequency: "94%",
  },
  {
    id: 146,
    title: "LRU Cache",
    difficulty: "Medium",
    acceptance: "43.2%",
    category: "Design",
    tags: ["Hash Table", "Linked List", "Design", "Doubly-Linked List"],
    companies: ["Amazon", "Meta", "Google", "Apple", "Microsoft"],
    solved: false,
    frequency: "97%",
  },
  {
    id: 200,
    title: "Number of Islands",
    difficulty: "Medium",
    acceptance: "59.1%",
    category: "Graph",
    tags: ["Array", "DFS", "BFS", "Union Find"],
    companies: ["Amazon", "Google", "Meta", "Microsoft"],
    solved: false,
    frequency: "93%",
  },
  {
    id: 206,
    title: "Reverse Linked List",
    difficulty: "Easy",
    acceptance: "76.4%",
    category: "Linked List",
    tags: ["Linked List", "Recursion"],
    companies: ["Apple", "Google", "Meta", "Amazon"],
    solved: true,
    frequency: "91%",
  },
];

const CODE_SNIPPETS = {
  javascript: `// Problem 1: Two Sum
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
  python: `# Problem 1: Two Sum
def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
  cpp: `// Problem 1: Two Sum
#include <unordered_map>
#include <vector>

std::vector<int> twoSum(std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int diff = target - nums[i];
        if (seen.count(diff)) return {seen[diff], i};
        seen[nums[i]] = i;
    }
    return {};
}`,
  java: `// Problem 1: Two Sum
import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`,
};

const STUDY_PLANS = [
  {
    title: "Top Interview 150",
    desc: "Must-do list for FAANG and top-tier tech interview preparation.",
    total: 150,
    completed: 68,
    color: "from-emerald-500 to-green-600",
    badge: "Most Popular",
  },
  {
    title: "LeetCode 75",
    desc: "Ace interview coding challenges with 75 essential algorithmic problems.",
    total: 75,
    completed: 34,
    color: "from-blue-500 to-cyan-600",
    badge: "Recommended",
  },
  {
    title: "SQL 50 Mastery",
    desc: "Crack data engineering & backend SQL query challenges.",
    total: 50,
    completed: 21,
    color: "from-purple-500 to-indigo-600",
    badge: "Essential",
  },
  {
    title: "Dynamic Programming",
    desc: "Master memoization, tabulation, state transitions, and optimization.",
    total: 60,
    completed: 18,
    color: "from-amber-500 to-orange-600",
    badge: "Advanced",
  },
];

const COMPANIES = ["All", "Google", "Meta", "Amazon", "Microsoft", "Apple"];
const TOPICS = [
  "All",
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Linked List",
  "Sliding Window",
  "Binary Search",
  "Stack",
  "Graph",
];

const HomePage = () => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is already logged in via backend session cookie (/api/user/me)
  useEffect(() => {
    let isMounted = true;
    const verifyAuth = async () => {
      try {
        const { isAuthenticated, data } = await checkAuthUser();
        if (isAuthenticated && isMounted) {
          if (data?.msg && typeof data.msg === "object") {
            try {
              localStorage.setItem("user", JSON.stringify(data.msg));
            } catch {
              // ignore
            }
          }
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch (err) {
        console.error("Auth check error on HomePage:", err);
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

  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [solvedState, setSolvedState] = useState(
    () => new Set([1, 3, 20, 53, 121, 206])
  );
  const [activeCodeLang, setActiveCodeLang] = useState("python");
  const [isExecuting, setIsExecuting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const toggleSolved = (id) => {
    setSolvedState((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRunCode = () => {
    setIsExecuting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsExecuting(false);
      setTestResult({
        status: "Accepted",
        runtime: "41 ms",
        runtimePercentile: "96.4%",
        memory: "16.8 MB",
        memoryPercentile: "88.2%",
        casesPassed: "3/3",
      });
    }, 900);
  };

  const filteredProblems = useMemo(() => {
    return INITIAL_PROBLEMS.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(search.toLowerCase()) ||
        problem.id.toString().includes(search) ||
        problem.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesDifficulty =
        selectedDifficulty === "All" || problem.difficulty === selectedDifficulty;

      const matchesTopic =
        selectedTopic === "All" ||
        problem.tags.includes(selectedTopic) ||
        problem.category === selectedTopic;

      const matchesCompany =
        selectedCompany === "All" || problem.companies.includes(selectedCompany);

      return (
        matchesSearch && matchesDifficulty && matchesTopic && matchesCompany
      );
    });
  }, [search, selectedDifficulty, selectedTopic, selectedCompany]);

  const solvedCount = solvedState.size;
  const totalCount = INITIAL_PROBLEMS.length;
  const progressPercent = Math.round((solvedCount / totalCount) * 100);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-green-500/30 mb-4 animate-pulse">
          &lt;/&gt;
        </div>
        <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-green-500 selection:text-black">
      {/* ── Top Navigation Bar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#020617]/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-green-500/30 group-hover:scale-105 transition-transform">
                &lt;/&gt;
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  Code<span className="text-green-400">Forge</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
                  Practice Platform
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
              <a
                href="#problems"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition"
              >
                Problems
              </a>
              <a
                href="#study-plans"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition"
              >
                Study Plans
              </a>
              <a
                href="#features"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/60 transition"
              >
                Features
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Auth Buttons */}
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              className="text-sm font-semibold text-black bg-green-500 hover:bg-green-400 px-4 py-2 rounded-lg transition shadow-md shadow-green-500/20 active:scale-95"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-800/60">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium w-fit">
                <span className="flex h-2 w-2 rounded-full bg-green-400 animate-ping" />
                <span>Over 3,000+ Algorithmic Practice Problems Available</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Master Algorithms. <br />
                <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
                  Crush Technical Interviews.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Practice 3,000+ curated algorithmic coding questions, track your
                progress across FAANG question sets, and build the analytical muscle
                needed to land top-tier software engineering roles.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#problems"
                  className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-sm transition shadow-lg shadow-green-500/25 flex items-center gap-2 active:scale-95"
                >
                  <span>Explore Problems</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>

                <a
                  href="#daily-challenge"
                  className="px-5 py-3 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-slate-700/80 text-white font-semibold text-sm transition flex items-center gap-2"
                >
                  <FiZap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Daily Challenge</span>
                </a>

                <Link
                  to="/signup"
                  className="px-5 py-3 rounded-xl hover:text-green-400 text-slate-300 text-sm font-semibold transition"
                >
                  Create Free Account &rarr;
                </Link>
              </div>

              {/* Key Platform Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
                <div>
                  <div className="text-2xl font-black text-white">3,200+</div>
                  <div className="text-xs text-slate-400 font-medium">
                    Coding Problems
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-green-400">140+</div>
                  <div className="text-xs text-slate-400 font-medium">
                    Tech Companies
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">99.8%</div>
                  <div className="text-xs text-slate-400 font-medium">
                    Test Reliability
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-teal-400">850K+</div>
                  <div className="text-xs text-slate-400 font-medium">
                    Active Coders
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Code Playground Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition">
                {/* Code Editor Header */}
                <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="text-xs font-mono text-slate-400 ml-2">
                      solution.{activeCodeLang === "python" ? "py" : activeCodeLang === "javascript" ? "js" : activeCodeLang === "cpp" ? "cpp" : "java"}
                    </span>
                  </div>

                  {/* Language Selector */}
                  <div className="flex bg-[#020617] p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                    {["python", "javascript", "cpp", "java"].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveCodeLang(lang)}
                        className={`px-2 py-0.5 rounded capitalize transition ${
                          activeCodeLang === lang
                            ? "bg-green-500 text-black font-bold"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {lang === "javascript" ? "JS" : lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Window */}
                <div className="p-4 bg-[#0a0f1d] font-mono text-xs overflow-x-auto leading-relaxed text-slate-200 min-h-[220px]">
                  <pre>{CODE_SNIPPETS[activeCodeLang]}</pre>
                </div>

                {/* Action Bar */}
                <div className="px-4 py-3 bg-[#0f172a] border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Sample Test Case: <code className="text-green-400 font-mono">[2,7,11,15], target = 9</code>
                  </div>
                  <button
                    onClick={handleRunCode}
                    disabled={isExecuting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold text-xs transition"
                  >
                    {isExecuting ? (
                      <>
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-black border-t-transparent rounded-full" />
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <FiPlay className="w-3 h-3 text-black fill-black" />
                        <span>Run Code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Test Result Drawer */}
                {testResult && (
                  <div className="px-4 py-3 bg-emerald-950/40 border-t border-emerald-500/30 text-xs font-mono animate-fadeIn">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-green-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                        {testResult.status} ({testResult.casesPassed} Passed)
                      </span>
                      <span className="text-[11px] text-slate-400">All Tests Green</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        Runtime: <span className="text-white font-semibold">{testResult.runtime}</span> (Beats {testResult.runtimePercentile})
                      </div>
                      <div>
                        Memory: <span className="text-white font-semibold">{testResult.memory}</span> (Beats {testResult.memoryPercentile})
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Daily Challenge Spotlight ───────────────────────────────────────── */}
      <section id="daily-challenge" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 border border-green-500/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-green-500/5 -skew-x-12 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <FiTarget className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                    Daily Problem Challenge
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                    Hard
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Acceptance: 61.7%
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white hover:text-green-400 transition cursor-pointer">
                  42. Trapping Rain Water
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Given n non-negative integers representing an elevation map
                  where width of each bar is 1, compute how much water it can
                  trap after raining.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Two Pointers
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Dynamic Programming
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Monotonic Stack
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
              <div className="text-right hidden sm:block">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Ends In
                </div>
                <div className="text-sm font-mono font-bold text-slate-200">
                  08h 24m 15s
                </div>
              </div>
              <a
                href="#problems"
                onClick={() => {
                  setSearch("Trapping Rain Water");
                }}
                className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-sm transition shadow-lg shadow-green-500/20"
              >
                Solve Challenge
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Study Plans Section ─────────────────────────────────────────────── */}
      <section id="study-plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-green-400 mb-1">
              Curated Roadmaps
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Structured Interview Preparation
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Follow targeted study roadmaps tested by thousands of candidates hired at FAANG.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Personal Progress: <span className="text-green-400 font-bold">{progressPercent}%</span> of featured tasks
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STUDY_PLANS.map((plan, i) => {
            const planPercent = Math.round((plan.completed / plan.total) * 100);
            return (
              <div
                key={i}
                className="bg-[#0f172a] hover:bg-[#131d36] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group hover:-translate-y-1 shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {plan.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {plan.completed}/{plan.total} Solved
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white group-hover:text-green-400 transition">
                    {plan.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {plan.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-green-400 font-mono font-bold">
                      {planPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${plan.color} rounded-full transition-all duration-500`}
                      style={{ width: `${planPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Problem Repository / Interactive Explorer ───────────────────────── */}
      <section id="problems" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span>Problem Practice Set</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-green-400 border border-slate-700">
                  {filteredProblems.length} Available
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Filter by question difficulty, tech stack topic, or specific hiring company.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <input
                type="text"
                placeholder="Search by title, number, or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#020617] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
              />
              <FiSearch className="absolute left-3 top-3 text-slate-500 w-3.5 h-3.5" />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="py-4 space-y-4">
            {/* Difficulty Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 bg-[#020617] p-1 rounded-xl border border-slate-800">
                {["All", "Easy", "Medium", "Hard"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
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

              {/* Company Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  Company:
                </span>
                {COMPANIES.map((company) => (
                  <button
                    key={company}
                    onClick={() => setSelectedCompany(company)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
                      selectedCompany === company
                        ? "bg-green-500/10 text-green-400 border-green-500/40"
                        : "bg-[#020617] text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-medium mr-1 whitespace-nowrap">
                Topics:
              </span>
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap transition ${
                    selectedTopic === topic
                      ? "bg-slate-700 text-white font-semibold"
                      : "bg-[#020617] text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Problem Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 mt-2">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#020617] text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4 w-28">Difficulty</th>
                  <th className="py-3 px-4 w-28">Acceptance</th>
                  <th className="py-3 px-4 hidden md:table-cell">Companies</th>
                  <th className="py-3 px-4 w-24 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      No problems found matching your active filters.
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            setSearch("");
                            setSelectedDifficulty("All");
                            setSelectedTopic("All");
                            setSelectedCompany("All");
                          }}
                          className="text-xs text-green-400 hover:underline font-semibold"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((prob) => {
                    const isSolved = solvedState.has(prob.id);
                    return (
                      <tr
                        key={prob.id}
                        className="hover:bg-slate-800/40 transition group"
                      >
                        {/* Solved toggle checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            title={isSolved ? "Mark as unsolved" : "Mark as solved"}
                            onClick={() => toggleSolved(prob.id)}
                            className={`w-5 h-5 rounded flex items-center justify-center transition border ${
                              isSolved
                                ? "bg-green-500 border-green-500 text-black"
                                : "border-slate-700 hover:border-slate-500 bg-[#020617]"
                            }`}
                          >
                            {isSolved && (
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </button>
                        </td>

                        {/* Title and tags */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white group-hover:text-green-400 transition cursor-pointer">
                              {prob.id}. {prob.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {prob.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Difficulty badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                              prob.difficulty === "Easy"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : prob.difficulty === "Medium"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </td>

                        {/* Acceptance rate */}
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                          {prob.acceptance}
                        </td>

                        {/* Company badges */}
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <div className="flex items-center gap-1 flex-wrap">
                            {prob.companies.slice(0, 3).map((comp) => (
                              <span
                                key={comp}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-[#020617] text-slate-300 border border-slate-800"
                              >
                                {comp}
                              </span>
                            ))}
                            {prob.companies.length > 3 && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                +{prob.companies.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Solve action */}
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to="/login"
                            className="inline-block px-3 py-1 rounded-lg bg-slate-800 group-hover:bg-green-500 group-hover:text-black text-xs font-semibold text-slate-200 transition"
                          >
                            Solve
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-slate-400">
            <div>
              Solved <span className="text-white font-bold">{solvedCount}</span> of{" "}
              <span className="text-white font-bold">{totalCount}</span> questions
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
              <span>Auto-saved locally</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights Grid ─────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-green-400">
            Platform Capabilities
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            Engineered For Interview Success
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Every tool you need to transition from syntax confusion to confident algorithmic problem-solving.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl hover:border-green-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-4">
              <FiZap className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Sub-Millisecond Code Runner
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Execute solutions against thousands of edge test cases across C++,
              Python, Java, TypeScript, Go, and Rust with detailed memory and runtime profiling.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl hover:border-green-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4">
              <FiBriefcase className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Company-Verified Question Banks
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Target questions frequently asked in the past 30 days at Google,
              Meta, Amazon, Netflix, and Apple with verified frequency metrics.
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl hover:border-green-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <FiAward className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Automated Code Evaluation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Run your solutions against verified test cases with real-time runtime,
              memory metrics, and instant verdict analysis.
            </p>
          </div>
        </div>
      </section>

      {/* ── Ready to Level Up CTA Banner ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-emerald-950 via-[#0f172a] to-slate-900 border border-green-500/40 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Ready to Conquer Your Next Interview?
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Join thousands of engineers practicing daily. Get access to detailed
              editorial solutions, video explanations, and live mock interviews.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-3.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-extrabold text-sm transition shadow-lg shadow-green-500/30 active:scale-95"
              >
                Get Started for Free
              </Link>
              <Link
                to="/login"
                className="px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm transition"
              >
                Sign In to Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 bg-[#020617] text-slate-400 text-xs py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-black font-black text-sm">
              &lt;/&gt;
            </div>
            <span className="font-bold text-white text-sm">
              CodeForge Platform
            </span>
            <span className="text-slate-600">|</span>
            <span>Empowering software engineers worldwide</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#problems" className="hover:text-white transition">
              Problems
            </a>
            <a href="#study-plans" className="hover:text-white transition">
              Roadmaps
            </a>
            <Link to="/login" className="hover:text-white transition">
              Login
            </Link>
            <Link to="/signup" className="hover:text-white transition">
              Register
            </Link>
          </div>

          <div className="text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} CodeForge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
