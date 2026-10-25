import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Download,
  Eye,
  FileText,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import {
  downloadCertificatePdf,
  downloadOfferLetterPdf,
  formatOfficialDate
} from "../utils/pdfGenerator";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
const StudentDashboardSection = ({
  initialEmail = "",
  initialReference = "",
  initialAccessKey = "",
  isDark,
  onNavigateInternships,
  onNavigateVerifyCertificate
}) => {
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [referenceInput, setReferenceInput] = useState(initialReference || initialAccessKey);
  const [studentToken, setStudentToken] = useState(
    () => sessionStorage.getItem("lx_student_session_token") || ""
  );
  const [studentEmail, setStudentEmail] = useState(
    () => sessionStorage.getItem("lx_student_session_email") || ""
  );
  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [previewOffer, setPreviewOffer] = useState(null);
  const [previewCert, setPreviewCert] = useState(null);
  const fetchStudentApplications = async (tokenToUse) => {
    if (!tokenToUse) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const resp = await fetch("/api/student/me", {
        headers: {
          Authorization: `Bearer ${tokenToUse}`
        }
      });
      if (resp.status === 401) {
        sessionStorage.removeItem("lx_student_session_token");
        sessionStorage.removeItem("lx_student_session_email");
        setStudentToken("");
        setPortalData(null);
        setLoading(false);
        return;
      }
      const data = await resp.json();
      if (resp.ok) {
        setPortalData({
          applications: data.applications || [],
          offerLetters: data.offerLetters || [],
          certificates: data.certificates || []
        });
      } else {
        setErrorMsg(data.error || "Could not load student dashboard.");
      }
    } catch {
      setErrorMsg("Network error while connecting to Student Portal API.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (studentToken) {
      fetchStudentApplications(studentToken);
    }
  }, [studentToken]);
  useEffect(() => {
    if (initialEmail) setEmailInput(initialEmail);
    if (initialReference) setReferenceInput(initialReference);
  }, [initialEmail, initialReference]);
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!emailInput.trim() || !referenceInput.trim()) {
      setErrorMsg(
        "Please enter both your registered Email Address and your Application Reference Number (or Access Key)."
      );
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          referenceOrAccessKey: referenceInput.trim()
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        setErrorMsg(
          data.error || "No matching application found for that Email and Reference Number / Access Key."
        );
      } else {
        sessionStorage.setItem("lx_student_session_token", data.token);
        sessionStorage.setItem("lx_student_session_email", data.email);
        setStudentToken(data.token);
        setStudentEmail(data.email);
        await fetchStudentApplications(data.token);
      }
    } catch {
      setErrorMsg("Failed to connect to student authentication service.");
    } finally {
      setLoading(false);
    }
  };
  const handleWithdrawApplication = async (appId) => {
    if (!studentToken) return;
    try {
      const resp = await fetch(`/api/student/applications/${appId}/withdraw`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${studentToken}`
        }
      });
      if (resp.ok) {
        await fetchStudentApplications(studentToken);
      }
    } catch {
      setErrorMsg("Could not withdraw application.");
    }
  };
  const handleLogout = () => {
    sessionStorage.removeItem("lx_student_session_token");
    sessionStorage.removeItem("lx_student_session_email");
    setStudentToken("");
    setStudentEmail("");
    setPortalData(null);
  };
  return <div className="space-y-12">
      {
    /* Top Bar */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticated Student Portal · Route: /student-dashboard</span>
          </div>
          <h1
    className={`font-display text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}
  >
            Student Internship &amp; Document Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
    type="button"
    onClick={onNavigateInternships}
    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${isDark ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}
  >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Internships (/internships)</span>
          </button>

          {studentToken && <button
    type="button"
    onClick={handleLogout}
    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
  >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>}
        </div>
      </div>

      {
    /* Authentication Gate if not logged in */
  }
      {!studentToken ? <div className="max-w-lg mx-auto py-8">
          <div
    className={`rounded-2xl border p-8 space-y-6 ${isDark ? "bg-[#0B1224] border-slate-800" : "bg-white border-slate-200"}`}
  >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <KeyRound className="w-4 h-4" />
                <span>Applicant Scoped Access Verification</span>
              </div>
              <h2
    className={`font-display text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
  >
                Sign In to View Your Applications &amp; Documents
              </h2>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Enter the Email Address and Application Reference Number (e.g.,{" "}
                <code className="font-mono">LX-INT-2026-...</code>) or Student Access Key issued
                when you submitted your application. Students can only access their own records.
              </p>
            </div>

            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">
                  Registered Applicant Email *
                </label>
                <input
    type="email"
    required
    value={emailInput}
    onChange={(e) => setEmailInput(e.target.value)}
    placeholder="ananya@university.edu"
    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">
                  Application Reference Number or Access Key *
                </label>
                <input
    type="text"
    required
    value={referenceInput}
    onChange={(e) => setReferenceInput(e.target.value)}
    placeholder="LX-INT-2026-..."
    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm font-mono ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
              </div>

              {errorMsg && <div
    role="alert"
    className="flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300"
  >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>}

              <button
    type="submit"
    disabled={loading}
    className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
  >
                {loading ? "Verifying Credentials..." : "Access My Student Dashboard"}
              </button>
            </form>
          </div>
        </div> : loading && !portalData ? <div className="py-16 text-center text-sm text-slate-400">
          Loading your authenticated applications and documents...
        </div> : <div className="space-y-8">
          {
    /* Signed-in Applicant Banner */
  }
          <div
    className={`rounded-2xl border p-5 flex flex-wrap items-center justify-between gap-4 text-xs ${isDark ? "bg-[#090F21] border-slate-800" : "bg-slate-50 border-slate-200"}`}
  >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Authenticated Student Session: <strong>{studentEmail}</strong>
              </span>
            </div>
            <span className="text-slate-400">
              Privacy Scope: Strictly isolated to your own applications &amp; issued documents
            </span>
          </div>

          {!portalData || portalData.applications.length === 0 ? <div
    className={`rounded-2xl border p-12 text-center ${isDark ? "bg-[#0B1224] border-slate-800" : "bg-white border-slate-200"}`}
  >
              <p className="text-sm font-semibold">No Applications Found for This Account</p>
              <button
    type="button"
    onClick={onNavigateInternships}
    className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
  >
                Browse Internships
              </button>
            </div> : portalData.applications.map((app) => {
    const issuedOffers = portalData.offerLetters.filter(
      (o) => o.applicationId === app.id && o.status === "Issued"
    );
    const issuedCerts = portalData.certificates.filter(
      (c) => c.applicationId === app.id && c.status === "Valid"
    );
    return <article
      key={app.id}
      className={`rounded-2xl border p-7 space-y-6 ${isDark ? "bg-[#0B1224] border-slate-800" : "bg-white border-slate-200"}`}
    >
                  {
      /* Application Header & Status */
    }
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/70 pb-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-blue-400 font-mono mb-1">
                        <span>Ref: {app.referenceNumber}</span>
                        <span aria-hidden="true">·</span>
                        <span>{app.department}</span>
                        <span aria-hidden="true">·</span>
                        <span>Submitted {formatOfficialDate(app.createdAt)}</span>
                      </div>
                      <h2
      className={`font-display text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
    >
                        {app.roleTitle}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${app.status === "Selected" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : app.status === "Shortlisted" ? "border-blue-500/40 bg-blue-500/10 text-blue-300" : app.status === "Rejected" || app.status === "Withdrawn" ? "border-rose-500/40 bg-rose-500/10 text-rose-300" : "border-slate-700 bg-slate-800/80 text-slate-200"}`}
    >
                        Status: {app.status}
                      </span>

                      {app.status !== "Withdrawn" && app.status !== "Rejected" && !app.completionApproved && <button
      type="button"
      onClick={() => handleWithdrawApplication(app.id)}
      className="text-xs text-slate-400 hover:text-rose-400 underline"
    >
                            Withdraw
                          </button>}
                    </div>
                  </div>

                  {
      /* Status Stepper */
    }
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {[
      "Submitted",
      "Under Review",
      "Shortlisted",
      "Selected",
      app.completionApproved ? "Completed" : "In Progress"
    ].map((stepLabel, idx) => {
      const statusOrder = [
        "Submitted",
        "Under Review",
        "Shortlisted",
        "Selected"
      ];
      const currentIdx = statusOrder.indexOf(app.status);
      const reached = idx <= currentIdx || idx === 4 && app.completionApproved;
      return <div
        key={stepLabel}
        className={`rounded-lg border p-2.5 text-center font-medium ${reached ? "border-blue-500/50 bg-blue-500/10 text-blue-300" : isDark ? "border-slate-800 bg-[#050814] text-slate-500" : "border-slate-200 bg-slate-50 text-slate-400"}`}
      >
                          0{idx + 1}. {stepLabel}
                        </div>;
    })}
                  </div>

                  {
      /* Internship Dates, Supervisor & Progress Info */
    }
                  <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-xl border p-4 text-xs ${isDark ? "bg-[#050814] border-slate-800" : "bg-slate-50 border-slate-200"}`}
    >
                    <div>
                      <span className="text-slate-400 block">Internship Dates:</span>
                      <strong className={isDark ? "text-slate-200" : "text-slate-800"}>
                        {app.officialStartDate ? `${formatOfficialDate(app.officialStartDate)} \u2013 ${formatOfficialDate(
      app.officialEndDate
    )}` : `Preferred: ${formatOfficialDate(app.preferredStartDate)}`}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Assigned Supervisor:</span>
                      <strong className={isDark ? "text-slate-200" : "text-slate-800"}>
                        {app.assignedSupervisor || "Assigned upon selection"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Progress Status:</span>
                      <strong className={isDark ? "text-slate-200" : "text-slate-800"}>
                        {app.progressStatus}
                        {app.completionApproved ? " (Completion Verified)" : ""}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Private Resume on File:</span>
                      <strong className={isDark ? "text-slate-200" : "text-slate-800"}>
                        {app.hasPrivateResume ? `${app.resumeFileName} (Protected)` : app.portfolioUrl || "Provided"}
                      </strong>
                    </div>
                  </div>

                  {
      /* Assigned Tasks (if configured by Admin) */
    }
                  {app.assignedTasks && app.assignedTasks.length > 0 && <div className="space-y-2.5">
                      <h3 className="text-xs font-semibold text-blue-400">
                        Assigned Internship Tasks &amp; Milestones
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {app.assignedTasks.map((task) => <div
      key={task.id}
      className={`rounded-xl border p-3.5 text-xs flex items-start justify-between gap-3 ${isDark ? "bg-[#050814] border-slate-800" : "bg-slate-50 border-slate-200"}`}
    >
                            <div>
                              <p className="font-semibold">{task.title}</p>
                              {task.description && <p className="text-slate-400 mt-0.5">{task.description}</p>}
                            </div>
                            <span className="font-mono text-[11px] text-blue-400 shrink-0">
                              {task.status}
                            </span>
                          </div>)}
                      </div>
                    </div>}

                  {
      /* Official Documents Section (Offer Letters & Completion Certificates) */
    }
                  <div className="pt-4 border-t border-slate-800/70 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {
      /* Offer Letter Card */
    }
                    <div
      className={`rounded-xl border p-5 space-y-3 ${isDark ? "bg-[#050814] border-slate-800" : "bg-slate-50 border-slate-200"}`}
    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-blue-400">
                          <FileText className="w-4 h-4" />
                          <span>Official Offer Letter</span>
                        </span>
                        <span className="text-slate-400">
                          {issuedOffers.length > 0 ? "Issued & Available" : "Pending Approval"}
                        </span>
                      </div>

                      {issuedOffers.length === 0 ? <p className="text-xs text-slate-400 leading-relaxed">
                          An official offer letter will appear here once your application is
                          selected and an administrator issues the verified document.
                        </p> : issuedOffers.map((offer) => <div key={offer.id} className="space-y-3 pt-1">
                            <div className="text-xs space-y-0.5">
                              <p className="font-mono text-slate-200">
                                {offer.offerNumber} (Version {offer.version})
                              </p>
                              <p className="text-slate-400">
                                Issued on {formatOfficialDate(offer.issueDate)}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
      type="button"
      onClick={() => setPreviewOffer(offer)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-medium"
    >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                                <span>Preview Offer Letter</span>
                              </button>
                              <button
      type="button"
      onClick={() => downloadOfferLetterPdf(offer)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
    >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PDF</span>
                              </button>
                            </div>
                          </div>)}
                    </div>

                    {
      /* Completion Certificate Card */
    }
                    <div
      className={`rounded-xl border p-5 space-y-3 ${isDark ? "bg-[#050814] border-slate-800" : "bg-slate-50 border-slate-200"}`}
    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-blue-400">
                          <Award className="w-4 h-4" />
                          <span>Completion Certificate</span>
                        </span>
                        <span className="text-slate-400">
                          {issuedCerts.length > 0 ? "Verified & Issued" : app.completionApproved ? "Completion Approved \xB7 Awaiting Issuance" : "Requires Verified Completion"}
                        </span>
                      </div>

                      {issuedCerts.length === 0 ? <p className="text-xs text-slate-400 leading-relaxed">
                          Completion certificates are never issued automatically upon application or
                          selection. They become available here only after an administrator verifies
                          that you completed the internship and issues the certificate.
                        </p> : issuedCerts.map((cert) => <div key={cert.id} className="space-y-3 pt-1">
                            <div className="text-xs space-y-0.5">
                              <p className="font-mono text-slate-200">ID: {cert.id}</p>
                              <p className="text-slate-400">
                                Issued on {formatOfficialDate(cert.issueDate)}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
      type="button"
      onClick={() => setPreviewCert(cert)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-medium"
    >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                                <span>Preview Certificate</span>
                              </button>
                              <button
      type="button"
      onClick={() => downloadCertificatePdf(cert)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
    >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PDF</span>
                              </button>
                              <button
      type="button"
      onClick={() => onNavigateVerifyCertificate(cert.id)}
      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline ml-1"
    >
                                <span>Verify Link</span>
                              </button>
                            </div>
                          </div>)}
                    </div>
                  </div>
                </article>;
  })}
        </div>}

      {
    /* Document Preview Modal */
  }
      {(previewOffer || previewCert) && <DocumentPreviewModal
    offerLetter={previewOffer}
    certificate={previewCert}
    onClose={() => {
      setPreviewOffer(null);
      setPreviewCert(null);
    }}
    onVerifyRoute={(certId) => onNavigateVerifyCertificate(certId)}
  />}
    </div>;
};
export {
  StudentDashboardSection
};
