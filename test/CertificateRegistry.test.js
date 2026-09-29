const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  let registry;
  let owner;
  let nonOwner;

  const sampleCertId = "CERT-2026-000001";
  const sampleStudentName = "Alice Smith";
  const sampleCourse = "Computer Science";
  const sampleInstitution = "Stanford University";
  const sampleHash = ethers.keccak256(ethers.toUtf8Bytes("Sample PDF Content"));

  beforeEach(async function () {
    [owner, nonOwner] = await ethers.getSigners();
    const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    registry = await CertificateRegistry.deploy();
    await registry.waitForDeployment();
  });

  it("should set the deployer as owner", async function () {
    expect(await registry.owner()).to.equal(owner.address);
  });

  it("should allow owner to issue a certificate successfully", async function () {
    await expect(
      registry.issueCertificate(
        sampleCertId,
        sampleStudentName,
        sampleCourse,
        sampleInstitution,
        sampleHash
      )
    )
      .to.emit(registry, "CertificateIssued")
      .withArgs(sampleCertId, sampleHash);

    // Verify lookup by certId
    const cert = await registry.getCertificate(sampleCertId);
    expect(cert.certId).to.equal(sampleCertId);
    expect(cert.studentName).to.equal(sampleStudentName);
    expect(cert.course).to.equal(sampleCourse);
    expect(cert.institution).to.equal(sampleInstitution);
    expect(cert.pdfHash).to.equal(sampleHash);
    expect(cert.exists).to.equal(true);

    // Verify lookup by hash
    const [valid, certByHash] = await registry.verifyByHash(sampleHash);
    expect(valid).to.equal(true);
    expect(certByHash.certId).to.equal(sampleCertId);
  });

  it("should revert if duplicate certId is used", async function () {
    await registry.issueCertificate(
      sampleCertId,
      sampleStudentName,
      sampleCourse,
      sampleInstitution,
      sampleHash
    );

    const differentHash = ethers.keccak256(ethers.toUtf8Bytes("Other Content"));
    await expect(
      registry.issueCertificate(
        sampleCertId,
        "Bob Jones",
        "Data Science",
        "MIT",
        differentHash
      )
    ).to.be.revertedWith("Certificate ID already exists");
  });

  it("should revert if duplicate pdfHash is used", async function () {
    await registry.issueCertificate(
      sampleCertId,
      sampleStudentName,
      sampleCourse,
      sampleInstitution,
      sampleHash
    );

    await expect(
      registry.issueCertificate(
        "CERT-2026-000002",
        "Bob Jones",
        "Data Science",
        "MIT",
        sampleHash
      )
    ).to.be.revertedWith("PDF hash already registered");
  });

  it("should revert if non-owner tries to issue a certificate", async function () {
    await expect(
      registry
        .connect(nonOwner)
        .issueCertificate(
          sampleCertId,
          sampleStudentName,
          sampleCourse,
          sampleInstitution,
          sampleHash
        )
    ).to.be.revertedWith("Only owner can perform this action");
  });
});
