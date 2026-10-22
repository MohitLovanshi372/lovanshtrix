import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { formatOfficialDate } from '../utils/pdfGenerator';

interface CertificateVerificationSectionProps {
  initialCertificateId?: string;
  isDark: boolean;
  onNavigateInternships: () => void;
}

interface PublicCertificateVerificationResult {
  lookupStatus: 'Valid' | 'Revoked' | 'Not Found';
  certificateId: string;
  certificateNumber?: string;
  internName?: string;
  roleTitle?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  issueDate?: string;
  status?: 'Valid' | 'Revoked';
  revokedReason?: string;
  revokedAt?: string;
}

export const CertificateVerificationSection: React.FC<CertificateVerificationSectionProps> = ({
  initialCertificateId = '',
  isDark,
  onNavigateInternships,
}) => {
  const [certIdInput, setCertIdInput] = useState(initialCertificateId);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<PublicCertificateVerificationResult | null>(null);

  const performVerification = async (idToQuery: string) => {
    const cleanId = idToQuery.trim();
    if (!cleanId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const resp = await fetch(`/api/verify-certificate/${encodeURIComponent(cleanId)}`);
      if (resp.status === 429) {
        setErrorMsg('Too many verification requests. Please wait a moment and try again.');
        setLoading(false);
        return;
      }
      const data = await resp.json();
      setResult(data);
    } catch {
      setErrorMsg('Unable to reach the Lovanstrix verification endpoint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCertificateId) {
      setCertIdInput(initialCertificateId);
      performVerification(initialCertificateId);
    }
  }, [initialCertificateId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certIdInput.trim()) {
      setErrorMsg('Please enter a Certificate ID to verify (e.g., LX-CERT-2026-...).');
      return;
    }
    performVerification(certIdInput);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Public Credential Verification · Route: /verify-certificate/:certificateId</span>
          </div>
          <h1
            className={`font-display text-3xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Verify Lovanstrix Internship Certificate
          </h1>
        </div>

        <button
          type="button"
          onClick={onNavigateInternships}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 self-start sm:self-center ${
            isDark
              ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Internship Portal</span>
        </button>
      </div>

      {/* Verification Search Form */}
      <form
        onSubmit={handleSubmit}
        className={`rounded-2xl border p-6 sm:p-8 space-y-4 ${
          isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <label htmlFor="verify-cert-input" className="block text-xs font-medium text-blue-400">
          Enter Official Certificate ID
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="verify-cert-input"
              type="text"
              value={certIdInput}
              onChange={(e) => setCertIdInput(e.target.value)}
              placeholder="e.g. LX-CERT-2026-9F4A2C8E"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-[#050814] border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            {loading ? 'Checking Registry...' : 'Verify Certificate'}
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Privacy Protection: Public verification returns only credential validity, intern name,
          role title, internship dates, and issue date. Personal contact details, resumes, and
          internal records are never exposed.
        </p>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>

      {/* Verification Result Card */}
      {result && (
        <div
          className={`rounded-2xl border p-7 sm:p-8 space-y-6 ${
            result.lookupStatus === 'Valid'
              ? isDark
                ? 'bg-emerald-950/20 border-emerald-500/50'
                : 'bg-emerald-50 border-emerald-300'
              : result.lookupStatus === 'Revoked'
              ? isDark
                ? 'bg-rose-950/25 border-rose-500/50'
                : 'bg-rose-50 border-rose-300'
              : isDark
              ? 'bg-[#0B1224] border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          {result.lookupStatus === 'Valid' && (
            <>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-mono text-emerald-400 uppercase">
                    Verified Authentic Credential · Status: VALID
                  </p>
                  <h2
                    className={`font-display text-2xl font-bold mt-0.5 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Certificate of Internship Completion
                  </h2>
                </div>
              </div>

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border p-5 text-xs ${
                  isDark ? 'bg-[#050814] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <span className="text-slate-400 block">Certificate ID:</span>
                  <strong className="font-mono text-blue-400">{result.certificateId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Certificate Status:</span>
                  <strong className="text-emerald-400">Valid &amp; Active</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Intern Full Name:</span>
                  <strong className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {result.internName}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Internship Title &amp; Track:</span>
                  <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                    {result.roleTitle} ({result.department})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Internship Dates:</span>
                  <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                    {formatOfficialDate(result.startDate)} – {formatOfficialDate(result.endDate)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Official Issue Date:</span>
                  <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                    {formatOfficialDate(result.issueDate)}
                  </strong>
                </div>
              </div>
            </>
          )}

          {result.lookupStatus === 'Revoked' && (
            <>
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-mono text-rose-400 uppercase">
                    Credential Status: REVOKED
                  </p>
                  <h2
                    className={`font-display text-2xl font-bold mt-0.5 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    This Certificate Has Been Revoked by Lovanstrix
                  </h2>
                </div>
              </div>

              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border p-5 text-xs ${
                  isDark ? 'bg-[#050814] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <span className="text-slate-400 block">Certificate ID:</span>
                  <strong className="font-mono text-rose-400">{result.certificateId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Certificate Status:</span>
                  <strong className="text-rose-400">Revoked</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Intern Name:</span>
                  <strong>{result.internName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Internship Title:</span>
                  <strong>{result.roleTitle}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block">Revocation Notice:</span>
                  <strong className="text-rose-300">
                    {result.revokedReason || 'Revoked by administrator'} (
                    {formatOfficialDate(result.revokedAt)})
                  </strong>
                </div>
              </div>
            </>
          )}

          {result.lookupStatus === 'Not Found' && (
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-mono text-slate-400 uppercase">
                  Credential Status: NOT FOUND
                </p>
                <h2
                  className={`font-display text-xl font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  No Certificate Record Matches &ldquo;{result.certificateId}&rdquo;
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Please check that the Certificate ID was entered accurately (for example,{' '}
                  <code className="font-mono">LX-CERT-2026-...</code>). Certificates are only
                  registered in this database after an authorized Lovanstrix administrator approves
                  internship completion and issues the document.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
