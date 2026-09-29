import { jsPDF } from "jspdf";

/**
 * Generates a clean, classic certificate PDF in A4 landscape.
 * Returns the raw ArrayBuffer so the exact same bytes are hashed and downloaded.
 */
export function generateCertificatePdf({ certId, studentName, course, institution, issueDate }) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Outer border
  doc.setDrawColor(209, 213, 219); // gray-300
  doc.setLineWidth(0.8);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Inner border
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.setLineWidth(0.4);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Institution Name (Top)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39); // gray-900
  doc.text(institution.toUpperCase(), pageWidth / 2, 45, { align: "center" });

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(75, 85, 99); // gray-600
  doc.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 58, { align: "center" });

  // Divider line
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.4);
  doc.line(pageWidth / 2 - 40, 65, pageWidth / 2 + 40, 65);

  // Certifying statement
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);
  doc.text("This is to certify that", pageWidth / 2, 85, { align: "center" });

  // Student Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(17, 24, 39);
  doc.text(studentName, pageWidth / 2, 105, { align: "center" });

  // Program statement
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);
  doc.text("has successfully completed the program", pageWidth / 2, 122, { align: "center" });

  // Course Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235); // blue-600 accent
  doc.text(course, pageWidth / 2, 138, { align: "center" });

  // Date of Issue (Bottom Left)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Date of Issue: ${issueDate}`, 25, 175);

  // Certificate ID (Bottom Right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Certificate ID: ${certId}`, pageWidth - 25, 175, { align: "right" });

  // Verification note (Bottom Center)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text("Secured and verified on Ethereum blockchain", pageWidth / 2, 192, { align: "center" });

  return doc.output("arraybuffer");
}

/**
 * Computes SHA-256 hash using the browser Web Crypto API.
 * Returns a 0x-prefixed hex string (bytes32 format).
 */
export async function hashBuffer(buffer) {
  const hashBuf = await crypto.subtle.digest("SHA-256", buffer);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return "0x" + hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Computes SHA-256 hash of an uploaded File object.
 */
export async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  return await hashBuffer(buffer);
}

/**
 * Triggers browser download of an ArrayBuffer as a PDF file.
 */
export function downloadPdf(buffer, filename) {
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
