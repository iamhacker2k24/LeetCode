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
  GET_ALL_QUESTIONS: `${BACKEND_URL}/api/admin/qs/getallques`,
  GET_ONE_QUESTION: (id) => `${BACKEND_URL}/api/admin/qs/getOneques/${id}`,
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
