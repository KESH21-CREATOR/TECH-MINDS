import {
  Credential,
  VerificationResponse,
  HealthStatus,
  DemoPrefillData,
  DemoCredentialItem,
  AIDocumentAnalysis,
  AIVerdictExplanation,
  User,
  AuthResponse,
  SignInCredentials,
  SignUpCredentials,
  UserRole
} from "../types";

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "/api";

class ApiError extends Error {
  public status?: number;
  public details?: any;

  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const token = localStorage.getItem("credentialchain_token");
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {})
    };

    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });
    
    let data: any = {};
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const errorMsg = data?.error || data?.message || `API request failed with status ${res.status}`;
      throw new ApiError(errorMsg, res.status, data);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    console.error(`Network error requesting ${url}:`, err);
    throw new ApiError(
      `Unable to reach CredentialChain API. Please ensure the backend server and Hardhat node are running.`,
      0,
      { originalError: err.message }
    );
  }
}

export const api = {
  // Authentication
  signin: (credentials: SignInCredentials): Promise<AuthResponse> => {
    return request<AuthResponse>("/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
  },

  signup: (userData: SignUpCredentials): Promise<AuthResponse> => {
    return request<AuthResponse>("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
  },

  demoLogin: (role: UserRole): Promise<AuthResponse> => {
    return request<AuthResponse>("/auth/demo-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
  },

  getMe: (token?: string): Promise<{ success: boolean; user: User }> => {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return request<{ success: boolean; user: User }>("/auth/me", { headers });
  },

  updateProfile: (updates: Partial<User>): Promise<{ success: boolean; user: User; message: string }> => {
    return request<{ success: boolean; user: User; message: string }>("/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
  },

  // Health Check
  getHealth: (): Promise<HealthStatus> => {
    return request<HealthStatus>("/health");
  },

  // Issue Credential (multipart/form-data)
  issueCredential: (formData: FormData): Promise<{ success: boolean; data: Credential; message: string; alreadyRegistered?: boolean }> => {
    return request<{ success: boolean; data: Credential; message: string; alreadyRegistered?: boolean }>("/credentials/issue", {
      method: "POST",
      body: formData
    });
  },

  // Verify Credential (multipart/form-data or json)
  verifyCredentialWithFile: (formData: FormData): Promise<VerificationResponse> => {
    return request<VerificationResponse>("/credentials/verify", {
      method: "POST",
      body: formData
    });
  },

  verifyCredentialById: (credentialId: string): Promise<VerificationResponse> => {
    const formData = new FormData();
    formData.append("credentialId", credentialId);
    return request<VerificationResponse>("/credentials/verify", {
      method: "POST",
      body: formData
    });
  },

  verifyDemoAsset: (demoModeType: string, credentialId?: string): Promise<VerificationResponse> => {
    const formData = new FormData();
    formData.append("demoModeType", demoModeType);
    if (credentialId) {
      formData.append("credentialId", credentialId);
    }
    return request<VerificationResponse>("/credentials/verify", {
      method: "POST",
      body: formData
    });
  },

  // Get single credential
  getCredential: (id: string): Promise<{ success: boolean; data: Credential }> => {
    return request<{ success: boolean; data: Credential }>(`/credentials/${encodeURIComponent(id)}`);
  },

  // Get credentials belonging to the authenticated student
  getMyCredentials: (): Promise<{ success: boolean; user: any; total: number; active: number; revoked: number; data: Credential[] }> => {
    return request<{ success: boolean; user: any; total: number; active: number; revoked: number; data: Credential[] }>("/credentials/my");
  },

  // Get all credentials (Public Registry)
  getAllCredentials: (): Promise<{ success: boolean; total: number; active: number; revoked: number; data: Credential[] }> => {
    return request<{ success: boolean; total: number; active: number; revoked: number; data: Credential[] }>("/credentials");
  },

  // Revoke credential
  revokeCredential: (id: string, reason?: string): Promise<{ success: boolean; data: any; message: string }> => {
    return request<{ success: boolean; data: any; message: string }>(`/credentials/${encodeURIComponent(id)}/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    });
  },

  // Demo Prefill Data
  getDemoPrefill: (): Promise<{ success: boolean; data: DemoPrefillData }> => {
    return request<{ success: boolean; data: DemoPrefillData }>("/demo/prefill");
  },

  // AI Assistant Chatbot
  aiChat: (message: string, context: any = {}): Promise<{ success: boolean; data: { reply: string; isContextAware?: boolean; topic?: string; source: string } }> => {
    return request<{ success: boolean; data: { reply: string; isContextAware?: boolean; topic?: string; source: string } }>("/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, context })
    });
  },

  // Explain Verification Verdict
  explainVerdict: (verdict: string, details: any): Promise<{ success: boolean; data: AIVerdictExplanation }> => {
    return request<{ success: boolean; data: AIVerdictExplanation }>("/ai/explain-verdict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verdict, details })
    });
  },

  // AI Document Structure & Consistency Analysis
  analyzeDocument: (params: { file?: File; credentialId?: string; demoModeType?: string }): Promise<{ success: boolean; data: AIDocumentAnalysis }> => {
    const formData = new FormData();
    if (params.file) formData.append("document", params.file);
    if (params.credentialId) formData.append("credentialId", params.credentialId);
    if (params.demoModeType) formData.append("demoModeType", params.demoModeType);

    return request<{ success: boolean; data: AIDocumentAnalysis }>("/ai/analyze-document", {
      method: "POST",
      body: formData
    });
  },

  // Get Demo Catalog
  getDemoCatalog: (): Promise<{ success: boolean; data: DemoCredentialItem[] }> => {
    return request<{ success: boolean; data: DemoCredentialItem[] }>("/ai/demo-catalog");
  }
};
