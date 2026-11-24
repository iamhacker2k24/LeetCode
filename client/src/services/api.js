const rawBackendUrl =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.BACKEND_URL ||
  "http://localhost:3000";

export const BACKEND_URL = rawBackendUrl.startsWith("http")
  ? rawBackendUrl.replace(/\/+$/, "")
  : `http://${rawBackendUrl.replace(/\/+$/, "")}`;

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${BACKEND_URL}/api/user/login`,
  REGISTRATION: `${BACKEND_URL}/api/user/registration`,
  LOGOUT: `${BACKEND_URL}/api/user/logout`,
  CHECK_AUTH: `${BACKEND_URL}/api/user/me`,

  // User Profile & Details
  CREATE_USER_DETAILS: `${BACKEND_URL}/api/user/details/userdetails`,
  CHECK_UNIQUE_USERNAME: `${BACKEND_URL}/api/user/details/getuniqueusername`,
  USER_STATS: (username) => `${BACKEND_URL}/api/user/details/userstats/${encodeURIComponent(username)}`,
  SOLVED_MAP: (username) => `${BACKEND_URL}/api/user/details/SolvedMap/${encodeURIComponent(username)}`,

  // Questions (Admin / Public)
  GET_ALL_QUESTIONS: `${BACKEND_URL}/api/admin/qs/getallques`,
  GET_ONE_QUESTION: (id) => `${BACKEND_URL}/api/admin/qs/getOneques/${id}`,
  GET_QUESTION_BY_SLUG: (slug) => `${BACKEND_URL}/api/admin/qs/getquesbyslung/${slug}`,
  CREATE_QUESTION: `${BACKEND_URL}/api/admin/qs/createques`,
  EDIT_QUESTION: (id) => `${BACKEND_URL}/api/admin/qs/editques/${id}`,
  DELETE_QUESTION: `${BACKEND_URL}/api/admin/qs/deleteques`,

  // Code Execution & Submissions
  RUN_QUESTION: (id) => `${BACKEND_URL}/api/user/qs/runques/${id}`,
  RUN_WITH_CUSTOM_TESTCASE: (id) => `${BACKEND_URL}/api/user/qs/runquesWithtestCase/${id}`,
  SUBMIT_QUESTION: (id) => `${BACKEND_URL}/api/user/qs/submitques/${id}`,
  LIKE_QUESTION: (id) => `${BACKEND_URL}/api/user/qs/likeques/${id}`,
  STAR_QUESTION: (id) => `${BACKEND_URL}/api/user/qs/isstar/${id}`,

  // Test Cases
  GET_TEST_CASES: (id) => `${BACKEND_URL}/api/admin/qs/gettestcasebyid/${id}`,
  CREATE_TEST_CASE: `${BACKEND_URL}/api/admin/qs/createtestCse`,
  EDIT_TEST_CASE: (id) => `${BACKEND_URL}/api/admin/qs/edittestcase/${id}`,
  DELETE_TEST_CASE: (id) => `${BACKEND_URL}/api/admin/qs/deletetestcase/${id}`,

  // Code Templates
  GET_CODE_TEMPLATE: (id) => `${BACKEND_URL}/api/admin/qs/getcodetemplatebyid/${id}`,
  CREATE_CODE_TEMPLATE: (id) => `${BACKEND_URL}/api/admin/qs/createcodetemplate/${id}`,
  EDIT_CODE_TEMPLATE: (id) => `${BACKEND_URL}/api/admin/qs/editcodetemplate/${id}`,
  DELETE_CODE_TEMPLATE: (id) => `${BACKEND_URL}/api/admin/qs/deletecodetemplate/${id}`,

  // Admin Management
  CREATE_ADMIN: `${BACKEND_URL}/api/admin/createAdmin`,
  DISMISS_ADMIN: `${BACKEND_URL}/api/admin/dismissAdmin`,
  CHECK_ADMIN: `${BACKEND_URL}/api/admin/admincheck`,
};

/**
 * Helper to extract a clean error message from a backend response payload
 */
function parseErrorMessage(data, fallback = "An unexpected error occurred.") {
  if (!data) return fallback;
  if (typeof data.msg === "string") return data.msg;
  if (typeof data.message === "string") return data.message;
  if (typeof data.error === "string") return data.error;
  return fallback;
}

/**
 * Unified HTTP client for all API calls.
 * Handles headers, credentials, JSON parsing, and unified error handling.
 */
async function request(url, { method = "GET", body, headers = {}, fallbackError, checkSuccess = true } = {}) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
  };

  if (body !== undefined) {
    options.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);

  if (checkSuccess) {
    const isSuccess = data?.success === true || data?.sucess === true;
    if (!response.ok || !isSuccess) {
      throw new Error(parseErrorMessage(data, fallbackError || `Request failed with status ${response.status}`));
    }
  } else if (!response.ok && !data) {
    throw new Error(fallbackError || `HTTP error ${response.status}`);
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATION SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export async function loginUser(email, password) {
  return request(API_ENDPOINTS.LOGIN, {
    method: "POST",
    body: { email, password },
    fallbackError: "Login failed. Please check your credentials.",
  });
}

export async function registerUser(name, email, password) {
  return request(API_ENDPOINTS.REGISTRATION, {
    method: "POST",
    body: { name, email, password },
    fallbackError: "Registration failed. Please check your details.",
  });
}

export async function logoutUser() {
  return request(API_ENDPOINTS.LOGOUT, {
    method: "GET",
    fallbackError: "Logout failed.",
  });
}

export async function checkAuthUser() {
  try {
    const data = await request(API_ENDPOINTS.CHECK_AUTH, {
      method: "GET",
      checkSuccess: true,
    });
    return {
      isAuthenticated: true,
      data,
    };
  } catch (err) {
    return {
      isAuthenticated: false,
      error: err.message,
    };
  }
}

export async function checkAuthAdmin() {
  try {
    const data = await request(API_ENDPOINTS.CHECK_ADMIN, {
      method: "GET",
      checkSuccess: true,
    });
    return {
      isAdmin: true,
      data,
    };
  } catch (err) {
    // Graceful fallback: check if user session exists with admin/owner role
    try {
      const auth = await checkAuthUser();
      if (auth.isAuthenticated) {
        let stored = null;
        try {
          stored = JSON.parse(localStorage.getItem("user") || "{}");
        } catch {}
        const role = (stored?.role || "").toLowerCase();
        if (role === "admin" || role === "owner") {
          return {
            isAdmin: true,
            data: stored,
          };
        }
      }
    } catch {}

    return {
      isAdmin: false,
      error: err.message,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE & DETAILS SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export async function createUserDetails(profileData) {
  return request(API_ENDPOINTS.CREATE_USER_DETAILS, {
    method: "POST",
    body: profileData,
    fallbackError: "Failed to save profile details.",
  });
}

export async function checkUniqueUsername(username) {
  try {
    const data = await request(API_ENDPOINTS.CHECK_UNIQUE_USERNAME, {
      method: "POST",
      body: { username },
      checkSuccess: true,
    });
    return {
      isAvailable: true,
      msg: data?.msg || "Username available",
    };
  } catch (err) {
    return {
      isAvailable: false,
      msg: err.message || "Username is already taken",
    };
  }
}

export async function getUserStats(username) {
  const data = await request(API_ENDPOINTS.USER_STATS(username), {
    method: "POST",
    fallbackError: `Failed to load stats for ${username}`,
  });
  return data?.data || data?.msg || data;
}

export async function getSolvedMap(username) {
  const data = await request(API_ENDPOINTS.SOLVED_MAP(username), {
    method: "POST",
    fallbackError: `Failed to load solved map for ${username}`,
  });
  return data?.data || data?.msg || data;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export async function getAllQuestions() {
  return request(API_ENDPOINTS.GET_ALL_QUESTIONS, {
    method: "GET",
    fallbackError: "Failed to fetch questions.",
  });
}

export async function getOneQuestion(id) {
  return request(API_ENDPOINTS.GET_ONE_QUESTION(id), {
    method: "GET",
    fallbackError: `Failed to fetch question #${id}.`,
  });
}

