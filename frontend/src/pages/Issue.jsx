import React, { useState, useEffect } from "react";
import {
  getContractWithSigner,
  getContractOwner,
  CONTRACT_ADDRESS,
} from "../lib/contract";
import { generateCertificatePdf, hashBuffer, downloadPdf } from "../lib/pdf";

function generateCertId() {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `CERT-${year}-${randomDigits}`;
}

export default function Issue({ account, onConnect }) {
  const today = new Date().toISOString().split("T")[0];

  const [certId, setCertId] = useState(generateCertId);
  const [studentName, setStudentName] = useState("");
  const [course, setCourse] = useState("");
  const [institution, setInstitution] = useState("");
  const [issueDate, setIssueDate] = useState(today);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  // Reset form to issue another certificate
  const handleReset = () => {
    setCertId(generateCertId());
    setStudentName("");
    setCourse("");
    setInstitution("");
    setIssueDate(today);
    setError("");
    setSuccessData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessData(null);

    if (!CONTRACT_ADDRESS) {
      setError("Contract address is not configured in .env");
      return;
    }

    if (!account) {
      setError("Please connect your wallet first.");
      return;
    }

    if (!studentName.trim() || !course.trim() || !institution.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // Verify connected account is contract owner
      const ownerAddress = await getContractOwner();
      if (ownerAddress.toLowerCase() !== account.toLowerCase()) {
        setError(
          `Unauthorized: Only the contract owner (${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}) can issue certificates.`
        );
        setLoading(false);
        return;
      }

      // Step 1: Generate PDF bytes client-side
      const pdfBytes = generateCertificatePdf({
        certId,
        studentName: studentName.trim(),
        course: course.trim(),
        institution: institution.trim(),
        issueDate,
      });

      // Step 2: Compute SHA-256 hash of the exact PDF bytes
      const pdfHash = await hashBuffer(pdfBytes);

      // Step 3: Register certificate on-chain
      const contract = await getContractWithSigner();
      const tx = await contract.issueCertificate(
        certId,
        studentName.trim(),
        course.trim(),
        institution.trim(),
        pdfHash
      );

      await tx.wait();

      // Step 4: Show success state with the exact same PDF bytes
      setSuccessData({
        certId,
        pdfBytes,
        txHash: tx.hash,
      });
    } catch (err) {
      const msg = err.reason || err.data?.message || err.message || "Failed to issue certificate.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (successData?.pdfBytes) {
      downloadPdf(successData.pdfBytes, `${successData.certId}.pdf`);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Issue Certificate</h1>
        <p className="text-sm text-gray-600 mt-1">
          Generate an authentic certificate, record its hash on Ethereum, and download the PDF.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      {successData ? (
        <div className="p-6 rounded-md bg-green-50 border border-green-200">
          <h2 className="text-base font-semibold text-green-900 mb-2">
            Certificate Issued Successfully
          </h2>
          <p className="text-sm text-green-800 mb-4">
            Certificate number: <span className="font-mono font-medium">{successData.certId}</span>
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            >
              Download PDF
            </button>
            <button
              onClick={handleReset}
              className="py-2 px-4 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium"
            >
              Issue Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-md p-6 bg-white space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate Number
            </label>
            <input
              type="text"
              readOnly
              value={certId}
              className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-sm text-gray-600 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alice Smith"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course / Program
            </label>
            <input
              type="text"
              placeholder="e.g. Advanced Blockchain Architecture"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution Name
            </label>
            <input
              type="text"
              placeholder="e.g. Stanford University"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          {!account && (
            <p className="text-xs text-gray-500">
              Wallet not connected. Click{" "}
              <button
                type="button"
                onClick={onConnect}
                className="text-blue-600 underline font-medium"
              >
                Connect Wallet
              </button>{" "}
              before issuing.
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Issuing Certificate..." : "Issue Certificate"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
