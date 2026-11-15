import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { getOneQuestion } from "../services/api";
import {
  FiFileText,
  FiClock,
  FiCode,
  FiAlertTriangle,
  FiLock,
  FiRotateCcw,
  FiCheckCircle,
  FiPlay,
  FiCheck,
  FiHome,
  FiBarChart2,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiAward,
} from "react-icons/fi";

const STARTER_CODE_TEMPLATES = {
  javascript: `/**
 * @param {any} input
 * @return {any}
 */
var solve = function(input) {
    // Write your code solution here
    
};`,
  python: `class Solution:
    def solve(self, input):
        # Write your code solution here
        pass`,
  cpp: `#include <iostream>
#include <vector>

class Solution {
public:
    void solve() {
        // Write your code solution here
    }
};`,
  java: `class Solution {
    public void solve() {
        // Write your code solution here
    }
}`,
};

const ProblemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // User State
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Question Data State
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Editor State
  const [selectedLang, setSelectedLang] = useState("javascript");
  const [code, setCode] = useState(STARTER_CODE_TEMPLATES.javascript);
  const [activeTab, setActiveTab] = useState("description"); // description, solutions, submissions
  const [activeBottomTab, setActiveBottomTab] = useState("testcase"); // testcase, result
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(true);

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);

  // Timer State
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Load User from storage
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

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Fetch question details
  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;
      setIsLoading(true);
      setError("");
      setExecutionResult(null);

      try {
        const response = await getOneQuestion(id);
        const data =
          response?.data || response?.question || response?.msg || response;

        if (data) {
          setQuestion(data);
          if (data.starterCode) {
            setCode(
              typeof data.starterCode === "string"
                ? data.starterCode
                : data.starterCode[selectedLang] ||
                    STARTER_CODE_TEMPLATES[selectedLang]
            );
          }
        } else {
          setError(`Question #${id} data not found.`);
        }
      } catch (err) {
        console.error("Error loading question:", err);
        setError(err.message || `Unable to load question #${id}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  // Language switch
  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    if (!question?.starterCode || typeof question.starterCode !== "object") {
      setCode(STARTER_CODE_TEMPLATES[lang] || "");
    } else {
      setCode(
        question.starterCode[lang] || STARTER_CODE_TEMPLATES[lang] || ""
      );
    }
  };

  // Tab key indent in textarea
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
    // Ctrl + Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunCode();
    }
  };

  // Run code
  const handleRunCode = () => {
    setIsRunning(true);
    setIsConsoleExpanded(true);
    setActiveBottomTab("result");
    setExecutionResult(null);

    setTimeout(() => {
      setIsRunning(false);
      setExecutionResult({
        status: "Accepted",
        runtime: "45 ms",
        memory: "16.1 MB",
        casesPassed: "3/3 Testcases Passed",
        details: [
          { input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", actual: "[0,1]" },
          { input: "nums = [3,2,4], target = 6", expected: "[1,2]", actual: "[1,2]" },
          { input: "nums = [3,3], target = 6", expected: "[0,1]", actual: "[0,1]" },
        ],
      });
    }, 750);
  };

  // Submit code
  const handleSubmitCode = () => {
    setIsSubmitting(true);
    setIsConsoleExpanded(true);
    setActiveBottomTab("result");
    setExecutionResult(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setExecutionResult({
        status: "Accepted",
        isSubmission: true,
        runtime: "41 ms",
        runtimePercentile: "97.2%",
        memory: "16.3 MB",
        memoryPercentile: "89.5%",
        casesPassed: "58/58 Testcases Passed",
      });

      // Mark question as solved in localStorage
      try {
        const saved = localStorage.getItem("solved_question_ids");
        const list = saved ? JSON.parse(saved) : [];
        const questionKey = question?._id || question?.questionId || id;
        if (!list.includes(questionKey)) {
          list.push(questionKey);
          localStorage.setItem("solved_question_ids", JSON.stringify(list));
        }
      } catch {
        // ignore
      }
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/logout");
  };

  return (
    <div className="h-screen w-screen bg-[#020617] text-slate-100 font-sans flex flex-col overflow-hidden selection:bg-green-500 selection:text-black">
      {/* ── Top Header Bar ──────────────────────────────────────────────────── */}
      <header className="h-12 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between px-3 shrink-0 z-30 select-none">
        {/* Left Section: Logo, Problem List, Question Navigation */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 group hover:opacity-90 transition pr-2"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-black font-black text-sm shadow-md shadow-green-500/20">
              &lt;/&gt;
            </div>
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline-block">
              Code<span className="text-green-400">Forge</span>
            </span>
          </Link>

          <span className="text-slate-700">|</span>

          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800/80 transition"
          >
            <FiFileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Problem List</span>
          </Link>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-0.5 bg-[#020617] border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => {
                const prevId = Math.max(1, parseInt(id) - 1);
                navigate(`/problem/${prevId}`);
              }}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition"
              title="Previous Question"
            >
              <FiChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-xs font-mono px-1.5 text-slate-300 font-semibold">
              #{question?.questionId || id}
            </span>
            <button
              onClick={() => {
                const nextId = (parseInt(id) || 1) + 1;
                navigate(`/problem/${nextId}`);
              }}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition"
              title="Next Question"
            >
              <FiChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Center Section: Run & Submit Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition active:scale-95 disabled:opacity-50 border border-slate-700/60"
            title="Run Code (Ctrl + Enter)"
          >
            {isRunning ? (
              <span className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiPlay className="text-green-400 text-xs fill-green-400" />
            )}
            <span>Run</span>
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-green-500 hover:bg-green-400 text-black text-xs font-black transition shadow-md shadow-green-500/20 active:scale-95 disabled:opacity-50"
            title="Submit Solution"
          >
            {isSubmitting ? (
              <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiCheck className="stroke-[3] w-3.5 h-3.5" />
            )}
            <span>Submit</span>
          </button>
        </div>

        {/* Right Section: Timer & User Profile */}
        <div className="flex items-center gap-3">
          {/* Stopwatch */}
          <div
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-[#020617] px-2.5 py-1 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700 transition"
            title="Click to pause or resume timer"
          >
            <FiClock className="w-3 h-3 text-slate-400" />
            <span>{formatTimer(seconds)}</span>
          </div>

          {/* User Profile Pill with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full bg-[#020617] hover:bg-slate-800/80 border border-slate-800 transition text-left"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 text-black font-black text-xs flex items-center justify-center shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline-block max-w-[100px] truncate pr-1">
                {user?.name || user?.email?.split("@")[0] || "Profile"}
              </span>
              <FiChevronDown className="text-slate-500 w-3 h-3 pr-0.5" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl py-2 z-50 text-xs">
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="font-bold text-white text-sm truncate">
                    {user?.name || "CodeForge User"}
                  </p>
                  <p className="text-slate-400 text-[11px] truncate mt-0.5">
                    {user?.email || "No email available"}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-semibold text-[10px] uppercase">
                    {user?.role || "Coder"}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <FiBarChart2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dashboard & Progress</span>
                  </Link>
                  <Link
                    to="/"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <FiHome className="w-3.5 h-3.5 text-slate-400" />
                    <span>Platform Home</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition text-left font-semibold"
                  >
                    <FiLogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Locked Viewport Split-Pane Workspace ──────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 gap-2 bg-[#020617]">
        {/* ══════════════════════════════════════════════════════════════════
            LEFT PANEL: PROBLEM DESCRIPTION & SPECS
           ══════════════════════════════════════════════════════════════════ */}
        <section className="lg:w-[46%] xl:w-[44%] h-full flex flex-col rounded-xl border border-slate-800 bg-[#0f172a] overflow-hidden">
          {/* Tabs Bar */}
          <div className="h-10 bg-[#0a0f1d] border-b border-slate-800 flex items-center px-3 gap-1 shrink-0 text-xs font-semibold select-none">
            {[
              { id: "description", label: "Description", Icon: FiFileText },
              { id: "solutions", label: "Solutions", Icon: FiCode },
              { id: "submissions", label: "Submissions", Icon: FiClock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeTab === tab.id
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <tab.Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Left Panel Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {isLoading ? (
              <div className="py-24 text-center">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-medium">
                  Loading problem specifications from server...
                </p>
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xl flex items-center justify-center mx-auto mb-3">
                  <FiAlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Could not load question
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
                  {error}
                </p>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-white transition"
                >
                  Return to Dashboard
                </Link>
              </div>
            ) : question ? (
              <div>
                {/* Title & Difficulty Header */}
                <div className="pb-4 border-b border-slate-800">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {question.questionId || id}. {question.title}
                  </h1>

                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        question.difficulty?.toLowerCase() === "easy"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : question.difficulty?.toLowerCase() === "medium"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {question.difficulty || "Medium"}
                    </span>

                    {question.isPremium && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold flex items-center gap-1">
                        <FiLock className="w-3 h-3" />
                        <span>Premium</span>
                      </span>
                    )}

                    {question.slug && (
                      <span className="text-xs text-slate-500 font-mono">
                        {question.slug}
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Problem Statement */}
                <div className="pt-4 text-sm text-slate-300 leading-relaxed space-y-4">
                  {question.description ? (
                    typeof question.description === "string" ? (
                      <div
                        className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: question.description }}
                      />
                    ) : (
                      <p>{JSON.stringify(question.description)}</p>
                    )
                  ) : (
                    <div className="space-y-3">
                      <p>
                        Given the problem statement for <strong>{question.title}</strong>,
                        develop an algorithmic solution that efficiently processes the inputs
                        and satisfies all required edge constraints.
                      </p>
                      <p className="text-xs text-slate-400">
                        Use the code editor on the right to implement your solution and test
                        against the provided testcases.
                      </p>
                    </div>
                  )}

                  {/* Examples Section */}
                  {question.examples && Array.isArray(question.examples) ? (
                    <div className="space-y-3 pt-3">
                      {question.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="bg-[#020617] border border-slate-800 rounded-xl p-3.5 text-xs font-mono space-y-1.5"
                        >
                          <div className="font-bold text-white">
                            Example {i + 1}:
                          </div>
                          {ex.input && (
                            <div>
                              <span className="text-slate-400">Input: </span>
                              <span className="text-slate-200">{ex.input}</span>
                            </div>
                          )}
                          {ex.output && (
                            <div>
                              <span className="text-slate-400">Output: </span>
                              <span className="text-green-400 font-semibold">{ex.output}</span>
                            </div>
                          )}
                          {ex.explanation && (
                            <div className="text-slate-400 text-[11px] pt-1">
                              Explanation: {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 pt-3">
                      <div className="bg-[#020617] border border-slate-800 rounded-xl p-3.5 text-xs font-mono space-y-1">
                        <div className="font-bold text-white">Example 1:</div>
                        <div>
                          <span className="text-slate-400">Input: </span>
                          <span className="text-slate-200">nums = [2,7,11,15], target = 9</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Output: </span>
                          <span className="text-green-400 font-semibold">[0,1]</span>
                        </div>
                        <div className="text-slate-400 text-[11px] pt-1">
                          Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Constraints Section */}
                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
                      Constraints
                    </h3>
                    {question.constraints ? (
                      Array.isArray(question.constraints) ? (
                        <ul className="list-disc list-inside space-y-1 text-xs font-mono text-slate-400">
                          {question.constraints.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs font-mono text-slate-400">
                          {String(question.constraints)}
                        </p>
                      )
                    ) : (
                      <ul className="list-disc list-inside space-y-1 text-xs font-mono text-slate-400">
                        <li><code>2 &lt;= nums.length &lt;= 10^4</code></li>
                        <li><code>-10^9 &lt;= nums[i] &lt;= 10^9</code></li>
                        <li>Only one valid answer exists.</li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            RIGHT PANEL: CODE EDITOR & TESTCASES CONSOLE
           ══════════════════════════════════════════════════════════════════ */}
        <section className="flex-1 h-full flex flex-col rounded-xl border border-slate-800 bg-[#0f172a] overflow-hidden">
          {/* Editor Top Bar */}
          <div className="h-10 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between px-3 shrink-0 text-xs select-none">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-semibold">
                Language:
              </span>
              <select
                value={selectedLang}
                onChange={(e) => handleLangChange(e.target.value)}
                className="bg-[#020617] text-white border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-green-400"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>

            {/* Reset Action */}
            <button
              onClick={() => handleLangChange(selectedLang)}
              className="text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800"
              title="Reset code to default boilerplate"
            >
              <FiRotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Code Textarea Area with Line Numbers */}
          <div className="flex-1 relative flex overflow-hidden bg-[#070b14]">
            {/* Synchronized Line Numbers */}
            <div className="w-10 bg-[#040711] text-slate-600 font-mono text-xs py-3 select-none text-right pr-2 shrink-0 border-r border-slate-800/80 leading-6 overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Input Textarea */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              autoComplete="off"
              className="flex-1 h-full bg-[#070b14] text-slate-100 font-mono text-xs p-3 focus:outline-none resize-none leading-6 selection:bg-green-500 selection:text-black overflow-y-auto"
            />
          </div>

          {/* ── Bottom Console (Testcase / Test Result Drawer) ───────────── */}
          <div
            className={`border-t border-slate-800 flex flex-col shrink-0 bg-[#0a0f1d] transition-all duration-200 ${
              isConsoleExpanded ? "h-64" : "h-9"
            }`}
          >
            {/* Console Bar Header */}
            <div className="h-9 bg-[#060a14] border-b border-slate-800 flex items-center justify-between px-3 select-none">
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => {
                    setIsConsoleExpanded(true);
                    setActiveBottomTab("testcase");
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    activeBottomTab === "testcase" && isConsoleExpanded
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Testcase
                </button>
                <button
                  onClick={() => {
                    setIsConsoleExpanded(true);
                    setActiveBottomTab("result");
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                    activeBottomTab === "result" && isConsoleExpanded
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>Test Result</span>
                  {executionResult && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  )}
                </button>
              </div>

              {/* Console Toggle Arrow */}
              <button
                onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition flex items-center gap-1"
                title={isConsoleExpanded ? "Collapse Console" : "Expand Console"}
              >
                <span>Console</span>
                {isConsoleExpanded ? (
                  <FiChevronDown className="w-3 h-3" />
                ) : (
                  <FiChevronUp className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Console Drawer Body */}
            {isConsoleExpanded && (
              <div className="flex-1 p-3.5 overflow-y-auto font-mono text-xs bg-[#0a0f1d]">
                {activeBottomTab === "testcase" ? (
                  <div>
                    {/* Case Pills */}
                    <div className="flex items-center gap-2 mb-3">
                      {["Case 1", "Case 2", "Case 3"].map((cName, i) => (
                        <button
                          key={cName}
                          onClick={() => setActiveTestCaseIndex(i)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            activeTestCaseIndex === i
                              ? "bg-slate-700 text-white"
                              : "bg-[#020617] text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {cName}
                        </button>
                      ))}
                    </div>

                    {/* Case Input Box */}
                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-[11px]">
                        Input Parameters:
                      </span>
                      <div className="bg-[#020617] p-2.5 rounded-xl border border-slate-800 text-slate-200">
                        {activeTestCaseIndex === 0
                          ? "nums = [2,7,11,15], target = 9"
                          : activeTestCaseIndex === 1
                          ? "nums = [3,2,4], target = 6"
                          : "nums = [3,3], target = 6"}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Result Display */
                  <div>
                    {isRunning || isSubmitting ? (
                      <div className="py-8 flex items-center justify-center gap-2 text-slate-300">
                        <span className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        <span>
                          {isSubmitting
                            ? "Judging solution against all test cases..."
                            : "Running test cases..."}
                        </span>
                      </div>
                    ) : executionResult ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-green-400 flex items-center gap-1.5">
                              <FiCheckCircle className="w-4 h-4 text-green-400" />
                              <span>{executionResult.status}</span>
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              ({executionResult.casesPassed})
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-300 text-[11px]">
                            <span>
                              Runtime: <strong className="text-white">{executionResult.runtime}</strong>
                            </span>
                            <span>
                              Memory: <strong className="text-white">{executionResult.memory}</strong>
                            </span>
                          </div>
                        </div>

                        {executionResult.isSubmission && (
                          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs flex items-start gap-2.5">
                            <FiAward className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-green-400 font-bold block mb-0.5">
                                Submission Accepted!
                              </span>
                              <span className="text-slate-300">
                                Beats {executionResult.runtimePercentile} of submissions in runtime efficiency.
                              </span>
                            </div>
                          </div>
                        )}

                        {executionResult.details && (
                          <div className="space-y-1.5">
                            {executionResult.details.map((d, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded-lg bg-[#020617] border border-slate-800 flex justify-between text-[11px]"
                              >
                                <span className="text-slate-400">{d.input}</span>
                                <span className="text-green-400">
                                  Output: {d.actual}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-slate-500 text-xs">
                        Click "Run" or "Submit" above to evaluate your code.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProblemPage;
