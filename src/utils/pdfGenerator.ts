import { jsPDF } from 'jspdf';
import { CertificateRecord, OfferLetterDocument } from '../types/lovanstrix';

/**
 * Formats any ISO or YYYY-MM-DD date string into "21 October 2026" format.
 */
export function formatOfficialDate(dateStr?: string): string {
  if (!dateStr) return 'Not Specified';
  // If already formatted like "21 October 2026", return as-is
  if (/^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(dateStr.trim())) {
    return dateStr.trim();
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Draws a deterministic verification matrix (QR-style visual code) in jsPDF
 * representing the verification identifier.
 */
function drawVerificationMatrix(doc: jsPDF, code: string, x: number, y: number, size: number) {
  const cells = 9;
  const cellSize = size / cells;
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.3);
  doc.rect(x, y, size, size);

  let hash = 2166136261;
  for (let i = 0; i < code.length; i++) {
    hash ^= code.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const isCornerFinder =
        (r < 3 && c < 3) || (r < 3 && c >= cells - 3) || (r >= cells - 3 && c < 3);
      const bit = ((hash >> ((r * cells + c) % 28)) & 1) === 1;
      if (isCornerFinder || bit) {
        doc.setFillColor(15, 23, 42);
        doc.rect(x + c * cellSize, y + r * cellSize, cellSize, cellSize, 'F');
      }
    }
  }
}

/**
 * Generates and downloads an official Lovanstrix Offer Letter PDF.
 */
