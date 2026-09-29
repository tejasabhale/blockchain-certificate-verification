import React, { useState } from "react";
import { getReadOnlyContract, CONTRACT_ADDRESS } from "../lib/contract";
import { hashFile } from "../lib/pdf";

export default function Verify() {
  const [tab, setTab] = useState("number"); // "number" | "pdf"
  const [certIdInput, setCertIdInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [verifiedCert, setVerifiedCert] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const resetResult = () => {
    setHasVerified(false);
    setVerifiedCert(null);
    setErrorMessage("");
  };

  const handleVerifyByNumber = async (e) => {
    e.preventDefault();
    resetResult();

    if (!CONTRACT_ADDRESS) {
      setErrorMessage("Contract address is not configured in .env");
      return;
    }

    if (!certIdInput.trim()) {
      setErrorMessage("Please enter a certificate number.");
      return;
    }

    setLoading(true);
    try {
      const contract = getReadOnlyContract();
      const cert = await contract.getCertificate(certIdInput.trim());

      setHasVerified(true);
      if (cert && cert.exists) {
        setVerifiedCert(cert);
      } else {
        setVerifiedCert(null);
      }
    } catch (err) {
      setHasVerified(true);
      setVerifiedCert(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyByPdf = async (e) => {
    e.preventDefault();
    resetResult();

    if (!CONTRACT_ADDRESS) {
      setErrorMessage("Contract address is not configured in .env");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("Please select a PDF certificate file.");
      return;
    }

    setLoading(true);
    try {
      // Compute SHA-256 hash using Web Crypto API in browser
      const fileHash = await hashFile(selectedFile);

      const contract = getReadOnlyContract();
      const [valid, cert] = await contract.verifyByHash(fileHash);

      setHasVerified(true);
      if (valid && cert && cert.exists) {
        setVerifiedCert(cert);
      } else {
        setVerifiedCert(null);
      }
    } catch (err) {
      setHasVerified(true);
      setVerifiedCert(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Verify Certificate</h1>
        <p className="text-sm text-gray-600 mt-1">
          Verify authenticity against the Ethereum blockchain using certificate ID or PDF document.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 text-sm">
        <button
          type="button"
          onClick={() => {
            setTab("number");
            resetResult();
          }}
          className={`py-2.5 px-4 font-medium border-b-2 -mb-px transition-colors ${
            tab === "number"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          By Certificate Number
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("pdf");
            resetResult();
          }}
          className={`py-2.5 px-4 font-medium border-b-2 -mb-px transition-colors ${
            tab === "pdf"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          By PDF Upload
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {/* Tab 1: By Certificate Number */}
      {tab === "number" && (
        <form
          onSubmit={handleVerifyByNumber}
          className="border border-gray-200 rounded-md p-6 bg-white space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate Number
            </label>
            <input
              type="text"
              placeholder="e.g. CERT-2026-123456"
              value={certIdInput}
              onChange={(e) => setCertIdInput(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:border-blue-600 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      )}

      {/* Tab 2: By PDF Upload */}
      {tab === "pdf" && (
        <form
          onSubmit={handleVerifyByPdf}
          className="border border-gray-200 rounded-md p-6 bg-white space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate PDF File
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                resetResult();
                setSelectedFile(e.target.files?.[0] || null);
              }}
              required
              className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              The PDF will be hashed locally in your browser. It is never uploaded to any server.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Computing Hash & Verifying..." : "Verify PDF"}
          </button>
        </form>
      )}

      {/* Verification Result */}
      {hasVerified && (
        <div className="mt-6">
          {verifiedCert ? (
            <div className="p-5 rounded-md bg-green-50 border border-green-200 text-green-900">
              <h2 className="text-sm font-semibold mb-3">Certificate is valid</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <dt className="text-green-700 font-medium">Certificate Number</dt>
                  <dd className="font-mono text-gray-900 mt-0.5">{verifiedCert.certId}</dd>
                </div>
                <div>
                  <dt className="text-green-700 font-medium">Student Name</dt>
                  <dd className="font-semibold text-gray-900 mt-0.5">{verifiedCert.studentName}</dd>
                </div>
                <div>
                  <dt className="text-green-700 font-medium">Course</dt>
                  <dd className="text-gray-900 mt-0.5">{verifiedCert.course}</dd>
                </div>
                <div>
                  <dt className="text-green-700 font-medium">Institution</dt>
                  <dd className="text-gray-900 mt-0.5">{verifiedCert.institution}</dd>
                </div>
                <div>
                  <dt className="text-green-700 font-medium">Issue Date</dt>
                  <dd className="text-gray-900 mt-0.5">
                    {new Date(Number(verifiedCert.issueDate) * 1000).toLocaleDateString()}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-green-700 font-medium">SHA-256 PDF Hash</dt>
                  <dd className="font-mono break-all text-gray-800 mt-0.5">{verifiedCert.pdfHash}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-900 text-sm">
              No matching certificate found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
