const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");

describe("AcademicCredentialRegistry Smart Contract", function () {
  let registry;
  let owner;
  let authorizedInstitution;
  let unauthorizedUser;
  let studentWallet;

  const defaultInstName = "CredentialChain Demo University";
  const dummyPdfBytes = Buffer.from("SAMPLE OFFICIAL TRANSCRIPT KESHAV DEMO 2026");
  const dummyDocHashHex = "0x" + crypto.createHash("sha256").update(dummyPdfBytes).digest("hex");
  
  const tamperedBytes = Buffer.from("SAMPLE TAMPERED TRANSCRIPT KESHAV DEMO 2026");
  const tamperedDocHashHex = "0x" + crypto.createHash("sha256").update(tamperedBytes).digest("hex");

  beforeEach(async function () {
    [owner, authorizedInstitution, unauthorizedUser, studentWallet] = await ethers.getSigners();

    const RegistryFactory = await ethers.getContractFactory("AcademicCredentialRegistry");
    registry = await RegistryFactory.deploy(defaultInstName);
    await registry.waitForDeployment();

    // Authorize institution
    await registry.authorizeIssuer(authorizedInstitution.address, "State University of Technology");
  });

  describe("Deployment and Authorization", function () {
    it("should set deployer as authorized issuer with default institution name", async function () {
      const [isAuth, name] = await registry.isIssuerAuthorized(owner.address);
      expect(isAuth).to.equal(true);
      expect(name).to.equal(defaultInstName);
    });

    it("should allow owner to authorize and deauthorize institutions", async function () {
      const [isAuth1, name1] = await registry.isIssuerAuthorized(authorizedInstitution.address);
      expect(isAuth1).to.equal(true);
      expect(name1).to.equal("State University of Technology");

      await registry.deauthorizeIssuer(authorizedInstitution.address);
      const [isAuth2] = await registry.isIssuerAuthorized(authorizedInstitution.address);
      expect(isAuth2).to.equal(false);
    });

    it("should reject unauthorized callers from authorizing institutions", async function () {
      await expect(
        registry.connect(unauthorizedUser).authorizeIssuer(unauthorizedUser.address, "Fake University")
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });
  });

  describe("Credential Issuance", function () {
    it("should issue an academic credential with correct cryptographic hash", async function () {
      const credId = "CRED-2026-TEST-001";
      const credType = "Academic Transcript";

      const tx = await registry.connect(authorizedInstitution).issueCredential(
        credId,
        dummyDocHashHex,
        credType,
        studentWallet.address,
        "ipfs://sample-metadata-uri"
      );

      await expect(tx)
        .to.emit(registry, "CredentialIssued")
        .withArgs(credId, dummyDocHashHex, authorizedInstitution.address, (val) => val > 0, credType);

      const cred = await registry.getCredential(credId);
      expect(cred.credentialId).to.equal(credId);
      expect(cred.documentHash).to.equal(dummyDocHashHex);
      expect(cred.issuer).to.equal(authorizedInstitution.address);
      expect(cred.credentialType).to.equal(credType);
      expect(cred.status).to.equal(0); // ACTIVE
      expect(cred.recipient).to.equal(studentWallet.address);

      expect(await registry.getTotalCredentials()).to.equal(1);
    });

    it("should prevent unauthorized entities from issuing credentials", async function () {
      await expect(
        registry.connect(unauthorizedUser).issueCredential(
          "CRED-FAKE",
          dummyDocHashHex,
          "Degree Certificate",
          studentWallet.address,
          ""
        )
      ).to.be.revertedWith("AcademicCredentialRegistry: Caller is not an authorized issuer or contract owner");
    });

    it("should prevent duplicate credential IDs", async function () {
      await registry.issueCredential(
        "CRED-DUP-1",
        dummyDocHashHex,
        "Academic Transcript",
        studentWallet.address,
        ""
      );

      const otherHash = "0x" + crypto.createHash("sha256").update("DIFFERENT CONTENT").digest("hex");

      await expect(
        registry.issueCredential(
          "CRED-DUP-1",
          otherHash,
          "Academic Transcript",
          studentWallet.address,
          ""
        )
      ).to.be.revertedWith("Credential ID already exists");
    });

    it("should prevent duplicate document hashes", async function () {
      await registry.issueCredential(
        "CRED-FIRST",
        dummyDocHashHex,
        "Academic Transcript",
        studentWallet.address,
        ""
      );

      await expect(
        registry.issueCredential(
          "CRED-SECOND",
          dummyDocHashHex,
          "Academic Transcript",
          studentWallet.address,
          ""
        )
      ).to.be.revertedWith("Document hash already registered to another credential");
    });
  });

  describe("Verification and Tamper Detection", function () {
    const credId = "CRED-VERIFY-001";

    beforeEach(async function () {
      await registry.issueCredential(
        credId,
        dummyDocHashHex,
        "Academic Transcript",
        studentWallet.address,
        ""
      );
    });

    it("should verify authentic document hash as valid and active", async function () {
      const result = await registry.verifyCredential(credId, dummyDocHashHex);
      expect(result.isValid).to.equal(true);
      expect(result.status).to.equal(0); // ACTIVE
      expect(result.issuer).to.equal(owner.address);
    });

    it("should detect tampered document hash as invalid", async function () {
      const result = await registry.verifyCredential(credId, tamperedDocHashHex);
      expect(result.isValid).to.equal(false);
      expect(result.status).to.equal(0); // Record is active, but hash doesn't match
    });

    it("should lookup credential by document hash", async function () {
      const [found, foundId] = await registry.getCredentialByHash(dummyDocHashHex);
      expect(found).to.equal(true);
      expect(foundId).to.equal(credId);

      const [notFound] = await registry.getCredentialByHash(tamperedDocHashHex);
      expect(notFound).to.equal(false);
    });
  });

  describe("Revocation Workflow", function () {
    const credId = "CRED-REVOKE-001";

    beforeEach(async function () {
      await registry.connect(authorizedInstitution).issueCredential(
        credId,
        dummyDocHashHex,
        "Degree Certificate",
        studentWallet.address,
        ""
      );
    });

    it("should allow issuer to revoke credential", async function () {
      const tx = await registry.connect(authorizedInstitution).revokeCredential(credId, "Administrative correction");
      await expect(tx)
        .to.emit(registry, "CredentialRevoked")
        .withArgs(credId, authorizedInstitution.address, (val) => val > 0, "Administrative correction");

      const cred = await registry.getCredential(credId);
      expect(cred.status).to.equal(1); // REVOKED
      expect(cred.revokedAt).to.be.greaterThan(0);

      // Verifying a revoked credential must return isValid = false and status = REVOKED
      const verifyResult = await registry.verifyCredential(credId, dummyDocHashHex);
      expect(verifyResult.isValid).to.equal(false);
      expect(verifyResult.status).to.equal(1); // REVOKED
    });

    it("should allow contract owner to revoke credential", async function () {
      await registry.revokeCredential(credId, "Compliance audit revocation");
      const cred = await registry.getCredential(credId);
      expect(cred.status).to.equal(1);
    });

    it("should prevent unauthorized entities from revoking", async function () {
      await expect(
        registry.connect(unauthorizedUser).revokeCredential(credId, "Malicious attempt")
      ).to.be.revertedWith("Only the issuing institution or contract owner can revoke this credential");
    });
  });
});
