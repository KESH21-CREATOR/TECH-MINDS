import { Credential, VerificationResponse, HealthStatus, DemoPrefillData } from "../types";

const API_BASE_URL = "/api";

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
    const res = await fetch(url, options);
    
    // Attempt to parse JSON response
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
    // Friendly error when server is down or unreachable
    console.error(`Network error requesting ${url}:`, err);
    throw new ApiError(
      `Unable to reach CredentialChain API at http://localhost:4000. Please ensure the backend server and Hardhat node are running.`,
      0,
      { originalError: err.message }
    );
  }
}

export const api = {
  // Health Check
  getHealth: (): Promise<HealthStatus> => {
    return request<HealthStatus>("/health");
  },

  // Issue Credential (multipart/form-data)
  issueCredential: (formData: FormData): Promise<{ success: boolean; data: Credential; message: string }> => {
    return request<{ success: boolean; data: Credential; message: string }>("/credentials/issue", {
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

  verifyDemoAsset: (demoModeType: "original" | "tampered", credentialId?: string): Promise<VerificationResponse> => {
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

  // Get all credentials
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
  }
};
