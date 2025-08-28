import Cookies from "js-cookie";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
console.log("API_BASE_URL:", API_BASE_URL);

export interface Message {
  message_id: string;
  query: string;
  answer: {
    text_response: string;
    image_urls?: { source: string }[];
    video_urls?: { URL: string; Title: string }[];
    suggestion_questions?: string[];
    sources?: { URL: string; Title: string }[];
  };
  created_at: string;
}

export interface ChatResponse {
  chat_id: string;
  user_id: number;
  messages?: Message[];
  data?: {
    messages?: Message[];
  };
}

export interface ChatRequest {
  prompt: string;
  user_id: number;
  chat_id: string | null;
}

export interface ChatRequestSchema {
  prompt: string;
  user_id: number;
  chat_id: string;
}

interface SignupData {
  role: string;
  username: string;
  dob: string;
  phone_number: string;
  email: string;
  password: string;
  university: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

interface createUser {
  role: string;
  username: string;
  dob: string;
  phone_number: string;
  email: string;
  password: string;
  university: string;
}

interface addUser {
  role: string;
  username: string;
  dob: string;
  phone_number: string;
  email: string;
  university: string;
}

// Helper function for handling fetch requests
const fetchApi = async (url: string, options?: RequestInit) => {
  const response = await fetch(`${API_BASE_URL}${url}`, options);
  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
  return response.json();
};

// Auth Endpoints
export const getEmailVerification = async (email: string) => {
  return fetchApi(`/auth/get_email/${email}?new_user=false`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
};

export const verifyEmailOtp = async (email: string, otp: number) => {
  return fetchApi(`/auth/verify_email/${email}/${otp}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
};

export const signup = async (data: SignupData): Promise<ApiResponse> => {
  return fetchApi(`/auth/signup`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
};

export const checkLogin = async (email: string, password: string) => {
  return fetchApi(`/auth/check_info`, {
    method: "POST",
    body: JSON.stringify({ email: email, password: password }),
    headers: { "Content-Type": "application/json" },
  });
};

export const forgotPassword = async (email: string, password: string): Promise<ApiResponse> => {
  return fetchApi(`/auth/forgot_password`, {
    method: "PUT",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
  });
};

// Chat Endpoints
export const createChat = async (user_id: number) => {
  return fetchApi(`/chat/create-chat`, {
    method: "POST",
    body: JSON.stringify({ user_id }),
    headers: { "Content-Type": "application/json" },
  });
};

export const sendChat = async (data: ChatRequest) => {
  return fetchApi(`/chat/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const fetchHistory = async (user_id: number) => {
  return fetchApi(`/chat/chat/history?user_id=${user_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
};

export const suggestQuestions = async (request: ChatRequest) => {
  return fetchApi(`/chat/suggest_questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
};

export const fetchSingleChat = async (chat_id: string): Promise<ChatResponse> => {
  return fetchApi(`/chat/chat/${chat_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
};

export const deleteChat = async (chat_id: string) => {
  return fetchApi(`/chat/delete_chat_history/${chat_id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
};

export const streamResponse = async (data: ChatRequestSchema) => {
  return fetchApi(`/chat/response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

// Admin Endpoints
export const createAdminUser = async (data: createUser): Promise<ApiResponse> => {
  const token = Cookies.get('authToken');
  return fetchApi(`/admin/create_user`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
};

export const createBulkUsers = async (data: any): Promise<ApiResponse> => {
  const token = Cookies.get('authToken');
  return fetchApi(`/admin/bulk_user_create`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
};

export const updateUser = async (data: any): Promise<ApiResponse> => {
  const token = Cookies.get('authToken');
  return fetchApi(`/admin/update_users`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
};

export const listUsers = async (): Promise<any> => {
  const token = Cookies.get('authToken');
  return fetchApi(`/admin/list_users_details`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
};

export const removeUser = async (data: any): Promise<ApiResponse> => {
  const token = Cookies.get('authToken');
  return fetchApi(`/admin/remove_user`, {
    method: "DELETE",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
};

export const uploadInvoice = async (data: any): Promise<ApiResponse> => {
  const token = Cookies.get('authToken');
  return fetchApi(`/admin/upload-invoice`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
};