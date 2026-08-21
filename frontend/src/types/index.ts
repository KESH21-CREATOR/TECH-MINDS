export type CredentialStatus = "ACTIVE" | "REVOKED";

export interface Credential {
  credentialId: string;
  studentName: string;
  registerNumber: string;
  programme: string;
  cgpa: string;
  graduationYear: string;
  credentialType: string;
  documentHash: string;
  documentHashBytes32?: string;
  originalFileName?: string;
  storedFileName?: string;
  fileSize?: number;
  filePath?: string;
  status: CredentialStatus;
  institutionName: string;
  issuerAddress: string;
  recipientWallet?: string | null;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  issuedTimestamp?: number;
  createdAt?: string;
  revokedAt?: string | null;
  revocationReason?: string;
  revocationTxHash?: string;
  notes?: string;
  onChain?: {
    registered: boolean;
    issuer?: string;
    documentHash?: string;
    issuedAt?: number;
    revokedAt?: number;
    credentialType?: string;
  };
}

export interface VerificationDetails {
  credentialId?: string;
  studentName?: string;
  registerNumber?: string;
  programme?: string;
  cgpa?: string;
  graduationYear?: string;
  credentialType?: string;
  institutionName?: string;
  issuerAddress?: string;
  registeredDocumentHash?: string;
  uploadedDocumentHash?: string;
  hashesMatch?: boolean;
  issuedAt?: string | null;
  revokedAt?: string | null;
  transactionHash?: string | null;
  blockNumber?: number | null;
  fileDetails?: {
    name: string;
    size: number;
    isDemoAsset?: boolean;
  };
  isAuthentic?: boolean;
}

export interface VerificationResponse {
  success: boolean;
  verdict: "VALID" | "TAMPERED" | "REVOKED" | "NOT_FOUND" | "RECORD_FOUND" | "UNKNOWN";
  status: "ACTIVE" | "REVOKED" | "NOT_FOUND" | "UNKNOWN";
  message: string;
  details: VerificationDetails;
  error?: string;
}

export interface HealthStatus {
  status: "ok" | "error";
  service: string;
  timestamp: string;
  blockchain: "connected" | "disconnected" | "error";
  contract: "deployed" | "not_found" | "unknown" | "not_configured";
  contractAddress?: string;
  network: string;
  chainId: number;
  latestBlock: number;
  issuerWallet?: string;
  stats?: {
    totalLocalCredentials: number;
    active: number;
    revoked: number;
  };
  error?: string;
}

export interface DemoPrefillData {
  studentName: string;
  registerNumber: string;
  programme: string;
  cgpa: string;
  graduationYear: string;
  credentialType: string;
  institutionName: string;
  recipientWallet: string;
  notes: string;
}
