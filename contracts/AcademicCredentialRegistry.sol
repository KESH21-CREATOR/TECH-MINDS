// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AcademicCredentialRegistry
 * @dev Cryptographic registry for verifying educational credentials off-chain via SHA-256 document fingerprints.
 * No private student data (grades, PII) is stored on-chain to preserve privacy and comply with data protection regulations.
 */
contract AcademicCredentialRegistry is Ownable {

    enum CredentialStatus { ACTIVE, REVOKED }

    struct Credential {
        string credentialId;
        bytes32 documentHash;
        address issuer;
        uint256 issuedAt;
        uint256 revokedAt;
        string credentialType;
        CredentialStatus status;
        address recipient;
        string metadataURI; // Optional decentralized link / off-chain reference
    }

    struct IssuerInfo {
        string institutionName;
        bool isAuthorized;
        uint256 authorizedAt;
    }

    // Mapping from credential ID to Credential record
    mapping(string => Credential) private _credentials;
    
    // Mapping from document hash to credential ID (ensures hash uniqueness/lookup)
    mapping(bytes32 => string) private _hashToCredentialId;

    // Mapping of authorized institutions
    mapping(address => IssuerInfo) private _authorizedIssuers;

    // Array of all credential IDs for registry indexing
    string[] private _credentialIds;

    // Events
    event CredentialIssued(
        string indexed credentialId,
        bytes32 indexed documentHash,
        address indexed issuer,
        uint256 timestamp,
        string credentialType
    );

    event CredentialRevoked(
        string indexed credentialId,
        address indexed issuer,
        uint256 timestamp,
        string reason
    );

    event IssuerAuthorized(address indexed issuer, string institutionName);
    event IssuerDeauthorized(address indexed issuer);

    modifier onlyAuthorizedIssuer() {
        require(
            _authorizedIssuers[msg.sender].isAuthorized || msg.sender == owner(),
            "AcademicCredentialRegistry: Caller is not an authorized issuer or contract owner"
        );
        _;
    }

    constructor(string memory defaultInstitutionName) Ownable(msg.sender) {
        _authorizedIssuers[msg.sender] = IssuerInfo({
            institutionName: defaultInstitutionName,
            isAuthorized: true,
            authorizedAt: block.timestamp
        });
        emit IssuerAuthorized(msg.sender, defaultInstitutionName);
    }

    /**
     * @notice Authorize an educational institution to issue credentials
     */
    function authorizeIssuer(address issuer, string memory institutionName) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");
        require(bytes(institutionName).length > 0, "Institution name required");
        
        _authorizedIssuers[issuer] = IssuerInfo({
            institutionName: institutionName,
            isAuthorized: true,
            authorizedAt: block.timestamp
        });

        emit IssuerAuthorized(issuer, institutionName);
    }

    /**
     * @notice Deauthorize an institution
     */
    function deauthorizeIssuer(address issuer) external onlyOwner {
        require(_authorizedIssuers[issuer].isAuthorized, "Issuer not authorized");
        _authorizedIssuers[issuer].isAuthorized = false;
        emit IssuerDeauthorized(issuer);
    }

    /**
     * @notice Check if an address is an authorized issuing institution
     */
    function isIssuerAuthorized(address issuer) external view returns (bool, string memory) {
        if (issuer == owner() && !_authorizedIssuers[issuer].isAuthorized) {
            return (true, "Contract Owner / Root Authority");
        }
        return (_authorizedIssuers[issuer].isAuthorized, _authorizedIssuers[issuer].institutionName);
    }

    /**
     * @notice Issue a new cryptographic academic credential
     * @param credentialId Unique alphanumeric ID (e.g. CRED-2026-001)
     * @param documentHash SHA-256 hash of the authentic document in bytes32
     * @param credentialType Name of credential ("Academic Transcript", "Degree Certificate", "Migration Certificate")
     * @param recipient Optional student wallet address
     * @param metadataURI Off-chain metadata URI reference
     */
    function issueCredential(
        string memory credentialId,
        bytes32 documentHash,
        string memory credentialType,
        address recipient,
        string memory metadataURI
    ) external onlyAuthorizedIssuer {
        require(bytes(credentialId).length > 0, "Credential ID cannot be empty");
        require(documentHash != bytes32(0), "Document hash cannot be zero");
        require(_credentials[credentialId].issuedAt == 0, "Credential ID already exists");
        require(bytes(_hashToCredentialId[documentHash]).length == 0, "Document hash already registered to another credential");

        Credential memory newCred = Credential({
            credentialId: credentialId,
            documentHash: documentHash,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revokedAt: 0,
            credentialType: credentialType,
            status: CredentialStatus.ACTIVE,
            recipient: recipient,
            metadataURI: metadataURI
        });

        _credentials[credentialId] = newCred;
        _hashToCredentialId[documentHash] = credentialId;
        _credentialIds.push(credentialId);

        emit CredentialIssued(credentialId, documentHash, msg.sender, block.timestamp, credentialType);
    }

    /**
     * @notice Revoke an issued credential (only issuer or contract owner can revoke)
     * @param credentialId Credential ID to revoke
     * @param reason Reason for revocation
     */
    function revokeCredential(string memory credentialId, string memory reason) external {
        Credential storage cred = _credentials[credentialId];
        require(cred.issuedAt > 0, "Credential does not exist");
        require(cred.status == CredentialStatus.ACTIVE, "Credential already revoked");
        require(
            msg.sender == cred.issuer || msg.sender == owner(),
            "Only the issuing institution or contract owner can revoke this credential"
        );

        cred.status = CredentialStatus.REVOKED;
        cred.revokedAt = block.timestamp;

        emit CredentialRevoked(credentialId, msg.sender, block.timestamp, reason);
    }

    /**
     * @notice Retrieve credential details by ID
     */
    function getCredential(string memory credentialId) external view returns (Credential memory) {
        Credential memory cred = _credentials[credentialId];
        require(cred.issuedAt > 0, "Credential does not exist");
        return cred;
    }

    /**
     * @notice Verify an uploaded document hash against registered credential record
     * @param credentialId The claimed credential ID
     * @param documentHash The computed SHA-256 fingerprint of the presented document
     */
    function verifyCredential(
        string memory credentialId,
        bytes32 documentHash
    ) external view returns (
        bool isValid,
        CredentialStatus status,
        address issuer,
        uint256 issuedAt,
        uint256 revokedAt,
        string memory credentialType
    ) {
        Credential memory cred = _credentials[credentialId];
        if (cred.issuedAt == 0) {
            return (false, CredentialStatus.REVOKED, address(0), 0, 0, "");
        }

        bool hashMatches = (cred.documentHash == documentHash);
        bool active = (cred.status == CredentialStatus.ACTIVE);

        return (
            hashMatches && active,
            cred.status,
            cred.issuer,
            cred.issuedAt,
            cred.revokedAt,
            cred.credentialType
        );
    }

    /**
     * @notice Lookup credential ID directly by document hash
     */
    function getCredentialByHash(bytes32 documentHash) external view returns (bool found, string memory credentialId) {
        string memory id = _hashToCredentialId[documentHash];
        if (bytes(id).length > 0) {
            return (true, id);
        }
        return (false, "");
    }

    /**
     * @notice Total number of registered credentials
     */
    function getTotalCredentials() external view returns (uint256) {
        return _credentialIds.length;
    }

    /**
     * @notice Get all credential IDs
     */
    function getAllCredentialIds() external view returns (string[] memory) {
        return _credentialIds;
    }
}
