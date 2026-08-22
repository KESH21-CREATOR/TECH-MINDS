export type CredentialStatus = "ACTIVE" | "REVOKED";

export type UserRole = "Student" | "Institution" | "Verifier";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  institutionName?: string;
  institutionCode?: string;
  registerNumber?: string;
  programme?: string;
  organizationName?: string;
  walletAddress?: string | null;
  isDemo?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

export interface SignInCredentials {
  email: string;
  password?: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  institutionName?: string;
  institutionCode?: string;
  registerNumber?: string;
  programme?: string;
  organizationName?: string;
  walletAddress?: string;
}

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

export interface DemoCredentialItem {
  id: string;
  filename: string;
  originalFilename?: string;
  studentName: string;
  registerNumber: string;
  institution: string;
  programme: string;
  credentialType: string;
  cgpa: string;
  originalCgpa?: string;
  sha256: string;
  academicYear: string;
  issueDate: string;
  isTampered: boolean;
  description: string;
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isContextAware?: boolean;
  topic?: string;
}

export interface ExtractedAttribute {
  category: string;
  label: string;
  value: string;
}

export interface AIDocumentAnalysis {
  success: boolean;
  analysisTimestamp: string;
  documentCategory?: string;
  documentType: string;
  detectedInstitution: string;
  detectedStudent: string;
  detectedRegisterNumber: string;
  detectedProgramme: string;
  detectedCgpa: string;
  campus?: string;
  academicYear: string;
  issueDate: string;
  personalDetails?: {
    name: string;
    fatherName?: string;
    dob?: string;
    gender?: string;
    nationality?: string;
  };
  identityDetails?: {
    aadharMasked?: string;
    passportMasked?: string;
    panMasked?: string;
  };
  academicScores?: {
    tenthScore?: string;
    twelfthScore?: string;
    entranceRank?: string;
    cgpa?: string;
    percentage?: string;
  };
  extractedAttributes?: ExtractedAttribute[];
  documentConsistency: string;
  isConsistent: boolean;
  potentialIssues: string[];
  confidence: string;
  disclaimer: string;
}

export interface AIVerdictExplanation {
  verdict: string;
  title: string;
  explanation: string;
  recommendation: string;
}
