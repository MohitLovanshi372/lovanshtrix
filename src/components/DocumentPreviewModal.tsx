import React from 'react';
import { AlertTriangle, Download, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { CertificateRecord, OfferLetterDocument } from '../types/lovanstrix';
import {
  downloadCertificatePdf,
  downloadOfferLetterPdf,
  formatOfficialDate,
} from '../utils/pdfGenerator';

interface DocumentPreviewModalProps {
  offerLetter?: OfferLetterDocument | null;
  certificate?: CertificateRecord | null;
  isDraftPreview?: boolean;
  onConfirmIssueDraft?: () => void;
  onClose: () => void;
  onVerifyRoute?: (certId: string) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  offerLetter,
  certificate,
  isDraftPreview = false,
  onConfirmIssueDraft,
  onClose,
  onVerifyRoute,
}) => {
  if (!offerLetter && !certificate) return null;

  const missingSignatory = offerLetter
    ? !offerLetter.signatoryName?.trim() || !offerLetter.signatoryDesignation?.trim()
    : certificate
    ? !certificate.signatoryName?.trim() || !certificate.signatoryDesignation?.trim()
    : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Official Document Preview"
    >
      <div className="relative w-full max-w-4xl rounded-2xl border border-slate-700 bg-[#070C1B] text-slate-100 shadow-2xl overflow-hidden my-8">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#0B1224] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="font-display text-base font-bold text-white">
                {isDraftPreview ? 'Pre-Issuance Document Preview' : 'Official Issued Document'}
              </h2>
              <p className="text-xs text-slate-400">
                {offerLetter
                  ? `Offer Letter · ${offerLetter.offerNumber} (Version ${offerLetter.version})`
                  : `Completion Certificate · ${certificate?.id}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {offerLetter && !isDraftPreview && (
              <button
                type="button"
                onClick={() => downloadOfferLetterPdf(offerLetter)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Offer Letter PDF</span>
              </button>
            )}

            {certificate && !isDraftPreview && (
              <button
                type="button"
                onClick={() => downloadCertificatePdf(certificate)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Certificate PDF</span>
              </button>
            )}

            {isDraftPreview && onConfirmIssueDraft && (
              <button
                type="button"
                disabled={missingSignatory}
                onClick={onConfirmIssueDraft}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Confirm &amp; Officially Issue Document</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Close document preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Signatory Configuration Guard Notice */}
        {missingSignatory && (
          <div className="px-6 py-3.5 bg-amber-500/15 border-b border-amber-500/40 flex items-start gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                Configuration Required Before Final Issuance: Authorized Signatory Missing
              </p>
              <p className="mt-0.5 text-amber-200/90">
                Lovanstrix never fabricates a signatory name or designation. Please enter the real
                Authorized Signatory Name and Designation in the Admin Signatory Settings before
                issuing this document.
              </p>
            </div>
          </div>
        )}

        {/* Document Body Preview */}
        <div className="p-6 sm:p-10 max-h-[75vh] overflow-y-auto">
          {offerLetter && (
            <div className="bg-white text-slate-900 rounded-xl border border-slate-300 p-8 sm:p-10 space-y-6 shadow-inner">
              {/* Letterhead */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 pb-6">
                <div>
                  <p className="font-display text-2xl font-bold tracking-tight text-slate-950">
                    LOVANSTRIX
                  </p>
                  <p className="text-xs font-medium text-blue-700">
                    Ideas Into Innovation. · Technology &amp; Digital Engineering Venture
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-700 sm:text-right space-y-0.5">
                  <p>
                    <strong>Offer No:</strong> {offerLetter.offerNumber} (v{offerLetter.version})
                  </p>
                  <p>
                    <strong>Issue Date:</strong> {formatOfficialDate(offerLetter.issueDate)}
                  </p>
                  <p>
                    <strong>Application Ref:</strong> {offerLetter.referenceNumber}
                  </p>
                </div>
              </div>

              {offerLetter.status === 'Revoked' && (
                <div className="p-3 rounded-lg bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold">
                  REVOKED OFFER LETTER — Reason: {offerLetter.revokedReason || 'Revoked by Admin'}
                </div>
              )}

              <div>
                <h3 className="font-display text-lg font-bold uppercase tracking-wide text-slate-900">
                  Internship Offer Letter
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  To: <strong>{offerLetter.candidateName}</strong> ({offerLetter.candidateEmail})
                </p>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                Dear <strong>{offerLetter.candidateName}</strong>, following our evaluation of your
                application (<span className="font-mono">{offerLetter.referenceNumber}</span>),
                Lovanstrix is pleased to offer you an internship position as{' '}
                <strong>{offerLetter.roleTitle}</strong> in the{' '}
                <strong>{offerLetter.department}</strong> department.
              </p>

              {/* Terms Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs">
                <div>
                  <span className="text-slate-500">Start Date:</span>{' '}
                  <strong className="text-slate-900">
                    {formatOfficialDate(offerLetter.startDate)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">End Date:</span>{' '}
                  <strong className="text-slate-900">
                    {formatOfficialDate(offerLetter.endDate)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Duration:</span>{' '}
                  <strong className="text-slate-900">{offerLetter.duration}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Work Mode:</span>{' '}
                  <strong className="text-slate-900">{offerLetter.workMode}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Stipend / Compensation Status:</span>{' '}
                  <strong className="text-slate-900">{offerLetter.stipendDetails}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Reporting Supervisor:</span>{' '}
                  <strong className="text-slate-900">
                    {offerLetter.supervisor || 'To Be Assigned at Onboarding'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Acceptance Deadline:</span>{' '}
                  <strong className="text-slate-900">
                    {formatOfficialDate(offerLetter.acceptanceDeadline)}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div>
                  <p className="font-bold text-slate-900 mb-2">
                    Responsibilities &amp; Learning Scope
                  </p>
                  <ul className="space-y-1 text-slate-700 list-disc pl-4">
                    {offerLetter.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                    {offerLetter.learningObjectives.map((l, i) => (
                      <li key={`learn-${i}`}>{l}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-2">Terms &amp; Conditions</p>
                  <ul className="space-y-1 text-slate-700 list-disc pl-4">
                    {offerLetter.termsAndConditions.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-xs">
                <div>
                  <p className="text-slate-500">Authorized Signatory, LOVANSTRIX</p>
                  <p className="font-bold text-slate-900 text-sm mt-1">
                    {offerLetter.signatoryName ||
                      '[CONFIGURATION PLACEHOLDER: Signatory Name Required]'}
                  </p>
                  <p className="text-slate-600">
                    {offerLetter.signatoryDesignation ||
                      '[CONFIGURATION PLACEHOLDER: Signatory Designation Required]'}
                  </p>
                </div>
                <div className="font-mono text-[11px] text-slate-500 sm:text-right">
                  <p>Verification Code: {offerLetter.verificationCode}</p>
                  <p>Status: {offerLetter.status}</p>
                </div>
              </div>
            </div>
          )}

          {certificate && (
            <div className="rounded-2xl border-2 border-blue-500/70 bg-gradient-to-br from-[#060B19] via-[#0B1224] to-[#120E2E] p-8 sm:p-12 text-center space-y-6">
              <div className="space-y-1">
                <p className="font-display text-xl font-bold tracking-widest text-white">
                  LOVANSTRIX
                </p>
                <p className="text-[11px] font-mono tracking-widest text-blue-400 uppercase">
                  Ideas Into Innovation
                </p>
              </div>

              {certificate.status === 'Revoked' && (
                <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-bold">
                  REVOKED CERTIFICATE — Reason: {certificate.revokedReason || 'Revoked by Admin'}
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  Certificate of Internship Completion
                </h3>
                <p className="text-xs text-slate-400">This is to certify that</p>
              </div>

              <p className="font-display text-2xl sm:text-3xl font-bold text-blue-400">
                {certificate.internName}
              </p>

              <p className="text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed">
                has completed the internship as <strong>{certificate.roleTitle}</strong> in the{' '}
                <strong>{certificate.department}</strong> track from{' '}
                <strong>{formatOfficialDate(certificate.startDate)}</strong> to{' '}
                <strong>{formatOfficialDate(certificate.endDate)}</strong>.
              </p>

              <div className="max-w-2xl mx-auto rounded-xl bg-[#050814]/80 border border-slate-800 p-4 text-xs text-slate-300 leading-relaxed">
                <strong className="text-blue-400">Approved Work Completed Summary:</strong>{' '}
                {certificate.workCompletedSummary}
              </div>

              <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs items-end text-left">
                <div className="space-y-1 font-mono text-[11px] text-slate-400">
                  <p>Certificate ID: {certificate.id}</p>
                  <p>Issue Date: {formatOfficialDate(certificate.issueDate)}</p>
                  <p>Status: {certificate.status}</p>
                </div>

                <div className="sm:text-center space-y-0.5">
                  <p className="font-bold text-white text-sm">
                    {certificate.signatoryName ||
                      '[CONFIGURATION PLACEHOLDER: Signatory Name]'}
                  </p>
                  <p className="text-blue-400">
                    {certificate.signatoryDesignation ||
                      '[CONFIGURATION PLACEHOLDER: Designation]'}
                  </p>
                  <p className="text-slate-500 text-[11px]">Authorized Signatory, LOVANSTRIX</p>
                </div>

                <div className="sm:text-right">
                  {onVerifyRoute && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onVerifyRoute(certificate.id);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      <span>Open Public Verification Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
