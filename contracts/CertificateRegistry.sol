// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateRegistry
 * @dev Stores certificate metadata and verification hashes on-chain.
 */
contract CertificateRegistry {
    // Contract deployer / authorized issuer
    address public owner;

    // Certificate data structure
    struct Certificate {
        string certId;
        string studentName;
        string course;
        string institution;
        uint256 issueDate;
        bytes32 pdfHash;
        bool exists;
    }

    // Lookup certificate details by certificate ID
    mapping(string => Certificate) public certificates;

    // Lookup certificate ID by its SHA-256 PDF hash
    mapping(bytes32 => string) public hashToCertId;

    // Event emitted when a new certificate is registered
    event CertificateIssued(string certId, bytes32 pdfHash);

    // Restrict function access to contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Issues a new certificate. Only callable by the owner.
     * Reverts if certId or pdfHash is already registered.
     */
    function issueCertificate(
        string memory certId,
        string memory studentName,
        string memory course,
        string memory institution,
        bytes32 pdfHash
    ) external onlyOwner {
        require(bytes(certId).length > 0, "Certificate ID cannot be empty");
        require(bytes(studentName).length > 0, "Student name cannot be empty");
        require(bytes(course).length > 0, "Course cannot be empty");
        require(bytes(institution).length > 0, "Institution cannot be empty");
        require(pdfHash != bytes32(0), "Invalid PDF hash");

        require(!certificates[certId].exists, "Certificate ID already exists");
        require(bytes(hashToCertId[pdfHash]).length == 0, "PDF hash already registered");

        certificates[certId] = Certificate({
            certId: certId,
            studentName: studentName,
            course: course,
            institution: institution,
            issueDate: block.timestamp,
            pdfHash: pdfHash,
            exists: true
        });

        hashToCertId[pdfHash] = certId;

        emit CertificateIssued(certId, pdfHash);
    }

    /**
     * @dev Retrieves a certificate by its certificate ID.
     */
    function getCertificate(string memory certId) external view returns (Certificate memory) {
        return certificates[certId];
    }

    /**
     * @dev Verifies a certificate by its PDF hash.
     * Returns whether the certificate exists and the certificate struct.
     */
    function verifyByHash(bytes32 pdfHash) external view returns (bool valid, Certificate memory cert) {
        string memory certId = hashToCertId[pdfHash];
        if (bytes(certId).length == 0) {
            return (false, certificates[""]);
        }
        Certificate memory foundCert = certificates[certId];
        return (foundCert.exists, foundCert);
    }
}
