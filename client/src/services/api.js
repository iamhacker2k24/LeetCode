const rawBackendUrl =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.BACKEND_URL ||
  "http://localhost:3000";

export const BACKEND_URL = rawBackendUrl.startsWith("http")
  ? rawBackendUrl.replace(/\/+$/, "")
  : `http://${rawBackendUrl.replace(/\/+$/, "")}`;

export const API_ENDPOINTS = {
  LOGIN: `${BACKEND_URL}/api/user/login`,
  REGISTRATION: `${BACKEND_URL}/api/user/registration`,
  LOGOUT: `${BACKEND_URL}/api/user/logout`,
  CHECK_AUTH: `${BACKEND_URL}/api/user/me`,
  GET_ALL_QUESTIONS: `${BACKEND_URL}/api/admin/qs/getallques`,
  GET_ONE_QUESTION: (id) => `${BACKEND_URL}/api/admin/qs/getOneques/${id}`,
  GET_CODE_TEMPLATE: (id) => `${BACKEND_URL}/api/admin/qs/getcodetemplatebyid/${id}`,
  GET_TEST_CASES: (id) => `${BACKEND_URL}/api/admin/qs/gettestcasebyid/${id}`,
  RUN_QUESTION: (id) => `${BACKEND_URL}/api/user/qs/runques/${id}`,
  CREATE_USER_DETAILS: `${BACKEND_URL}/api/user/userdetails`,
  CHECK_UNIQUE_USERNAME: `${BACKEND_URL}/api/user/getuniqueusername`,
};

export async function loginUser(email, password) {
  const response = await fetch(API_ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Send/receive cookies for session token
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const errorMsg =
      (typeof data?.msg === "string" ? data.msg : null) ||
      data?.message ||
      "Login failed. Please check your credentials.";
    throw new Error(errorMsg);
  }

  return data;
}

export async function registerUser(name, email, password) {
  const response = await fetch(API_ENDPOINTS.REGISTRATION, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Send/receive cookies for session token
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const errorMsg =
      (typeof data?.msg === "string" ? data.msg : null) ||
      data?.message ||
      "Registration failed. Please check your details.";
    throw new Error(errorMsg);
  }

  return data;
}

export async function logoutUser() {
  const response = await fetch(API_ENDPOINTS.LOGOUT, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Clear cookie on client browser
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const errorMsg =
      (typeof data?.msg === "string" ? data.msg : null) ||
      data?.message ||
      "Logout failed.";
    throw new Error(errorMsg);
  }

  return data;
}

export async function checkAuthUser() {
  try {
    const response = await fetch(API_ENDPOINTS.CHECK_AUTH, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send session cookies
    });

    const data = await response.json().catch(() => null);
    const isSuccess = data?.sucess === true || data?.success === true;

    return {
      isAuthenticated: response.ok && isSuccess,
      data,
    };
  } catch (err) {
    return {
      isAuthenticated: false,
      error: err.message,
    };
  }
}

export async function getAllQuestions() {
  const response = await fetch(API_ENDPOINTS.GET_ALL_QUESTIONS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const errorMsg =
      (typeof data?.msg === "string" ? data.msg : null) ||
      data?.message ||
      "Failed to fetch questions.";
    throw new Error(errorMsg);
  }

  return data;
}

export async function getOneQuestion(id) {
  const url = API_ENDPOINTS.GET_ONE_QUESTION(id);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const errorMsg =
      (typeof data?.msg === "string" ? data.msg : null) ||
      data?.message ||
      `Failed to fetch question #${id}.`;
    throw new Error(errorMsg);
  }

  return data;
}

export async function getCodeTemplateById(id) {
  const url = API_ENDPOINTS.GET_CODE_TEMPLATE(id);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const errorMsg =
      (typeof data?.msg === "string" ? data.msg : null) ||
      data?.message ||
      `Failed to fetch code template for question #${id}.`;
    throw new Error(errorMsg);
  }

  return data;
}

export async function getTestCasesById(id) {
  const url = API_ENDPOINTS.GET_TEST_CASES(id);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const errorMsg =
      (typeof data?.msg === "string" ? data.msg : null) ||
      data?.message ||
      `Failed to fetch test cases for question #${id}.`;
    throw new Error(errorMsg);
  }

  return data;
}

export async function runQuestion(id, { code, language, timeTaken }) {
  const url = API_ENDPOINTS.RUN_QUESTION(id);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      code,
      language,
      timeTaken: typeof timeTaken === "number" ? timeTaken : 0,
    }),
  });

  const data = await response.json().catch(() => null);

  // Notice backend might return { "sucess": true } or { "success": true }
  const isSuccess = data?.sucess === true || data?.success === true;

  if (!response.ok || !isSuccess) {
    const errorMsg =
      (typeof data?.msg === "string" ? data.msg : null) ||
      data?.message ||
      data?.error ||
      `Execution failed for question #${id}.`;
    throw new Error(errorMsg);
  }

  return data;
}

export async function createUserDetails(profileData) {
  const url = API_ENDPOINTS.CREATE_USER_DETAILS;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(profileData),
  });

  const data = await response.json().catch(() => null);
  const isSuccess = data?.sucess === true || data?.success === true;

  if (!response.ok || !isSuccess) {
    const errorMsg =
      (typeof data?.msg === "string" ? data.msg : null) ||
      data?.message ||
      data?.error ||
      "Failed to save profile details.";
    throw new Error(errorMsg);
  }

  return data;
}

export async function checkUniqueUsername(username) {
  const url = API_ENDPOINTS.CHECK_UNIQUE_USERNAME;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username }),
    });

    const data = await response.json().catch(() => null);
    const isSuccess = data?.sucess === true || data?.success === true;

    return {
      isAvailable: response.ok && isSuccess,
      msg:
        (typeof data?.msg === "string" ? data.msg : null) ||
        data?.message ||
        (isSuccess ? "you can use this username" : "Username is already taken"),
    };
  } catch (err) {
    return {
      isAvailable: false,
      msg: err.message || "Error checking username",
    };
  }
}
