import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle
} from "lucide-react";
import {
  downloadCertificatePdf,
  downloadOfferLetterPdf,
  formatOfficialDate
} from "../utils/pdfGenerator";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
const AdminInternshipsSection = ({
  isDark,
  onDataUpdated,
  onNavigateVerifyCertificate
}) => {
  const [activeTab, setActiveTab] = useState("applications");
  const [token, setToken] = useState(() => sessionStorage.getItem("lx_admin_token") || "");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [adminAccessUnavailable, setAdminAccessUnavailable] = useState(false);
  const [adminAccessMessage, setAdminAccessMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bannerMsg, setBannerMsg] = useState(null);
  const [company, setCompany] = useState(null);
  const [listings, setListings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [offerLetters, setOfferLetters] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [configStatus, setConfigStatus] = useState(null);
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryDesignation, setSignatoryDesignation] = useState("");
  const [defaultSupervisor, setDefaultSupervisor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [editSupervisor, setEditSupervisor] = useState("");
  const [editStartDate, setEditStartDate] = useState("01 November 2026");
  const [editEndDate, setEditEndDate] = useState("31 December 2026");
  const [editDuration, setEditDuration] = useState("8 Weeks");
  const [editWorkMode, setEditWorkMode] = useState("Remote");
  const [editStipend, setEditStipend] = useState(
    "Unpaid / Academic Learning Track (No Stipend)"
  );
  const [editAcceptanceDeadline, setEditAcceptanceDeadline] = useState("28 October 2026");
  const [editInternalNotes, setEditInternalNotes] = useState("");
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editWorkSummary, setEditWorkSummary] = useState("");
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReasonInput, setRevokeReasonInput] = useState("");
  const [modalOffer, setModalOffer] = useState(null);
  const [modalCert, setModalCert] = useState(null);
  const [modalIsDraft, setModalIsDraft] = useState(false);
  const [draftAppId, setDraftAppId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDept, setNewDept] = useState("Full-Stack Development");
  const [newWorkMode, setNewWorkMode] = useState("Remote");
  const [newCompType, setNewCompType] = useState(
    "Unpaid / Academic Learning"
  );
  const [newStipendDetails, setNewStipendDetails] = useState(
    "Unpaid project-based learning cohort."
  );
  const [newDuration, setNewDuration] = useState("8 Weeks");
  const [newWeekly, setNewWeekly] = useState("12\u201315 hours / week");
  const [newDeadline, setNewDeadline] = useState("30 November 2026");
  const [newPositions, setNewPositions] = useState("2");
  const [newStatus, setNewStatus] = useState("Open");
  const [newDesc, setNewDesc] = useState("");
  const [newEligibility, setNewEligibility] = useState(
    "CS/IT students or self-taught builders with core web fundamentals."
  );
  const [newSkills, setNewSkills] = useState("React, TypeScript, Node.js, Git");
  const [newObjectives, setNewObjectives] = useState(
    "Build modular TypeScript components\nCollaborate on API integration and validation"
  );
  const authHeaders = (overrideToken) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${overrideToken ?? token}`
  });
  const loadAdminInternshipData = async (activeToken) => {
    setLoading(true);
    try {
      const resp = await fetch("/api/admin/store", {
        headers: authHeaders(activeToken)
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.status === 503) {
        setAuthenticated(false);
        setPreviewMode(false);
        setAdminAccessUnavailable(true);
        setAdminAccessMessage(data.error || "Admin access is disabled until a strong server passcode is configured.");
        return;
      }
      if (resp.status === 401) {
        setAuthenticated(false);
        setPreviewMode(false);
        setAdminAccessUnavailable(false);
        setLoading(false);
        return;
      }
      if (resp.ok && data.store) {
        setAdminAccessUnavailable(false);
        setAdminAccessMessage(null);
        const st = data.store;
        setCompany(st.company);
        setSignatoryName(st.company.authorizedSignatoryName || "");
        setSignatoryDesignation(st.company.authorizedSignatoryDesignation || "");
        setDefaultSupervisor(st.company.officialSupervisorDefault || "");
        setListings(st.internshipListings || []);
        setApplications(st.internshipApplications || []);
        setOfferLetters(st.internshipDocuments || []);
        setCertificates(st.certificateRecords || []);
        setAuditLogs(st.adminAuditLogs || []);
        setConfigStatus(data.configStatus);
        setPreviewMode(!data.configStatus?.adminAuthConfigured);
        setAuthenticated(true);
      }
    } catch {
      setBannerMsg({ text: "Failed to load Admin Internship data.", isError: true });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAdminInternshipData(token);
  }, []);
  const selectedApplication = applications.find((a) => a.id === selectedAppId) || null;
  useEffect(() => {
    if (selectedApplication) {
      setEditSupervisor(
        selectedApplication.assignedSupervisor || defaultSupervisor || "Project Engineering Lead"
      );
      setEditStartDate(
        selectedApplication.officialStartDate || formatOfficialDate(selectedApplication.preferredStartDate) || "01 November 2026"
      );
      setEditEndDate(selectedApplication.officialEndDate || "31 December 2026");
      setEditDuration(selectedApplication.officialDuration || "8 Weeks");
      setEditWorkMode(selectedApplication.workMode || "Remote");
      setEditStipend(
        selectedApplication.stipendTerms || "Unpaid / Academic Learning Track (No Stipend Promised)"
      );
      setEditAcceptanceDeadline(
        selectedApplication.acceptanceDeadline || "28 October 2026"
      );
      setEditInternalNotes(selectedApplication.internalNotes || "");
      setEditWorkSummary(
        selectedApplication.completedWorkSummary || `Completed assigned ${selectedApplication.department} modules, code reviews, and technical documentation for the ${selectedApplication.roleTitle}.`
      );
    }
  }, [selectedAppId]);
  const showToast = (text, isError = false) => {
    setBannerMsg({ text, isError });
    onDataUpdated();
    setTimeout(() => setBannerMsg(null), 5e3);
  };
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcodeInput })
      });
      const data = await resp.json();
      if (!resp.ok) {
        const message = data.error || "Invalid administrator passcode.";
        if (resp.status === 503) setAdminAccessUnavailable(true);
        setAdminAccessMessage(message);
        showToast(message, true);
        return;
      }
      setAdminAccessUnavailable(false);
      setAdminAccessMessage(null);
      sessionStorage.setItem("lx_admin_token", data.token);
      setToken(data.token);
      setPreviewMode(false);
      setAuthenticated(true);
      await loadAdminInternshipData(data.token);
    } catch {
      showToast("Network error during login.", true);
    }
  };
  const handleSaveSignatory = async (e) => {
    e.preventDefault();
    const resp = await fetch("/api/admin/internships/signatory", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        authorizedSignatoryName: signatoryName.trim(),
        authorizedSignatoryDesignation: signatoryDesignation.trim(),
        officialSupervisorDefault: defaultSupervisor.trim()
      })
    });
    const data = await resp.json();
    if (resp.ok) {
      setCompany(data.company);
      setConfigStatus(data.configStatus);
      setAuditLogs(data.auditLogs || auditLogs);
      showToast("Authorized signatory and supervisor configuration saved.");
    } else {
      showToast(data.error || "Could not update signatory settings.", true);
    }
  };
  const handleUpdateListingStatus = async (listingId, status) => {
    const resp = await fetch(`/api/admin/internships/listings/${listingId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await resp.json();
    if (resp.ok) {
      setListings(data.listings);
      setAuditLogs(data.auditLogs || auditLogs);
      showToast(`Internship track status updated to ${status}.`);
    }
  };
  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    const resp = await fetch("/api/admin/internships/listings", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title: newTitle.trim(),
        department: newDept,
        description: newDesc.trim(),
        techStack: newSkills.split(",").map((s) => s.trim()).filter(Boolean),
        workMode: newWorkMode,
        compensationType: newCompType,
        stipendDetails: newStipendDetails.trim(),
        duration: newDuration.trim(),
        weeklyCommitment: newWeekly.trim(),
        eligibility: newEligibility.trim(),
        requiredSkills: newSkills.split(",").map((s) => s.trim()).filter(Boolean),
        responsibilities: newObjectives.split("\n").map((s) => s.trim()).filter(Boolean),
        learningObjectives: newObjectives.split("\n").map((s) => s.trim()).filter(Boolean),
        selectionCriteria: "Evaluated on technical fundamentals, portfolio/GitHub clarity, and learning commitment.",
        positionsCount: parseInt(newPositions, 10) || 2,
        deadline: newDeadline.trim(),
        status: newStatus
      })
    });
    const data = await resp.json();
    if (resp.ok) {
      setListings(data.listings);
      setAuditLogs(data.auditLogs || auditLogs);
      setNewTitle("");
      setNewDesc("");
      showToast("New internship listing created.");
    }
  };
  const handleSaveApplicationDetails = async (appId, newStatus2) => {
    const resp = await fetch(`/api/admin/internships/applications/${appId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({
        status: newStatus2,
        assignedSupervisor: editSupervisor,
        officialStartDate: editStartDate,
        officialEndDate: editEndDate,
        officialDuration: editDuration,
        workMode: editWorkMode,
        stipendTerms: editStipend,
        acceptanceDeadline: editAcceptanceDeadline,
        internalNotes: editInternalNotes,
        completedWorkSummary: editWorkSummary
      })
    });
    const data = await resp.json();
    if (resp.ok) {
      setApplications(data.applications);
      setAuditLogs(data.auditLogs || auditLogs);
      showToast(data.notice || "Application updated.");
    } else {
      showToast(data.error || "Failed to update application.", true);
    }
  };
  const handleAddTaskToApplication = async (appId) => {
    if (!editTaskTitle.trim()) return;
    const resp = await fetch(`/api/admin/internships/applications/${appId}/tasks`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title: editTaskTitle.trim(),
        description: "Assigned project milestone"
      })
    });
    const data = await resp.json();
    if (resp.ok) {
      setApplications(data.applications);
      setEditTaskTitle("");
      showToast("Task added to student internship dashboard.");
    }
  };
  const handleDownloadPrivateResume = async (appId, fileName) => {
    try {
      const resp = await fetch(`/api/admin/internships/applications/${appId}/resume`, {
        headers: authHeaders()
      });
      const data = await resp.json();
      if (!resp.ok || !data.base64) {
        showToast(data.error || "No private resume file stored for this applicant.", true);
        return;
      }
      const a = document.createElement("a");
      a.href = data.base64;
      a.download = fileName || data.fileName || "applicant_resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      showToast("Could not download private resume.", true);
    }
  };
  const handleOpenOfferLetterPreview = (app) => {
    const listing = listings.find((l) => l.id === app.listingId);
    const existingCount = offerLetters.filter((o) => o.applicationId === app.id).length;
    const draftOffer = {
      id: "PREVIEW-DRAFT",
      offerNumber: `LX-OFFER-2026-${String(101 + offerLetters.length)}`,
      version: existingCount + 1,
      applicationId: app.id,
      referenceNumber: app.referenceNumber,
      candidateName: app.fullName,
      candidateEmail: app.email,
      roleTitle: app.roleTitle,
      department: app.department,
      startDate: formatOfficialDate(editStartDate),
      endDate: formatOfficialDate(editEndDate),
      duration: editDuration,
      workMode: editWorkMode,
      stipendDetails: editStipend,
      responsibilities: listing?.responsibilities || [
        "Complete assigned engineering/design milestones and code reviews",
        "Collaborate with project supervisor and document deliverables"
      ],
      learningObjectives: listing?.learningObjectives || [
        "Apply modern web/software architectures in structured sprints"
      ],
      supervisor: editSupervisor || defaultSupervisor || "Assigned Mentor",
      termsAndConditions: [
        "This internship is an educational and project mentorship engagement with Lovanstrix.",
        "Issuance of this offer letter does not constitute a permanent employment contract or automatic certification.",
        "A Certificate of Internship Completion is issued strictly after verified completion of assigned project deliverables.",
        "Confidential company and project source code must not be shared publicly without authorization."
      ],
      acceptanceDeadline: formatOfficialDate(editAcceptanceDeadline),
      signatoryName: signatoryName.trim(),
      signatoryDesignation: signatoryDesignation.trim(),
      issueDate: formatOfficialDate((/* @__PURE__ */ new Date()).toISOString()),
      verificationCode: `LX-VRF-${app.referenceNumber}`,
      status: "Issued",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setDraftAppId(app.id);
    setModalIsDraft(true);
    setModalCert(null);
    setModalOffer(draftOffer);
  };
  const handleConfirmIssueOfferLetter = async () => {
    if (!draftAppId) return;
    const resp = await fetch(`/api/admin/internships/applications/${draftAppId}/issue-offer`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        startDate: formatOfficialDate(editStartDate),
        endDate: formatOfficialDate(editEndDate),
        duration: editDuration,
        workMode: editWorkMode,
        stipendDetails: editStipend,
        supervisor: editSupervisor || defaultSupervisor,
        acceptanceDeadline: formatOfficialDate(editAcceptanceDeadline)
      })
    });
    const data = await resp.json();
    if (!resp.ok) {
      showToast(data.error || "Could not issue offer letter.", true);
      return;
    }
    setApplications(data.applications);
    setOfferLetters(data.offerLetters);
    setAuditLogs(data.auditLogs);
    setModalIsDraft(false);
    setModalOffer(data.issuedOffer);
    showToast(data.notice || "Offer letter officially issued.");
  };
  const handleApproveCompletion = async (appId) => {
    if (!editWorkSummary.trim() || editWorkSummary.trim().length < 15) {
      showToast(
        "Please provide a verified Work Completed Summary (at least 15 characters) before approving completion.",
        true
      );
      return;
    }
    const resp = await fetch(
      `/api/admin/internships/applications/${appId}/approve-completion`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          completedWorkSummary: editWorkSummary.trim(),
          officialStartDate: formatOfficialDate(editStartDate),
          officialEndDate: formatOfficialDate(editEndDate)
        })
      }
    );
    const data = await resp.json();
    if (!resp.ok) {
      showToast(data.error || "Could not approve completion.", true);
      return;
    }
    setApplications(data.applications);
    setAuditLogs(data.auditLogs);
    showToast(data.notice || "Internship completion verified and approved.");
  };
  const handleOpenCertificatePreview = (app) => {
    if (!app.completionApproved) {
      showToast(
        "Completion must be verified and approved before previewing or issuing a certificate.",
        true
      );
      return;
    }
    const draftCert = {
      id: "LX-CERT-PREVIEW",
      certificateNumber: `LX-CERT-2026-${String(201 + certificates.length)}`,
      version: 1,
      applicationId: app.id,
      referenceNumber: app.referenceNumber,
      internName: app.fullName,
      roleTitle: app.roleTitle,
      department: app.department,
      startDate: formatOfficialDate(app.officialStartDate || editStartDate),
      endDate: formatOfficialDate(app.officialEndDate || editEndDate),
      issueDate: formatOfficialDate((/* @__PURE__ */ new Date()).toISOString()),
      workCompletedSummary: app.completedWorkSummary || editWorkSummary,
      signatoryName: signatoryName.trim(),
      signatoryDesignation: signatoryDesignation.trim(),
      verificationUrl: `${window.location.origin}/verify-certificate/LX-CERT-PREVIEW`,
      status: "Valid",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setDraftAppId(app.id);
    setModalIsDraft(true);
    setModalOffer(null);
    setModalCert(draftCert);
  };
  const handleConfirmIssueCertificate = async () => {
    if (!draftAppId) return;
    const resp = await fetch(
      `/api/admin/internships/applications/${draftAppId}/issue-certificate`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          workCompletedSummary: editWorkSummary.trim(),
          startDate: formatOfficialDate(editStartDate),
          endDate: formatOfficialDate(editEndDate)
        })
      }
    );
    const data = await resp.json();
    if (!resp.ok) {
      showToast(data.error || "Could not issue completion certificate.", true);
      return;
    }
    setApplications(data.applications);
    setCertificates(data.certificates);
    setAuditLogs(data.auditLogs);
    setModalIsDraft(false);
    setModalCert(data.issuedCertificate);
    showToast(data.notice || "Certificate of Internship Completion officially issued.");
  };
  const handleRevokeDocument = async (e) => {
    e.preventDefault();
    if (!revokeTarget || !revokeReasonInput.trim()) return;
    const endpoint = revokeTarget.type === "offer" ? `/api/admin/internships/offers/${revokeTarget.id}/revoke` : `/api/admin/internships/certificates/${revokeTarget.id}/revoke`;
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ reason: revokeReasonInput.trim() })
    });
    const data = await resp.json();
    if (resp.ok) {
      if (data.offerLetters) setOfferLetters(data.offerLetters);
      if (data.certificates) setCertificates(data.certificates);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      setRevokeTarget(null);
      setRevokeReasonInput("");
      showToast("Document revoked and recorded in the audit log.");
    } else {
      showToast(data.error || "Could not revoke document.", true);
    }
  };
  const handleExportApplicationsCsv = () => {
    if (applications.length === 0) {
      showToast("No applications to export yet.", true);
      return;
    }
    const headers = [
      "ReferenceNumber",
      "FullName",
      "Email",
      "Phone",
      "College",
      "CourseAndYear",
      "RoleTitle",
      "Department",
      "Status",
      "CompletionApproved",
      "SubmittedAt"
    ];
    const rows = applications.map(
      (a2) => [
        a2.referenceNumber,
        `"${a2.fullName.replace(/"/g, '""')}"`,
        a2.email,
        a2.phone || "",
        `"${a2.college.replace(/"/g, '""')}"`,
        `"${a2.courseAndYear.replace(/"/g, '""')}"`,
        `"${a2.roleTitle.replace(/"/g, '""')}"`,
        a2.department,
        a2.status,
        a2.completionApproved ? "Yes" : "No",
        a2.createdAt
      ].join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lovanstrix_internship_applications_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const filteredApplications = applications.filter((a) => {
    if (statusFilter !== "All" && a.status !== statusFilter) return false;
    if (deptFilter !== "All" && a.department !== deptFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.referenceNumber.toLowerCase().includes(q) || a.college.toLowerCase().includes(q);
    }
    return true;
  });
  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">
        Loading Secure Admin Internship Management Portal...
      </div>;
  }
  if (!authenticated) {
    return <div className="max-w-md mx-auto py-12">
        <div
      className={`rounded-2xl border p-8 space-y-5 ${isDark ? "bg-[#0B1224] border-slate-800" : "bg-white border-slate-200"}`}
    >
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
            <Lock className="w-4 h-4" />
            <span>Server-Side Administrator Authorization · /admin/internships</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Unlock Internship Admin</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter the server-configured <code className="font-mono">ADMIN_PASSCODE</code> to manage
            internship listings, review applications, and issue official offer letters or
            certificates.
          </p>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
      type="password"
      required
      disabled={adminAccessUnavailable}
      value={passcodeInput}
      onChange={(e) => setPasscodeInput(e.target.value)}
      placeholder="Enter ADMIN_PASSCODE"
      className={`w-full rounded-lg border px-3.5 py-2.5 text-sm ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
    />
            {adminAccessUnavailable && <p className={`rounded-lg border p-3 text-xs leading-relaxed ${isDark ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                {adminAccessMessage || "Admin sign-in is disabled until the site owner configures a strong ADMIN_PASSCODE in the server environment."}
              </p>}
            {adminAccessMessage && !adminAccessUnavailable && <p className="text-xs text-rose-500">{adminAccessMessage}</p>}
            <button
      type="submit"
      disabled={adminAccessUnavailable}
      className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 text-white text-xs font-semibold"
    >
              Verify &amp; Enter Admin Portal
            </button>
          </form>
        </div>
      </div>;
  }
  const signatoryReady = Boolean(signatoryName.trim() && signatoryDesignation.trim());
  return <div className="space-y-10">
      {
    /* Header */
  }
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>LOVANSTRIX Internship Operations · Route: /admin/internships</span>
          </div>
          <h1
    className={`font-display text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}
  >
            Internship Management, Offer Letters &amp; Certificates
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
    type="button"
    onClick={handleExportApplicationsCsv}
    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${isDark ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}
  >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Applications CSV</span>
          </button>

          <button
    type="button"
    onClick={() => loadAdminInternshipData()}
    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${isDark ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}
  >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {
    /* Preview Mode Security Disclosure */
  }
      {previewMode && <div
    className={`rounded-2xl border p-4 flex items-start gap-3 text-xs ${isDark ? "bg-amber-500/10 border-amber-500/30 text-amber-200" : "bg-amber-50 border-amber-200 text-amber-900"}`}
  >
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Preview Admin Mode Notice:</strong> <code className="font-mono">ADMIN_PASSCODE</code>{" "}
            is not yet configured on the server, so this portal is accessible for testing end-to-end
            application review, offer letter generation, completion verification, and certificate
            issuance. Set <code className="font-mono">ADMIN_PASSCODE</code> in <code className="font-mono">.env</code>{" "}
            to enforce server-side lock-down.
          </p>
        </div>}

      {bannerMsg && <div
    role="status"
    className={`rounded-xl border px-4 py-3 text-xs flex items-center gap-2 ${bannerMsg.isError ? "border-rose-500/40 bg-rose-500/10 text-rose-200" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"}`}
  >
          {bannerMsg.isError ? <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span>{bannerMsg.text}</span>
        </div>}

      {
    /* Official Signatory Configuration Panel (Required Before Issuing Official Documents) */
  }
      <form
    onSubmit={handleSaveSignatory}
    className={`rounded-2xl border p-6 space-y-4 ${isDark ? "bg-[#090F21] border-slate-800" : "bg-slate-50 border-slate-200"}`}
  >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold">
              Authorized Signatory &amp; Supervisor Configuration (Required for Document Issuance)
            </h2>
            <p className="text-xs text-slate-400">
              Lovanstrix never fabricates a signature or designation. Configure the authorized
              signatory below to unlock final Offer Letter and Certificate issuance.
            </p>
          </div>
          <span
    className={`text-xs font-semibold ${signatoryReady ? "text-emerald-400" : "text-amber-400"}`}
  >
            {signatoryReady ? "Signatory Configured \xB7 Issuance Unlocked" : "Placeholder Active \xB7 Enter Signatory to Issue Documents"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium mb-1">Authorized Signatory Name *</label>
            <input
    type="text"
    value={signatoryName}
    onChange={(e) => setSignatoryName(e.target.value)}
    placeholder="e.g. Mohit Lovanshi"
    className={`w-full rounded-lg border px-3 py-2 text-xs ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Signatory Designation *</label>
            <input
    type="text"
    value={signatoryDesignation}
    onChange={(e) => setSignatoryDesignation(e.target.value)}
    placeholder="e.g. Founder & Lead Engineer, Lovanstrix"
    className={`w-full rounded-lg border px-3 py-2 text-xs ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Default Internship Supervisor</label>
            <input
    type="text"
    value={defaultSupervisor}
    onChange={(e) => setDefaultSupervisor(e.target.value)}
    placeholder="e.g. Engineering Mentorship Lead"
    className={`w-full rounded-lg border px-3 py-2 text-xs ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
          </div>
          <button
    type="submit"
    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
  >
            <Save className="w-3.5 h-3.5" />
            <span>Save Signatory</span>
          </button>
        </div>
      </form>

      {
    /* Navigation Tabs */
  }
      <div
    className={`flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border ${isDark ? "bg-[#090F21] border-slate-800" : "bg-slate-100 border-slate-200"}`}
    role="tablist"
  >
        {[
    {
      id: "applications",
      label: `Applications & Review (${applications.length})`
    },
    {
      id: "listings",
      label: `Internship Listings (${listings.length})`
    },
    {
      id: "documents",
      label: `Issued Offer Letters & Certificates (${offerLetters.length + certificates.length})`
    },
    {
      id: "audit",
      label: `Security Audit Log (${auditLogs.length})`
    }
  ].map((t) => <button
    key={t.id}
    type="button"
    onClick={() => setActiveTab(t.id)}
    className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === t.id ? "bg-blue-600 text-white" : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
  >
            {t.label}
          </button>)}
      </div>

      {
    /* =====================================================================
        TAB 1: APPLICATIONS, SELECTION, OFFER LETTERS & CERTIFICATES
    ===================================================================== */
  }
      {activeTab === "applications" && <div className="space-y-6">
          {
    /* Search & Filters */
  }
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search name, email, ref, college..."
    className={`pl-8 pr-3 py-1.5 rounded-lg border text-xs ${isDark ? "bg-[#050814] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
              </div>

              <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className={`rounded-lg border px-3 py-1.5 text-xs ${isDark ? "bg-[#050814] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>

              <select
    value={deptFilter}
    onChange={(e) => setDeptFilter(e.target.value)}
    className={`rounded-lg border px-3 py-1.5 text-xs ${isDark ? "bg-[#050814] border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  >
                <option value="All">All Departments</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="Full-Stack Development">Full-Stack Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="AI/ML">AI/ML</option>
                <option value="IoT">IoT</option>
              </select>
            </div>

            <span className="text-xs font-mono text-slate-400 tabular-nums">
              Showing {filteredApplications.length} of {applications.length} applications
            </span>
          </div>

          {filteredApplications.length === 0 ? <div
    className={`rounded-2xl border p-12 text-center space-y-3 ${isDark ? "bg-[#0B1224] border-slate-800" : "bg-white border-slate-200"}`}
  >
              <p className="text-sm font-semibold">No Student Applications Found</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Publish a track to <strong>Open</strong> in the &ldquo;Internship Listings&rdquo; tab
                and submit a student application on <code className="font-mono">/internships</code>{" "}
                to test the complete review, offer letter, and certificate workflow.
              </p>
            </div> : <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {
    /* Left List of Applications */
  }
              <div className="lg:col-span-5 space-y-3">
                {filteredApplications.map((app) => {
    const isSelected = app.id === selectedAppId;
    return <button
      key={app.id}
      type="button"
      onClick={() => setSelectedAppId(app.id)}
      className={`w-full text-left rounded-2xl border p-5 transition-colors space-y-2 ${isSelected ? "border-blue-500 bg-blue-600/10" : isDark ? "bg-[#0B1224] border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"}`}
    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-blue-400">{app.referenceNumber}</span>
                        <span className="font-semibold text-slate-300">
                          {app.status}
                          {app.completionApproved ? " \xB7 Completed" : ""}
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold">{app.fullName}</h3>
                      <p className="text-xs text-slate-400 truncate">
                        {app.roleTitle} · {app.college}
                      </p>
                    </button>;
  })}
              </div>

              {
    /* Right Detailed Inspector & Document Generator */
  }
              <div className="lg:col-span-7">
                {!selectedApplication ? <div
    className={`rounded-2xl border p-12 text-center text-xs text-slate-400 ${isDark ? "bg-[#0B1224] border-slate-800" : "bg-white border-slate-200"}`}
  >
                    Select an applicant on the left to review their profile, update status, generate
                    an offer letter, or approve internship completion.
                  </div> : <div
    className={`rounded-2xl border p-6 sm:p-8 space-y-6 ${isDark ? "bg-[#0B1224] border-slate-800" : "bg-white border-slate-200"}`}
  >
                    {
    /* Applicant Profile Summary */
  }
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <p className="text-xs font-mono text-blue-400">
                          {selectedApplication.referenceNumber} · Submitted{" "}
                          {formatOfficialDate(selectedApplication.createdAt)}
                        </p>
                        <h2 className="font-display text-2xl font-bold mt-1">
                          {selectedApplication.fullName}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {selectedApplication.email}{" "}
                          {selectedApplication.phone ? `\xB7 ${selectedApplication.phone}` : ""}
                        </p>
                      </div>

                      {selectedApplication.hasPrivateResume && <button
    type="button"
    onClick={() => handleDownloadPrivateResume(
      selectedApplication.id,
      selectedApplication.resumeFileName
    )}
    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 text-xs font-semibold"
  >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Private Resume</span>
                        </button>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400">College / Institution:</span>{" "}
                        <strong>{selectedApplication.college}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Course &amp; Year:</span>{" "}
                        <strong>{selectedApplication.courseAndYear}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Track Applied:</span>{" "}
                        <strong>
                          {selectedApplication.roleTitle} ({selectedApplication.department})
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Availability:</span>{" "}
                        <strong>
                          {selectedApplication.availability} (Start:{" "}
                          {formatOfficialDate(selectedApplication.preferredStartDate)})
                        </strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400">Skills:</span>{" "}
                        <span className="font-mono">
                          {selectedApplication.skills.join(" \xB7 ")}
                        </span>
                      </div>
                      {selectedApplication.portfolioUrl && <div>
                          <span className="text-slate-400">Portfolio:</span>{" "}
                          <a
    href={selectedApplication.portfolioUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-400 underline"
  >
                            {selectedApplication.portfolioUrl}
                          </a>
                        </div>}
                      {selectedApplication.githubUrl && <div>
                          <span className="text-slate-400">GitHub:</span>{" "}
                          <a
    href={selectedApplication.githubUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-400 underline"
  >
                            {selectedApplication.githubUrl}
                          </a>
                        </div>}
                    </div>

                    <div
    className={`rounded-xl border p-3.5 text-xs leading-relaxed ${isDark ? "bg-[#050814] border-slate-800" : "bg-slate-50 border-slate-200"}`}
  >
                      <strong className="text-blue-400 block mb-1">Motivation Statement:</strong>
                      {selectedApplication.motivation}
                    </div>

                    {
    /* Selection Decision Buttons */
  }
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <p className="text-xs font-semibold text-blue-400">
                        1. Selection Status Decision
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
    "Submitted",
    "Under Review",
    "Shortlisted",
    "Selected",
    "Rejected",
    "Withdrawn"
  ].map((st) => <button
    key={st}
    type="button"
    onClick={() => handleSaveApplicationDetails(selectedApplication.id, st)}
    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${selectedApplication.status === st ? "bg-blue-600 border-blue-500 text-white" : isDark ? "bg-[#050814] border-slate-700 text-slate-300 hover:border-slate-500" : "bg-slate-100 border-slate-300 text-slate-700"}`}
  >
                            {st}
                          </button>)}
                      </div>
                    </div>

                    {
    /* Internship Terms, Dates, Supervisor & Internal Review Notes */
  }
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <p className="text-xs font-semibold text-blue-400">
                        2. Configure Internship Dates, Terms &amp; Internal Notes
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1">Start Date</label>
                          <input
    type="text"
    value={editStartDate}
    onChange={(e) => setEditStartDate(e.target.value)}
    placeholder="01 November 2026"
    className={`w-full rounded-lg border px-3 py-1.5 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">End Date</label>
                          <input
    type="text"
    value={editEndDate}
    onChange={(e) => setEditEndDate(e.target.value)}
    placeholder="31 December 2026"
    className={`w-full rounded-lg border px-3 py-1.5 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Duration</label>
                          <input
    type="text"
    value={editDuration}
    onChange={(e) => setEditDuration(e.target.value)}
    className={`w-full rounded-lg border px-3 py-1.5 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1">Work Mode</label>
                          <select
    value={editWorkMode}
    onChange={(e) => setEditWorkMode(e.target.value)}
    className={`w-full rounded-lg border px-3 py-1.5 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  >
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="On-Site">On-Site</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Assigned Supervisor</label>
                          <input
    type="text"
    value={editSupervisor}
    onChange={(e) => setEditSupervisor(e.target.value)}
    className={`w-full rounded-lg border px-3 py-1.5 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Acceptance Deadline</label>
                          <input
    type="text"
    value={editAcceptanceDeadline}
    onChange={(e) => setEditAcceptanceDeadline(e.target.value)}
    className={`w-full rounded-lg border px-3 py-1.5 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="block text-slate-400 mb-1">
                          Stipend / Compensation Terms Disclosed on Offer Letter
                        </label>
                        <input
    type="text"
    value={editStipend}
    onChange={(e) => setEditStipend(e.target.value)}
    className={`w-full rounded-lg border px-3 py-1.5 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
                      </div>

                      <div className="text-xs">
                        <label className="block text-slate-400 mb-1">
                          Private Admin Review Notes (Never exposed to student)
                        </label>
                        <textarea
    rows={2}
    value={editInternalNotes}
    onChange={(e) => setEditInternalNotes(e.target.value)}
    placeholder="Internal evaluation notes..."
    className={`w-full rounded-lg border px-3 py-1.5 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
                      </div>

                      {
    /* Assign Task Input */
  }
                      <div className="flex gap-2 text-xs">
                        <input
    type="text"
    value={editTaskTitle}
    onChange={(e) => setEditTaskTitle(e.target.value)}
    placeholder="Assign a project milestone/task to this student..."
    className={`flex-1 rounded-lg border px-3 py-1.5 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
                        <button
    type="button"
    onClick={() => handleAddTaskToApplication(selectedApplication.id)}
    className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 font-medium whitespace-nowrap shrink-0"
  >
                          + Add Task
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
    type="button"
    onClick={() => handleSaveApplicationDetails(selectedApplication.id)}
    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
  >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Terms &amp; Notes</span>
                        </button>

                        <button
    type="button"
    onClick={() => handleOpenOfferLetterPreview(selectedApplication)}
    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
  >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Preview &amp; Issue Offer Letter</span>
                        </button>
                      </div>
                    </div>

                    {
    /* Completion Verification & Certificate Issuance */
  }
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-blue-400">
                          3. Internship Completion Verification &amp; Certificate Generator
                        </p>
                        <span className="text-xs font-mono text-slate-400">
                          {selectedApplication.completionApproved ? `Approved on ${formatOfficialDate(
    selectedApplication.completionApprovedAt
  )}` : "Completion Not Approved Yet"}
                        </span>
                      </div>

                      <div className="text-xs">
                        <label className="block text-slate-400 mb-1">
                          Approved Description of Work Completed (Printed on Certificate) *
                        </label>
                        <textarea
    rows={2}
    value={editWorkSummary}
    onChange={(e) => setEditWorkSummary(e.target.value)}
    className={`w-full rounded-lg border px-3 py-1.5 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
    type="button"
    onClick={() => handleApproveCompletion(selectedApplication.id)}
    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
  >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {selectedApplication.completionApproved ? "Update Approved Completion Record" : "Verify & Approve Internship Completion"}
                          </span>
                        </button>

                        <button
    type="button"
    disabled={!selectedApplication.completionApproved}
    onClick={() => handleOpenCertificatePreview(selectedApplication)}
    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold"
  >
                          <Award className="w-3.5 h-3.5" />
                          <span>Preview &amp; Issue Completion Certificate</span>
                        </button>
                      </div>
                    </div>
                  </div>}
              </div>
            </div>}
        </div>}

      {
    /* =====================================================================
        TAB 2: INTERNSHIP LISTINGS MANAGEMENT
    ===================================================================== */
  }
      {activeTab === "listings" && <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
    onSubmit={handleCreateListing}
    className={`lg:col-span-5 rounded-2xl border p-6 space-y-4 ${isDark ? "bg-[#0B1224] border-slate-800" : "bg-white border-slate-200"}`}
  >
            <h2 className="font-display text-lg font-bold">Create New Internship Listing</h2>
            <div>
              <label className="block text-xs font-medium mb-1">Internship Title *</label>
              <input
    type="text"
    required
    value={newTitle}
    onChange={(e) => setNewTitle(e.target.value)}
    placeholder="e.g. Frontend Engineering Intern (React 19)"
    className={`w-full rounded-lg border px-3 py-2 text-xs ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Department</label>
                <select
    value={newDept}
    onChange={(e) => setNewDept(e.target.value)}
    className={`w-full rounded-lg border px-3 py-2 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  >
                  <option value="Frontend Development">Frontend Development</option>
                  <option value="Backend Development">Backend Development</option>
                  <option value="Full-Stack Development">Full-Stack Development</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="IoT">IoT</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Initial Status</label>
                <select
    value={newStatus}
    onChange={(e) => setNewStatus(e.target.value)}
    className={`w-full rounded-lg border px-3 py-2 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  >
                  <option value="Open">Open (Accepting Applications)</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Work Mode</label>
                <select
    value={newWorkMode}
    onChange={(e) => setNewWorkMode(e.target.value)}
    className={`w-full rounded-lg border px-3 py-2 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-Site">On-Site</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Duration</label>
                <input
    type="text"
    value={newDuration}
    onChange={(e) => setNewDuration(e.target.value)}
    className={`w-full rounded-lg border px-3 py-2 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
              </div>
              <div>
                <label className="block font-medium mb-1">Positions</label>
                <input
    type="number"
    min={1}
    value={newPositions}
    onChange={(e) => setNewPositions(e.target.value)}
    className={`w-full rounded-lg border px-3 py-2 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Compensation Type</label>
                <select
    value={newCompType}
    onChange={(e) => setNewCompType(e.target.value)}
    className={`w-full rounded-lg border px-3 py-2 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  >
                  <option value="Unpaid / Academic Learning">Unpaid / Academic Learning</option>
                  <option value="Paid Stipend">Paid Stipend</option>
                  <option value="Performance-Based Stipend">Performance-Based Stipend</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Application Deadline</label>
                <input
    type="text"
    value={newDeadline}
    onChange={(e) => setNewDeadline(e.target.value)}
    className={`w-full rounded-lg border px-3 py-2 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-medium mb-1">Description *</label>
              <textarea
    rows={2}
    required
    value={newDesc}
    onChange={(e) => setNewDesc(e.target.value)}
    className={`w-full rounded-lg border px-3 py-2 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
            </div>

            <div className="text-xs">
              <label className="block font-medium mb-1">
                Tech Stack &amp; Skills (Comma-separated)
              </label>
              <input
    type="text"
    value={newSkills}
    onChange={(e) => setNewSkills(e.target.value)}
    className={`w-full rounded-lg border px-3 py-2 ${isDark ? "bg-[#050814] border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
  />
            </div>

            <button
    type="submit"
    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
  >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Internship Track</span>
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            {listings.map((lst) => <div
    key={lst.id}
    className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDark ? "bg-[#0B1224] border-slate-800" : "bg-white border-slate-200"}`}
  >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-blue-400">{lst.code}</span>
                    <span aria-hidden="true">·</span>
                    <span>{lst.department}</span>
                    <span aria-hidden="true">·</span>
                    <span
    className={`font-semibold ${lst.status === "Open" ? "text-emerald-400" : lst.status === "Upcoming" ? "text-amber-400" : "text-slate-400"}`}
  >
                      Status: {lst.status}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold">{lst.title}</h3>
                  <p className="text-xs text-slate-400">
                    {lst.workMode} · {lst.duration} · {lst.compensationType} · Deadline:{" "}
                    {lst.deadline}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {["Open", "Upcoming", "Closed", "Archived"].map(
    (st) => <button
      key={st}
      type="button"
      onClick={() => handleUpdateListingStatus(lst.id, st)}
      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${lst.status === st ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 text-slate-400 hover:text-white"}`}
    >
                        {st}
                      </button>
  )}
                </div>
              </div>)}
          </div>
        </div>}

      {
    /* =====================================================================
        TAB 3: ISSUED DOCUMENTS & REVOCATION REGISTRY
    ===================================================================== */
  }
      {activeTab === "documents" && <div className="space-y-8">
          {
    /* Offer Letters */
  }
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">
              Issued Offer Letters ({offerLetters.length})
            </h2>
            {offerLetters.length === 0 ? <p className="text-xs text-slate-400">No offer letters have been issued yet.</p> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offerLetters.map((off) => <div
    key={off.id}
    className={`rounded-2xl border p-5 space-y-3 ${isDark ? "bg-[#0B1224] border-slate-800" : "bg-white border-slate-200"}`}
  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-blue-400">
                        {off.offerNumber} (v{off.version})
                      </span>
                      <span
    className={`font-semibold ${off.status === "Issued" ? "text-emerald-400" : off.status === "Revoked" ? "text-rose-400" : "text-slate-400"}`}
  >
                        {off.status}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold">{off.candidateName}</h3>
                      <p className="text-xs text-slate-400">
                        {off.roleTitle} · Issued {formatOfficialDate(off.issueDate)}
                      </p>
                    </div>
                    {off.revokedReason && <p className="text-xs text-rose-400">
                        Revoked Reason: {off.revokedReason}
                      </p>}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
    type="button"
    onClick={() => {
      setModalIsDraft(false);
      setModalCert(null);
      setModalOffer(off);
    }}
    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium hover:bg-slate-800"
  >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Preview</span>
                      </button>
                      <button
    type="button"
    onClick={() => downloadOfferLetterPdf(off)}
    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
  >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                      {off.status === "Issued" && <button
    type="button"
    onClick={() => setRevokeTarget({
      type: "offer",
      id: off.id,
      label: `${off.offerNumber} (${off.candidateName})`
    })}
    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 text-xs font-medium"
  >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>}
                    </div>
                  </div>)}
              </div>}
          </div>

          {
    /* Completion Certificates */
  }
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h2 className="font-display text-xl font-bold">
              Issued Completion Certificates ({certificates.length})
            </h2>
            {certificates.length === 0 ? <p className="text-xs text-slate-400">
                No completion certificates have been issued yet.
              </p> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((crt) => <div
    key={crt.id}
    className={`rounded-2xl border p-5 space-y-3 ${isDark ? "bg-[#0B1224] border-slate-800" : "bg-white border-slate-200"}`}
  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-blue-400">ID: {crt.id}</span>
                      <span
    className={`font-semibold ${crt.status === "Valid" ? "text-emerald-400" : "text-rose-400"}`}
  >
                        {crt.status}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold">{crt.internName}</h3>
                      <p className="text-xs text-slate-400">
                        {crt.roleTitle} · Issued {formatOfficialDate(crt.issueDate)}
                      </p>
                    </div>
                    {crt.revokedReason && <p className="text-xs text-rose-400">
                        Revoked Reason: {crt.revokedReason}
                      </p>}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
    type="button"
    onClick={() => {
      setModalIsDraft(false);
      setModalOffer(null);
      setModalCert(crt);
    }}
    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium hover:bg-slate-800"
  >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Preview</span>
                      </button>
                      <button
    type="button"
    onClick={() => downloadCertificatePdf(crt)}
    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
  >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                      <button
    type="button"
    onClick={() => onNavigateVerifyCertificate(crt.id)}
    className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-blue-400 hover:bg-slate-800"
  >
                        Public Verify Page
                      </button>
                      {crt.status === "Valid" && <button
    type="button"
    onClick={() => setRevokeTarget({
      type: "certificate",
      id: crt.id,
      label: `${crt.id} (${crt.internName})`
    })}
    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 text-xs font-medium"
  >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>}
                    </div>
                  </div>)}
              </div>}
          </div>
        </div>}

      {
    /* =====================================================================
        TAB 4: ADMIN SECURITY AUDIT LOG
    ===================================================================== */
  }
      {activeTab === "audit" && <div
    className={`rounded-2xl border p-6 space-y-4 ${isDark ? "bg-[#0B1224] border-slate-800" : "bg-white border-slate-200"}`}
  >
          <h2 className="font-display text-lg font-bold">
            Immutable Administrator &amp; Document Audit Trail
          </h2>
          {auditLogs.length === 0 ? <p className="text-xs text-slate-400">No administrative events logged yet.</p> : <div className="space-y-2.5">
              {auditLogs.map((log) => <div
    key={log.id}
    className={`rounded-xl border p-3.5 text-xs flex flex-wrap items-center justify-between gap-4 ${isDark ? "bg-[#050814] border-slate-800" : "bg-slate-50 border-slate-200"}`}
  >
                  <div className="space-y-0.5">
                    <p className="font-mono text-blue-400">
                      {log.action} · Target: {log.targetId}
                    </p>
                    <p className={isDark ? "text-slate-200" : "text-slate-800"}>{log.summary}</p>
                  </div>
                  <div className="text-right font-mono text-[11px] text-slate-400">
                    <p>{new Date(log.createdAt).toLocaleString()}</p>
                    <p>
                      {log.emailDispatched ? "Email Sent (Server-Side)" : "Email Not Configured (No Email Sent)"}
                    </p>
                  </div>
                </div>)}
            </div>}
        </div>}

      {
    /* Revocation Modal */
  }
      {revokeTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <form
    onSubmit={handleRevokeDocument}
    className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0B1224] p-6 space-y-4 text-white"
  >
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Revoke Official Document (Audit Logged)</span>
            </div>
            <h3 className="font-display text-lg font-bold">Revoke {revokeTarget.label}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Revoking a document marks it as <strong>Revoked</strong> on the Student Dashboard and
              Public Verification Page while retaining the original record in the audit trail.
            </p>
            <div>
              <label className="block text-xs font-medium mb-1">Revocation Reason *</label>
              <input
    type="text"
    required
    value={revokeReasonInput}
    onChange={(e) => setRevokeReasonInput(e.target.value)}
    placeholder="e.g. Issued in error — revised start date issued"
    className="w-full rounded-lg border border-slate-700 bg-[#050814] px-3 py-2 text-xs text-white"
  />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
    type="button"
    onClick={() => {
      setRevokeTarget(null);
      setRevokeReasonInput("");
    }}
    className="px-4 py-2 rounded-lg border border-slate-700 text-xs"
  >
                Cancel
              </button>
              <button
    type="submit"
    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
  >
                Confirm Revocation
              </button>
            </div>
          </form>
        </div>}

      {
    /* Offer Letter / Certificate Preview Modal */
  }
      {(modalOffer || modalCert) && <DocumentPreviewModal
    offerLetter={modalOffer}
    certificate={modalCert}
    isDraftPreview={modalIsDraft}
    onConfirmIssueDraft={modalOffer ? handleConfirmIssueOfferLetter : handleConfirmIssueCertificate}
    onClose={() => {
      setModalOffer(null);
      setModalCert(null);
      setModalIsDraft(false);
    }}
    onVerifyRoute={(certId) => onNavigateVerifyCertificate(certId)}
  />}
    </div>;
};
export {
  AdminInternshipsSection
};
