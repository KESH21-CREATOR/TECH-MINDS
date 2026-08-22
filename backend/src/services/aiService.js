const { KNOWLEDGE_TOPICS } = require("./aiKnowledgeBase");
const db = require("../config/db");

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || null;
  }

  /**
   * Main conversational chat method with context awareness
   */
  async chat({ message, context = {} }) {
    const cleanMsg = (message || "").trim().toLowerCase();

    // 1. Check for context-specific questions (e.g. "Why is this credential valid?", "What is the status of this document?")
    if (context.credentialId || context.verificationResult) {
      const contextualResponse = this.resolveContextualQuestion(cleanMsg, context);
      if (contextualResponse) {
        return {
          reply: contextualResponse,
          source: "context_engine",
          isContextAware: true
        };
      }
    }

    // 2. Search Structured Knowledge Base
    const matchedTopic = this.findMatchingKnowledge(cleanMsg);
    if (matchedTopic) {
      return {
        reply: matchedTopic.response,
        topic: matchedTopic.title,
        source: "knowledge_base",
        isContextAware: false
      };
    }

    // 3. If OpenAI API key is configured, call OpenAI with strict grounding prompt
    if (this.apiKey) {
      try {
        const llmReply = await this.callOpenAI(message, context);
        if (llmReply) {
          return {
            reply: llmReply,
            source: "openai_llm",
            isContextAware: !!context.credentialId
          };
        }
      } catch (err) {
        console.warn("OpenAI API call failed, falling back to local assistant:", err.message);
      }
    }

    // 4. Default Fallback
    return {
      reply: `I can help you understand **CredentialChain**, cryptographic verification, blockchain smart contracts, or specific credential records.

**Suggested questions you can ask me:**
- *How does credential verification work?*
- *Why is blockchain used instead of a standard database?*
- *What does "Tamper Detected" mean?*
- *What is a SHA-256 cryptographic fingerprint?*
- *Is my raw academic transcript stored on the blockchain?*
- *How do I share my certificate with an employer?*`,
      source: "assistant_default",
      isContextAware: false
    };
  }

  /**
   * Resolves questions about the currently viewed credential
   */
  resolveContextualQuestion(cleanMsg, context) {
    const { credentialId, verificationResult, activePage } = context;

    // A. "Why is this valid?" or "Explain why valid"
    if (cleanMsg.includes("valid") || cleanMsg.includes("why is this valid") || cleanMsg.includes("authentic")) {
      if (verificationResult && verificationResult.verdict === "VALID") {
        return `### Verification Status: 🟢 VERIFIED AUTHENTIC

**Why this credential is VALID:**
1. **Cryptographic SHA-256 Match:** The computed 256-bit fingerprint (\`${verificationResult.details?.uploadedDocumentHash?.slice(0, 16)}...\`) of the uploaded PDF matches the immutable hash registered on the Ethereum blockchain with **100% mathematical precision**.
2. **On-Chain Status:** The smart contract confirms the credential status is **ACTIVE** and has not been revoked.
3. **Issuer Authority:** Registered by **${verificationResult.details?.institutionName || "CredentialChain University"}** (Address: \`${verificationResult.details?.issuerAddress?.slice(0, 10)}...\`).

*Conclusion: The document presented is genuine, unaltered, and legally valid.*`;
      }
    }

    // B. "Why is this tampered?" or "What changed?"
    if (cleanMsg.includes("tamper") || cleanMsg.includes("why tampered") || cleanMsg.includes("what changed") || cleanMsg.includes("altered")) {
      if (verificationResult && verificationResult.verdict === "TAMPERED") {
        return `### Verification Status: 🔴 TAMPER DETECTED

**Why this document was flagged as TAMPERED:**
1. **Cryptographic Hash Mismatch:** 
   - **Registered Blockchain Hash:** \`${verificationResult.details?.registeredDocumentHash}\`
   - **Uploaded Document Hash:** \`${verificationResult.details?.uploadedDocumentHash}\`
2. **Avalanche Effect:** Even modifying a single grade (e.g. altering CGPA to 9.90), letter, or date completely changes the SHA-256 hash.
3. **Integrity Guarantee:** Because the blockchain record is immutable, any unauthorized alteration post-issuance is immediately detected.

*The uploaded document does NOT match the fingerprint originally certified by the institution.*`;
      }
    }

    // C. "Why is this revoked?"
    if (cleanMsg.includes("revoke") || cleanMsg.includes("why revoked") || cleanMsg.includes("revocation")) {
      if (verificationResult && (verificationResult.verdict === "REVOKED" || verificationResult.status === "REVOKED")) {
        return `### Verification Status: 🟠 CREDENTIAL REVOKED

**Why this credential is REVOKED:**
1. **Institutional Action:** The issuing educational institution has invoked the \`revokeCredential()\` method on the smart contract.
2. **Smart Contract State:** The on-chain state for **${verificationResult.details?.credentialId || credentialId}** was permanently updated to **REVOKED**.
3. **Validity:** Although the original document may match the historical hash, the certificate has been invalidated by the issuing authority and is no longer legally accepted.`;
      }
    }

    // D. "What credential am I looking at?" or "Tell me about this credential"
    if (credentialId && (cleanMsg.includes("this credential") || cleanMsg.includes("details") || cleanMsg.includes("tell me about") || cleanMsg.includes("who is"))) {
      const record = db.findCredentialById(credentialId);
      if (record) {
        return `### Active Credential Details:
- **Credential ID:** \`${record.credentialId}\`
- **Student Name:** **${record.studentName}** (Reg: \`${record.registerNumber}\`)
- **Programme:** ${record.programme}
- **CGPA:** ${record.cgpa}
- **Status:** **${record.status}** ${record.status === "ACTIVE" ? "🟢" : "🔴"}
- **Issuing Institution:** ${record.institutionName}
- **SHA-256 Document Hash:** \`${record.documentHash}\`
- **Blockchain Tx:** \`${record.transactionHash || "0x..."}\` (Block #${record.blockNumber || 1})`;
      }
    }

    return null;
  }

  /**
   * Finds matching knowledge topic using smart multi-token and phrase relevance
   */
  findMatchingKnowledge(query) {
    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").trim();
    const queryWords = cleanQuery.split(/\s+/).filter((w) => w.length > 2);

    let bestMatch = null;
    let highestScore = 0;

    for (const topic of KNOWLEDGE_TOPICS) {
      let score = 0;

      // 1. Exact phrase match in keywords (very high weight)
      for (const kw of topic.keywords) {
        const cleanKw = kw.toLowerCase().trim();
        if (cleanQuery.includes(cleanKw) || cleanKw.includes(cleanQuery)) {
          score += 15;
        } else {
          // Check word overlap with keywords
          const kwWords = cleanKw.split(/\s+/).filter((w) => w.length > 2);
          const matchedKwWords = kwWords.filter((w) => queryWords.includes(w));
          if (matchedKwWords.length >= 2) {
            score += matchedKwWords.length * 3;
          }
        }
      }

      // 2. Token overlap match
      if (topic.tokens) {
        for (const token of topic.tokens) {
          if (queryWords.includes(token.toLowerCase())) {
            score += 2;
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = topic;
      }
    }

    // Require a minimum confidence score
    if (highestScore >= 3) {
      return bestMatch;
    }

    return null;
  }

  /**
   * Explain a verification verdict in natural language
   */
  explainVerdict({ verdict, details }) {
    if (verdict === "VALID") {
      return {
        verdict: "VALID",
        title: "Cryptographically Verified Authentic",
        explanation: `The uploaded PDF document was cryptographically verified against the Ethereum blockchain registry.

1. **Fingerprint Match (100%):** The SHA-256 hash calculated from your uploaded PDF (\`${details?.uploadedDocumentHash?.slice(0, 20)}...\`) is identical to the immutable on-chain fingerprint (\`${details?.registeredDocumentHash?.slice(0, 20)}...\`).
2. **Active Status:** The issuing institution (${details?.institutionName || "CredentialChain University"}) maintains this credential in an ACTIVE state.
3. **Proof of Integrity:** The document has not been altered by a single byte since its official issuance date.`,
        recommendation: "This academic credential is authenticated and can be trusted by employers and academic institutions."
      };
    } else if (verdict === "TAMPERED") {
      return {
        verdict: "TAMPERED",
        title: "Cryptographic Tamper Detected",
        explanation: `The cryptographic fingerprint of the document you uploaded does NOT match the official hash registered on the blockchain.

1. **Hash Mismatch:** The document's SHA-256 digest (\`${details?.uploadedDocumentHash?.slice(0, 20)}...\`) diverges completely from the on-chain registered record (\`${details?.registeredDocumentHash?.slice(0, 20)}...\`).
2. **Potential Cause:** Textual contents (such as grades, CGPA, student name, or issue date) have been modified or edited after the certificate was anchored.
3. **Security Assurance:** The blockchain registry prevents altered records from passing verification.`,
        recommendation: "Reject this document or request the original, unaltered digital PDF directly from the issuing university or student wallet."
      };
    } else if (verdict === "REVOKED") {
      return {
        verdict: "REVOKED",
        title: "Credential Officially Revoked",
        explanation: `This credential was officially revoked on the blockchain by the issuing educational authority.

1. **On-Chain Revocation:** The smart contract state for Credential ID **${details?.credentialId || "N/A"}** has been marked as REVOKED.
2. **Legal Validity:** The credential is no longer recognized as an active academic qualification.
3. **Audit Trail:** The revocation transaction and timestamp are permanently recorded on the blockchain ledger.`,
        recommendation: "Contact the issuing institution registrar for further clarification regarding the revocation status."
      };
    } else {
      return {
        verdict: "NOT_FOUND",
        title: "Document Not Found in Registry",
        explanation: `The uploaded document fingerprint is not registered on the CredentialChain blockchain network.

1. **Unregistered Hash:** The SHA-256 digest (\`${details?.uploadedDocumentHash?.slice(0, 20)}...\`) does not exist on the smart contract.
2. **Possible Causes:** The document was issued by an institution not participating in CredentialChain, or it has not yet been registered.`,
        recommendation: "Verify that you selected the correct institution registry and uploaded the original document."
      };
    }
  }

  /**
   * Optional OpenAI LLM Call with strictly grounded system prompt
   */
  async callOpenAI(userMessage, context) {
    if (!this.apiKey) return null;

    const systemPrompt = `You are CredentialChain AI, an intelligent assistant for the CredentialChain academic credential verification platform.
Principles:
- Blockchain and SHA-256 cryptographic hashing are the absolute TRUST LAYER (source of truth).
- You are the ASSISTANT LAYER providing clear, helpful natural language explanations.
- Never invent blockchain transactions, hashes, or credentials.
- If information is not provided in context, clearly state that you do not have enough verified information.
- Be concise, professional, and friendly.

Context:
${JSON.stringify(context, null, 2)}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.2
      })
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  }
}

module.exports = new AIService();
