const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const hashService = require("./hashService");

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = null;
    this.abi = null;
    this.isInitialized = false;
    this.initError = null;

    this.init();
  }

  init() {
    try {
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
      const privateKey = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.signer = new ethers.Wallet(privateKey, this.provider);

      // Attempt to load contract address and ABI from contractConfig.json
      const configPath = path.join(__dirname, "../config/contractConfig.json");
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        this.contractAddress = process.env.CONTRACT_ADDRESS || config.contractAddress;
        this.abi = config.abi;
      } else {
        this.contractAddress = process.env.CONTRACT_ADDRESS || null;
      }

      if (this.contractAddress && this.abi && this.abi.length > 0) {
        this.contract = new ethers.Contract(this.contractAddress, this.abi, this.signer);
        this.isInitialized = true;
        this.initError = null;
        console.log(` BlockchainService initialized with contract at: ${this.contractAddress}`);
      } else {
        this.initError = "Contract address or ABI not yet loaded. Ensure deploy script has run.";
        console.warn(`⚠️ BlockchainService: ${this.initError}`);
      }
    } catch (err) {
      this.initError = err.message;
      console.error("❌ BlockchainService initialization error:", err.message);
    }
  }

  /**
   * Reload contract configuration (useful right after deployment)
   */
  reloadConfig() {
    this.init();
    return this.isInitialized;
  }

  /**
   * Check live connection health for Hardhat node, contract, and signer
   */
  async getHealth() {
    try {
      if (!this.provider) {
        return {
          blockchain: "disconnected",
          contract: "not_configured",
          error: "RPC Provider not configured"
        };
      }

      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      let contractStatus = "not_found";

      if (this.contractAddress) {
        const code = await this.provider.getCode(this.contractAddress);
        if (code && code !== "0x") {
          contractStatus = "deployed";
        }
      }

      return {
        blockchain: "connected",
        contract: contractStatus,
        contractAddress: this.contractAddress,
        networkName: network.name === "unknown" ? "Hardhat Local" : network.name,
        chainId: Number(network.chainId),
        latestBlock: blockNumber,
        issuerWallet: this.signer ? this.signer.address : null
      };
    } catch (err) {
      return {
        blockchain: "error",
        contract: "unknown",
        error: err.message
      };
    }
  }

  _ensureContract() {
    if (!this.isInitialized || !this.contract) {
      this.reloadConfig();
      if (!this.contract) {
        throw new Error("Smart contract is not deployed or initialized yet. Please deploy the contract first.");
      }
    }
  }

  /**
   * Issue a credential directly on the blockchain
   */
  async issueCredentialOnChain(credentialId, documentHashHex, credentialType, recipientAddress, metadataURI = "") {
    this._ensureContract();

    const bytes32Hash = hashService.toBytes32(documentHashHex);
    const validRecipient = recipientAddress && ethers.isAddress(recipientAddress)
      ? recipientAddress
      : ethers.ZeroAddress;

    console.log(`[Blockchain] Submitting issueCredential: ID=${credentialId}, Hash=${bytes32Hash}`);

    const tx = await this.contract.issueCredential(
      credentialId,
      bytes32Hash,
      credentialType,
      validRecipient,
      metadataURI
    );

    console.log(`[Blockchain] Tx sent: ${tx.hash}. Waiting for confirmation...`);
    const receipt = await tx.wait(1);

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      issuer: this.signer.address,
      issuedAt: Math.floor(Date.now() / 1000)
    };
  }

  /**
   * Revoke a credential on the blockchain
   */
  async revokeCredentialOnChain(credentialId, reason = "Administrative revocation") {
    this._ensureContract();

    console.log(`[Blockchain] Submitting revokeCredential: ID=${credentialId}, Reason=${reason}`);

    const tx = await this.contract.revokeCredential(credentialId, reason);
    const receipt = await tx.wait(1);

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      revokedAt: Math.floor(Date.now() / 1000)
    };
  }

  /**
   * Fetch a single credential directly from the smart contract
   */
  async getCredentialFromChain(credentialId) {
    this._ensureContract();

    try {
      const cred = await this.contract.getCredential(credentialId);
      const rawHash = cred.documentHash;
      // remove leading 0x for clean hex
      const cleanHex = rawHash.startsWith("0x") ? rawHash.slice(2) : rawHash;

      return {
        credentialId: cred.credentialId,
        documentHash: cleanHex,
        documentHashBytes32: rawHash,
        issuer: cred.issuer,
        issuedAt: Number(cred.issuedAt),
        revokedAt: Number(cred.revokedAt),
        credentialType: cred.credentialType,
        status: cred.status === 0n || cred.status === 0 ? "ACTIVE" : "REVOKED",
        statusCode: Number(cred.status),
        recipient: cred.recipient,
        metadataURI: cred.metadataURI
      };
    } catch (err) {
      if (err.message && err.message.includes("Credential does not exist")) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Verify credential hash against blockchain
   */
  async verifyCredentialOnChain(credentialId, documentHashHex) {
    this._ensureContract();

    const bytes32Hash = hashService.toBytes32(documentHashHex);
    const result = await this.contract.verifyCredential(credentialId, bytes32Hash);

    const isValid = result[0];
    const statusNumber = Number(result[1]);
    const status = statusNumber === 0 ? "ACTIVE" : "REVOKED";
    const issuer = result[2];
    const issuedAt = Number(result[3]);
    const revokedAt = Number(result[4]);
    const credentialType = result[5];

    return {
      isValid,
      status,
      statusCode: statusNumber,
      issuer,
      issuedAt,
      revokedAt,
      credentialType
    };
  }

  /**
   * Look up a credential ID given a document hash
   */
  async getCredentialByHashFromChain(documentHashHex) {
    this._ensureContract();

    const bytes32Hash = hashService.toBytes32(documentHashHex);
    const [found, credentialId] = await this.contract.getCredentialByHash(bytes32Hash);

    return {
      found,
      credentialId: found ? credentialId : null
    };
  }

  /**
   * Get all registered credential IDs from the blockchain
   */
  async getAllCredentialIdsFromChain() {
    this._ensureContract();
    const ids = await this.contract.getAllCredentialIds();
    return ids;
  }
}

module.exports = new BlockchainService();