export async function getOneQuestionBySlug(slug) {
  return request(API_ENDPOINTS.GET_QUESTION_BY_SLUG(slug), {
    method: "GET",
    fallbackError: `Failed to fetch question "${slug}".`,
  });
}

export async function createQuestion(questionData) {
  return request(API_ENDPOINTS.CREATE_QUESTION, {
    method: "POST",
    body: questionData,
    fallbackError: "Failed to create question.",
  });
}

export async function editQuestion(id, questionData) {
  return request(API_ENDPOINTS.EDIT_QUESTION(id), {
    method: "POST",
    body: questionData,
    fallbackError: `Failed to update question #${id}.`,
  });
}

export async function deleteQuestion(slug) {
  return request(API_ENDPOINTS.DELETE_QUESTION, {
    method: "DELETE",
    body: { quesSlug: slug },
    fallbackError: `Failed to delete question "${slug}".`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CODE EXECUTION & SUBMISSION SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export async function runQuestion(id, { code, language, timeTaken }) {
  return request(API_ENDPOINTS.RUN_QUESTION(id), {
    method: "POST",
    body: {
      code,
      language,
      timeTaken: typeof timeTaken === "number" ? timeTaken : 0,
    },
    fallbackError: `Execution failed for question #${id}.`,
  });
}

export async function runQuestionWithTestCase(id, { code, language, testCases }) {
  return request(API_ENDPOINTS.RUN_WITH_CUSTOM_TESTCASE(id), {
    method: "POST",
    body: {
      code,
      language,
      testCases,
    },
    fallbackError: `Custom execution failed for question #${id}.`,
  });
}

export async function submitQuestion(id, { code, language, timeTaken }) {
  return request(API_ENDPOINTS.SUBMIT_QUESTION(id), {
    method: "POST",
    body: {
      code,
      language,
      timeTaken: typeof timeTaken === "number" ? timeTaken : 0,
    },
    checkSuccess: false,
    fallbackError: `Submission server error`,
  });
}

export async function likeQuestion(id, { isLike, isDisLike }) {
  return request(API_ENDPOINTS.LIKE_QUESTION(id), {
    method: "POST",
    body: { isLike, isDisLike },
    fallbackError: "Failed to update like status.",
  });
}

export async function starQuestion(id) {
  return request(API_ENDPOINTS.STAR_QUESTION(id), {
    method: "GET",
    fallbackError: "Failed to star question.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST CASE SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export async function getTestCasesById(id, { all = false } = {}) {
  const baseUrl = API_ENDPOINTS.GET_TEST_CASES(id);
  const url = all ? `${baseUrl}?all=true` : baseUrl;
  return request(url, {
    method: "GET",
    fallbackError: `Failed to fetch test cases for question #${id}.`,
  });
}

export async function createTestCase(testCaseData) {
  return request(API_ENDPOINTS.CREATE_TEST_CASE, {
    method: "POST",
    body: testCaseData,
    fallbackError: "Failed to create test case.",
  });
}

export async function editTestCase(id, testCaseData) {
  return request(API_ENDPOINTS.EDIT_TEST_CASE(id), {
    method: "PUT",
    body: testCaseData,
    fallbackError: `Failed to update test case #${id}.`,
  });
}

export async function deleteTestCase(id) {
  return request(API_ENDPOINTS.DELETE_TEST_CASE(id), {
    method: "DELETE",
    fallbackError: `Failed to delete test case #${id}.`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CODE TEMPLATE SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export async function getCodeTemplateById(id) {
  return request(API_ENDPOINTS.GET_CODE_TEMPLATE(id), {
    method: "GET",
    fallbackError: `Failed to fetch code template for question #${id}.`,
  });
}

export async function createCodeTemplate(id, templateData) {
  return request(API_ENDPOINTS.CREATE_CODE_TEMPLATE(id), {
    method: "POST",
    body: templateData,
    fallbackError: `Failed to create code template for question #${id}.`,
  });
}

export async function editCodeTemplate(id, templateData) {
  return request(API_ENDPOINTS.EDIT_CODE_TEMPLATE(id), {
    method: "PUT",
    body: templateData,
    fallbackError: `Failed to update code template for question #${id}.`,
  });
}

export async function deleteCodeTemplate(id) {
  return request(API_ENDPOINTS.DELETE_CODE_TEMPLATE(id), {
    method: "DELETE",
    fallbackError: `Failed to delete code template for question #${id}.`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PRIVILEGE SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export async function createAdminUser(email) {
  return request(API_ENDPOINTS.CREATE_ADMIN, {
    method: "POST",
    body: { email },
    fallbackError: "Failed to promote user to admin.",
  });
}

export async function dismissAdminUser(email) {
  return request(API_ENDPOINTS.DISMISS_ADMIN, {
    method: "POST",
    body: { email },
    fallbackError: "Failed to dismiss admin.",
  });
}

