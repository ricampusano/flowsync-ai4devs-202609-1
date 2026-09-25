const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export interface User {
  id: number;
  fullName: string | null;
  email: string;
  initials: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    const message = body?.errors?.[0]?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  } catch {
    // La respuesta no traía JSON parseable, se usa el mensaje genérico.
  }
  return "Ocurrió un error inesperado. Intentá de nuevo.";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function signup(input: {
  fullName: string | null;
  email: string;
  password: string;
  passwordConfirmation: string;
}): Promise<AuthResult> {
  return request<{ data: AuthResult }>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  }).then((res) => res.data);
}

export function login(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  return request<{ data: AuthResult }>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  }).then((res) => res.data);
}

export function getProfile(token: string): Promise<User> {
  return request<{ data: User }>("/api/v1/account/profile", {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.data);
}

export function logout(token: string): Promise<void> {
  return request<void>("/api/v1/account/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}
