export const API_URL = "https://backend-995991413043.us-west1.run.app";

export type ThreadOut = {
  id: string;
  title: string;
  tags: string[];
  author_email: string;
  created_at: number;
};

export type MessageOut = {
  id: string;
  thread_id: string;
  parent_id: string | null;
  author_email: string;
  body: string;
  created_at: number;
};

export type MessageNode = MessageOut & {
  replies: MessageNode[];
};

export type UserOut = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company_name: string | null;
  is_verified: boolean;
};

// Thrown specifically for a 401 (expired/invalid/revoked session), so callers
// can tell "your session is dead" apart from other failures (e.g. offline).
export class UnauthorizedError extends Error {}

// Called whenever a request comes back 401, so the app can clear its local auth state.
// Registered by AuthProvider.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      onUnauthorized?.();
      throw new UnauthorizedError("Invalid or expired session");
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail ?? `Request failed with status ${response.status}`);
  }

  return response.json();
}

export function getMe(token: string): Promise<UserOut> {
  return request<UserOut>("/me", { method: "GET" }, token);
}

export type LoginResponse = {
  token: string;
  user: UserOut;
};

export function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  company_name: string | null;
};

export function register(payload: RegisterPayload): Promise<LoginResponse> {
  return request<LoginResponse>("/register", { method: "POST", body: JSON.stringify(payload) });
}

export function getThreads(tag?: string): Promise<ThreadOut[]> {
  const query = tag ? `?tag=${encodeURIComponent(tag)}` : "";
  return request<ThreadOut[]>(`/threads${query}`);
}

export function createThread(token: string, title: string, tags: string[]): Promise<ThreadOut> {
  return request<ThreadOut>("/threads", { method: "POST", body: JSON.stringify({ title, tags }) }, token);
}

export function getThreadTree(threadId: string): Promise<MessageNode[]> {
  return request<MessageNode[]>(`/threads/${threadId}/tree`, { method: "POST" });
}

export function logout(token: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/logout", { method: "POST" }, token);
}

export function postMessage(
  token: string,
  threadId: string,
  body: string,
  parentId: string | null
): Promise<MessageOut> {
  return request<MessageOut>(
    `/threads/${threadId}/messages`,
    { method: "POST", body: JSON.stringify({ body, parent_id: parentId }) },
    token
  );
}