export function downloadOfferLetterPdf(offer: OfferLetterDocument): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Top Brand Header Band
  doc.setFillColor(7, 12, 29);
  doc.rect(0, 0, 210, 34, 'F');

  // Geometric Lovanstrix Emblem in Header
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.8);
  doc.line(16, 11, 22, 7.5);
  doc.line(22, 7.5, 28, 11);
  doc.line(28, 11, 28, 19);
  doc.line(28, 19, 22, 22.5);
  doc.line(22, 22.5, 16, 19);
  doc.line(16, 19, 16, 11);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LOVANSTRIX', 33, 15.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(147, 197, 253);
  doc.text('Ideas Into Innovation. | Technology & Digital Engineering Venture', 33, 21.5);

  // Document Ref & Issue Date on Right
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Offer No: ${offer.offerNumber} (v${offer.version})`, 194, 14, { align: 'right' });
  doc.text(`Issue Date: ${formatOfficialDate(offer.issueDate)}`, 194, 20, { align: 'right' });
  doc.text(`Application Ref: ${offer.referenceNumber}`, 194, 26, { align: 'right' });

  // Revoked Watermark if Revoked
  if (offer.status === 'Revoked') {
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`REVOKED DOCUMENT — Reason: ${offer.revokedReason || 'Issued in error'}`, 16, 43);
  }

  let y = offer.status === 'Revoked' ? 50 : 45;

  // Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('INTERNSHIP OFFER LETTER', 16, y);

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Candidate Name: ${offer.candidateName}`, 16, y);
  y += 5.5;
  doc.text(`Email: ${offer.candidateEmail}`, 16, y);

  y += 9;
  const introText = `Dear ${offer.candidateName},\n\nFollowing our review of your application (${offer.referenceNumber}), Lovanstrix is pleased to offer you an internship opportunity as ${offer.roleTitle} within the ${offer.department} track. This internship is structured to provide practical project experience, mentorship, and engineering skill development.`;
  const splitIntro = doc.splitTextToSize(introText, 178);
  doc.text(splitIntro, 16, y);
  y += splitIntro.length * 5 + 4;

  // Structured Terms Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(16, y, 178, 42, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 58, 138);
  doc.text('KEY INTERNSHIP DETAILS', 21, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Role & Department: ${offer.roleTitle} (${offer.department})`, 21, y + 14);
  doc.text(`Start Date: ${formatOfficialDate(offer.startDate)}`, 21, y + 20);
  doc.text(`End Date: ${formatOfficialDate(offer.endDate)}`, 110, y + 20);
  doc.text(`Duration: ${offer.duration}`, 21, y + 26);
  doc.text(`Work Mode: ${offer.workMode}`, 110, y + 26);
  doc.text(`Stipend / Status: ${offer.stipendDetails}`, 21, y + 32);
  doc.text(
    `Supervisor: ${offer.supervisor || 'Assigned Project Mentor'} | Acceptance Deadline: ${formatOfficialDate(
      offer.acceptanceDeadline
    )}`,
    21,
    y + 38
  );

  y += 50;

  // Responsibilities & Learning Objectives
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Responsibilities & Learning Objectives:', 16, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const combinedPoints = [
    ...offer.responsibilities.slice(0, 3),
    ...offer.learningObjectives.slice(0, 2),
  ];
  combinedPoints.forEach((pt) => {
    const lines = doc.splitTextToSize(`• ${pt}`, 176);
    doc.text(lines, 18, y);
    y += lines.length * 4.5 + 1;
  });

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Terms & Conditions:', 16, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  offer.termsAndConditions.slice(0, 4).forEach((term) => {
    const lines = doc.splitTextToSize(`• ${term}`, 176);
    doc.text(lines, 18, y);
    y += lines.length * 4.2 + 1;
  });

  // Signatory & Verification Footer
  const footerY = Math.max(y + 10, 240);
  doc.setDrawColor(203, 213, 225);
  doc.line(16, footerY - 4, 194, footerY - 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized Signatory — LOVANSTRIX', 16, footerY + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    offer.signatoryName || '[CONFIGURATION PLACEHOLDER: Signatory Name]',
    16,
    footerY + 9
  );
  doc.text(
    offer.signatoryDesignation || '[CONFIGURATION PLACEHOLDER: Designation]',
    16,
    footerY + 14
  );

  // Verification Matrix
  drawVerificationMatrix(doc, offer.verificationCode, 172, footerY, 20);
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Verification Code: ${offer.verificationCode}`, 168, footerY + 8, { align: 'right' });
  doc.text('Issued electronically via Lovanstrix Portal', 168, footerY + 13, { align: 'right' });

  doc.save(`${offer.offerNumber}_${offer.candidateName.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generates and downloads an official Lovanstrix Certificate of Internship Completion PDF.
 */
export function downloadCertificatePdf(cert: CertificateRecord): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Deep Navy Outer Frame
  doc.setFillColor(6, 11, 25);
  doc.rect(0, 0, 297, 210, 'F');

  // Double Architectural Border
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1.2);
  doc.rect(10, 10, 277, 190);

  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.4);
  doc.rect(13, 13, 271, 184);

  // Brand Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('LOVANSTRIX', 148.5, 32, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(147, 197, 253);
  doc.text('IDEAS INTO INNOVATION', 148.5, 38.5, { align: 'center' });

  if (cert.status === 'Revoked') {
    doc.setTextColor(248, 113, 113);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(
      `REVOKED CERTIFICATE — ${cert.revokedReason || 'Revoked by Administrator'}`,
      148.5,
      48,
      { align: 'center' }
    );
  }

  // Certificate Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('Certificate of Internship Completion', 148.5, 58, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(203, 213, 225);
  doc.text('This is to certify that', 148.5, 72, { align: 'center' });

  // Intern Full Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(96, 165, 250);
  doc.text(cert.internName, 148.5, 85, { align: 'center' });

  // Role, Department & Dates
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  doc.setTextColor(241, 245, 249);
  const roleLine = `has completed the internship as ${cert.roleTitle} (${cert.department})`;
  doc.text(roleLine, 148.5, 98, { align: 'center' });

  doc.setFontSize(10.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Internship Period: ${formatOfficialDate(cert.startDate)} to ${formatOfficialDate(cert.endDate)}`,
    148.5,
    106.5,
    { align: 'center' }
  );

  // Approved Summary of Work Completed
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  const summaryLines = doc.splitTextToSize(
    `Work Completed Summary: ${cert.workCompletedSummary}`,
    220
  );
  doc.text(summaryLines, 148.5, 120, { align: 'center' });

  // Bottom Metadata, Signatory & Verification Block
  const bottomY = 160;
  doc.setDrawColor(51, 65, 85);
  doc.line(26, bottomY - 5, 271, bottomY - 5);

  // Left: Certificate ID & Issue Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Certificate ID: ${cert.id}`, 26, bottomY + 3);
  doc.text(`Certificate No: ${cert.certificateNumber}`, 26, bottomY + 9);
  doc.text(`Issue Date: ${formatOfficialDate(cert.issueDate)}`, 26, bottomY + 15);
  doc.text(`Verify Online: ${cert.verificationUrl}`, 26, bottomY + 21);

  // Center-Right: Authorized Signatory
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(
    cert.signatoryName || '[CONFIGURATION PLACEHOLDER: Signatory Name]',
    185,
    bottomY + 6,
    { align: 'center' }
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(147, 197, 253);
  doc.text(
    cert.signatoryDesignation || '[CONFIGURATION PLACEHOLDER: Designation]',
    185,
    bottomY + 12,
    { align: 'center' }
  );
  doc.setTextColor(148, 163, 184);
  doc.text('Authorized Signatory, LOVANSTRIX', 185, bottomY + 18, { align: 'center' });

  // Far Right: Verification Matrix on Light Pad
  doc.setFillColor(255, 255, 255);
  doc.rect(246, bottomY - 1, 24, 24, 'F');
  drawVerificationMatrix(doc, cert.id, 248, bottomY + 1, 20);

  doc.save(`${cert.id}_${cert.internName.replace(/\s+/g, '_')}.pdf`);
}
