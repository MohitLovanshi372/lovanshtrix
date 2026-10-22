import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import {
  CareerOpening,
  CompanyDetails,
  LovanstrixStore,
  ProjectCategory,
  ProjectItem,
  ServiceAvailability,
  ServiceItem,
  SystemConfigStatus,
} from '../types/lovanstrix';

interface AdminConsoleSectionProps {
  isDark: boolean;
  onDataUpdated: () => void;
}

type AdminTab =
  | 'overview'
  | 'company'
  | 'services'
  | 'projects'
  | 'enquiries'
  | 'careers'
  | 'setup';

export const AdminConsoleSection: React.FC<AdminConsoleSectionProps> = ({
  isDark,
  onDataUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [token, setToken] = useState<string>(() => sessionStorage.getItem('lx_admin_token') || '');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(true);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  const [store, setStore] = useState<LovanstrixStore | null>(null);
  const [configStatus, setConfigStatus] = useState<SystemConfigStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Company Form State
  const [companyForm, setCompanyForm] = useState<CompanyDetails | null>(null);

  // Service Form State (Create or Edit)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [srvTitle, setSrvTitle] = useState('');
  const [srvCategory, setSrvCategory] = useState('Custom Software');
  const [srvSummary, setSrvSummary] = useState('');
  const [srvOverview, setSrvOverview] = useState('');
  const [srvProblems, setSrvProblems] = useState('');
  const [srvDeliverables, setSrvDeliverables] = useState('');
  const [srvTech, setSrvTech] = useState('');
  const [srvAvailability, setSrvAvailability] = useState<ServiceAvailability>(
    'Available for New Projects'
  );

  // Project Form State (Create or Edit)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState<ProjectCategory>('Web Applications');
  const [projClassification, setProjClassification] = useState<
    | 'Published Project'
    | 'Prototype'
    | 'Demo Project'
    | 'In Development'
    | 'Internal Concept Prototype'
    | 'Architecture Demo'
  >('Prototype');
  const [projObjective, setProjObjective] = useState('');
  const [projProblemStatement, setProjProblemStatement] = useState('');
  const [projProposedSolution, setProjProposedSolution] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projFeatures, setProjFeatures] = useState('');
  const [projLiveUrl, setProjLiveUrl] = useState('');
  const [projGithubUrl, setProjGithubUrl] = useState('');
  const [projVisual, setProjVisual] = useState<'webapp' | 'ai' | 'website' | 'iot'>('webapp');
  const [projPublished, setProjPublished] = useState<boolean>(true);

  // New Career Opening Form State
  const [openTitle, setOpenTitle] = useState('');
  const [openTrack, setOpenTrack] = useState<CareerOpening['track']>('Full-Stack Development');
  const [openType, setOpenType] = useState<CareerOpening['type']>('Internship');
  const [openEligibility, setOpenEligibility] = useState('');
  const [openDuration, setOpenDuration] = useState('3 Months (Remote)');
  const [openResponsibilities, setOpenResponsibilities] = useState('');
  const [openDeadline, setOpenDeadline] = useState('2026-12-31');
  const [openLink, setOpenLink] = useState('');

  const authHeaders = (overrideToken?: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${overrideToken ?? token}`,
  });

  const fetchAdminStore = async (activeToken?: string) => {
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/store', {
        headers: authHeaders(activeToken),
      });
      if (resp.status === 401) {
        setAuthenticated(false);
        setPreviewMode(false);
        setLoading(false);
        return;
      }
      const data = await resp.json();
      if (resp.ok && data.store) {
        setStore(data.store);
        setCompanyForm(data.store.company);
        setConfigStatus(data.configStatus);
        setPreviewMode(!data.configStatus?.adminAuthConfigured);
        setAuthenticated(true);
      }
    } catch {
      setAuthError('Failed to connect to Admin API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStore(token);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }
      sessionStorage.setItem('lx_admin_token', data.token);
      setToken(data.token);
      setPreviewMode(Boolean(data.previewMode));
      setAuthenticated(true);
      await fetchAdminStore(data.token);
    } catch {
      setAuthError('Network error during login.');
    }
  };

  const notifySaved = (msg: string) => {
    setStatusBanner(msg);
    onDataUpdated();
    setTimeout(() => setStatusBanner(null), 4000);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm) return;
    const resp = await fetch('/api/admin/company', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(companyForm),
    });
    const data = await resp.json();
    if (resp.ok) {
      setStore((prev) => (prev ? { ...prev, company: data.company } : prev));
      setConfigStatus(data.configStatus);
      notifySaved('Company details, founder profile, and website copy saved.');
    }
  };

  const resetServiceForm = () => {
    setEditingServiceId(null);
    setSrvTitle('');
    setSrvCategory('Custom Software');
    setSrvSummary('');
    setSrvOverview('');
    setSrvProblems('');
    setSrvDeliverables('');
    setSrvTech('');
    setSrvAvailability('Available for New Projects');
  };

  const handleStartEditService = (srv: ServiceItem) => {
    setEditingServiceId(srv.id);
    setSrvTitle(srv.title);
    setSrvCategory(srv.category);
    setSrvSummary(srv.summary);
    setSrvOverview(srv.overview || srv.summary);
    setSrvProblems((srv.problemsAddressed || []).join('\n'));
    setSrvDeliverables((srv.deliverables || []).join('\n'));
    setSrvTech((srv.technologies || []).join(', '));
    setSrvAvailability(srv.availability);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvTitle.trim() || !srvSummary.trim()) return;

    const payload = {
      title: srvTitle,
      category: srvCategory,
      summary: srvSummary,
      overview: srvOverview || srvSummary,
      problemsAddressed: srvProblems.split('\n').filter(Boolean),
      deliverables: srvDeliverables.split('\n').filter(Boolean),
      technologies: srvTech.split(',').filter(Boolean),
      availability: srvAvailability,
      featured: true,
    };

    const url = editingServiceId
      ? `/api/admin/services/${editingServiceId}`
      : '/api/admin/services';
    const method = editingServiceId ? 'PUT' : 'POST';

    const resp = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (resp.ok) {
      setStore((prev) => (prev ? { ...prev, services: data.services } : prev));
      resetServiceForm();
      notifySaved(editingServiceId ? 'Service listing updated.' : 'New service listing added.');
    }
  };

  const handleDeleteService = async (id: string) => {
    const resp = await fetch(`/api/admin/services/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await resp.json();
    if (resp.ok) {
      setStore((prev) => (prev ? { ...prev, services: data.services } : prev));
      if (editingServiceId === id) resetServiceForm();
      notifySaved('Service listing removed.');
    }
  };

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjTitle('');
    setProjCategory('Web Applications');
    setProjClassification('Prototype');
    setProjObjective('');
    setProjProblemStatement('');
    setProjProposedSolution('');
    setProjTech('');
    setProjFeatures('');
    setProjLiveUrl('');
    setProjGithubUrl('');
    setProjVisual('webapp');
    setProjPublished(true);
  };

  const handleStartEditProject = (p: ProjectItem) => {
    setEditingProjectId(p.id);
    setProjTitle(p.title);
    setProjCategory(p.category);
    setProjClassification(p.classification);
    setProjObjective(p.objective);
    setProjProblemStatement(p.problemStatement || p.objective);
    setProjProposedSolution(p.proposedSolution || '');
    setProjTech(p.technologies.join(', '));
    setProjFeatures(p.features.join('\n'));
    setProjLiveUrl(p.liveDemoUrl || '');
    setProjGithubUrl(p.githubUrl || '');
    setProjVisual(p.visualType);
    setProjPublished(p.published !== false);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projObjective.trim()) return;

    const payload = {
      title: projTitle,
      category: projCategory,
      classification: projClassification,
      objective: projObjective,
      problemStatement: projProblemStatement || projObjective,
      proposedSolution:
        projProposedSolution ||
        'Engineered with modular React, TypeScript, and validated Node.js APIs.',
      technologies: projTech.split(',').filter(Boolean),
      features: projFeatures.split('\n').filter(Boolean),
      liveDemoUrl: projLiveUrl,
      githubUrl: projGithubUrl,
      visualType: projVisual,
      published: projPublished,
    };

    const url = editingProjectId
      ? `/api/admin/projects/${editingProjectId}`
      : '/api/admin/projects';
    const method = editingProjectId ? 'PATCH' : 'POST';

    const resp = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (resp.ok) {
      setStore((prev) => (prev ? { ...prev, projects: data.projects } : prev));
      resetProjectForm();
      notifySaved(editingProjectId ? 'Portfolio project updated.' : 'Project added to portfolio.');
    }
  };

  const handleToggleProjectPublished = async (p: ProjectItem) => {
    const nextPublished = p.published === false ? true : false;
    const resp = await fetch(`/api/admin/projects/${p.id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ published: nextPublished }),
    });
    const data = await resp.json();
    if (resp.ok) {
      setStore((prev) => (prev ? { ...prev, projects: data.projects } : prev));
      notifySaved(
        nextPublished ? `"${p.title}" published to public portfolio.` : `"${p.title}" unpublished.`
      );
    }
  };

  const handleDeleteProject = async (id: string) => {
    const resp = await fetch(`/api/admin/projects/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await resp.json();
    if (resp.ok) {
      setStore((prev) => (prev ? { ...prev, projects: data.projects } : prev));
      if (editingProjectId === id) resetProjectForm();
      notifySaved('Project removed from portfolio.');
    }
  };

  const handleCreateOpening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openTitle.trim() || !openEligibility.trim()) return;
    const resp = await fetch('/api/admin/openings', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        title: openTitle,
        track: openTrack,
        type: openType,
        status: 'Open',
        eligibility: openEligibility,
        duration: openDuration,
        responsibilities: openResponsibilities.split('\n').filter(Boolean),
        deadline: openDeadline,
        applicationLink: openLink,
      }),
    });
    const data = await resp.json();
    if (resp.ok) {
      setStore((prev) => (prev ? { ...prev, openings: data.openings } : prev));
      setOpenTitle('');
      setOpenEligibility('');
      setOpenResponsibilities('');
      setOpenLink('');
      notifySaved('Official career/internship opening published.');
    }
  };

  const handleToggleOpeningStatus = async (id: string, currentStatus: 'Open' | 'Closed') => {
    const nextStatus = currentStatus === 'Open' ? 'Closed' : 'Open';
    const resp = await fetch(`/api/admin/openings/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await resp.json();
    if (resp.ok) {
      setStore((prev) => (prev ? { ...prev, openings: data.openings } : prev));
      notifySaved(`Opening marked as ${nextStatus}.`);
    }
  };

  const handleDeleteOpening = async (id: string) => {
    const resp = await fetch(`/api/admin/openings/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await resp.json();
    if (resp.ok) {
      setStore((prev) => (prev ? { ...prev, openings: data.openings } : prev));
      notifySaved('Opening deleted.');
    }
  };

  const handleUpdateEnquiryStatus = async (
    id: string,
    status: 'New' | 'Reviewed' | 'Archived'
  ) => {
    const resp = await fetch(`/api/admin/enquiries/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await resp.json();
    if (resp.ok) {
      setStore((prev) => (prev ? { ...prev, enquiries: data.enquiries } : prev));
      notifySaved(`Enquiry marked as ${status}.`);
    }
  };

  const handleDeleteEnquiry = async (id: string) => {
    const resp = await fetch(`/api/admin/enquiries/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await resp.json();
    if (resp.ok) {
      setStore((prev) => (prev ? { ...prev, enquiries: data.enquiries } : prev));
      notifySaved('Enquiry deleted.');
    }
  };

  const handleUpdateCareerSubmission = async (id: string, status: 'Registered' | 'Reviewed') => {
    const resp = await fetch(`/api/admin/career-submissions/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await resp.json();
    if (resp.ok) {
      setStore((prev) =>
        prev ? { ...prev, careerSubmissions: data.careerSubmissions } : prev
      );
      notifySaved(`Career registration marked as ${status}.`);
    }
  };

  const handleResetDefault = async () => {
    const resp = await fetch('/api/admin/reset', {
      method: 'POST',
      headers: authHeaders(),
    });
    const data = await resp.json();
    if (resp.ok) {
      setStore(data.store);
      setCompanyForm(data.store.company);
      setConfigStatus(data.configStatus);
      notifySaved('Store reset to default early-stage seed data.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-slate-400">Loading Admin Management Console...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div
          className={`rounded-2xl border p-8 space-y-5 ${
            isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5 text-blue-400">
            <Lock className="w-5 h-5" />
            <span className="text-xs font-semibold">Server-Side Admin Authorization</span>
          </div>
          <h1
            className={`font-display text-2xl font-bold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Unlock Lovanstrix Admin
          </h1>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            This workspace is protected by <code className="font-mono">ADMIN_PASSCODE</code> on the
            Node.js server. Enter the configured passcode to manage content and enquiries.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-passcode" className="block text-xs font-medium mb-1.5">
                Server Passcode
              </label>
              <input
                id="admin-passcode"
                type="password"
                required
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter ADMIN_PASSCODE"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            {authError && <p className="text-xs text-rose-400">{authError}</p>}
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              Verify & Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Top Admin Header & Security Notice */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800/80 pb-8">
        <div>
          <p className="text-xs font-medium text-blue-400 mb-1">
            Lovanstrix Administration & Content Operations
          </p>
          <h1
            className={`font-display text-3xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            IT Services &amp; Portfolio Management Console
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fetchAdminStore()}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              isDark
                ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
          <button
            type="button"
            onClick={handleResetDefault}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              isDark
                ? 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                : 'border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Reset Demo Seed</span>
          </button>
        </div>
      </div>

      {/* Preview Mode Security Disclosure */}
      {previewMode && (
        <div
          className={`rounded-2xl border p-5 flex items-start gap-3.5 ${
            isDark
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <p className="font-semibold">
              Preview-Only Admin Interface Active (ADMIN_PASSCODE Not Set)
            </p>
            <p>
              Because <code className="font-mono">ADMIN_PASSCODE</code> is not yet configured in
              your environment variables, this console is unlocked in preview mode so you can test
              editing company &amp; founder details, managing the 11 service pages, publishing or
              unpublishing portfolio items, and reviewing client quote enquiries. Before public
              production deployment, set <code className="font-mono">ADMIN_PASSCODE</code> on the
              server.
            </p>
          </div>
        </div>
      )}

      {statusBanner && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusBanner}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        className={`flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border ${
          isDark ? 'bg-[#090F21] border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}
        role="tablist"
      >
        {[
          { id: 'overview', label: 'Overview & Status' },
          { id: 'company', label: 'Company & Founder Copy' },
          { id: 'services', label: `Services (${store?.services.length || 0})` },
          { id: 'projects', label: `Portfolio (${store?.projects.length || 0})` },
          { id: 'enquiries', label: `Enquiries (${store?.enquiries.length || 0})` },
          {
            id: 'careers',
            label: `Careers & Openings (${store?.openings.length || 0} / ${
              store?.careerSubmissions.length || 0
            })`,
          },
          { id: 'setup', label: 'Setup & Deployment Guide' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & STATUS */}
      {activeTab === 'overview' && store && configStatus && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div
              className={`rounded-2xl border p-6 ${
                isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <p className="text-xs text-slate-400">Active Service Lines</p>
              <p
                className={`mt-2 font-display text-3xl font-bold tabular-nums ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {store.services.length}
              </p>
              <p className="mt-1 text-xs text-blue-400">Each with a dedicated detail page</p>
            </div>

            <div
              className={`rounded-2xl border p-6 ${
                isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <p className="text-xs text-slate-400">Portfolio &amp; Prototype Items</p>
              <p
                className={`mt-2 font-display text-3xl font-bold tabular-nums ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {store.projects.filter((p) => p.published !== false).length} / {store.projects.length}
              </p>
              <p className="mt-1 text-xs text-blue-400">
                {store.company.portfolioComingSoonMode
                  ? 'Portfolio Coming Soon Mode ON'
                  : 'Published vs Total items'}
              </p>
            </div>

            <div
              className={`rounded-2xl border p-6 ${
                isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <p className="text-xs text-slate-400">Project Quote Enquiries</p>
              <p
                className={`mt-2 font-display text-3xl font-bold tabular-nums ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {store.enquiries.length}
              </p>
              <p className="mt-1 text-xs text-blue-400">
                {store.enquiries.filter((e) => e.status === 'New').length} unread
              </p>
            </div>

            <div
              className={`rounded-2xl border p-6 ${
                isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <p className="text-xs text-slate-400">Talent Pool &amp; Internships</p>
              <p
                className={`mt-2 font-display text-3xl font-bold tabular-nums ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {store.internshipApplications?.length || 0}
              </p>
              <p className="mt-1 text-xs text-blue-400">
                {store.careerSubmissions.length} career interest registrations
              </p>
            </div>
          </div>

          {/* Functional vs Awaiting Configuration Matrix */}
          <div
            className={`rounded-2xl border p-6 sm:p-8 ${
              isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <h2
              className={`font-display text-xl font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Live System Capabilities: Functional Now vs. Awaiting Configuration
            </h2>
            <p className={`text-xs mt-1 mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Transparent audit of what works immediately out-of-the-box vs. optional production
              integrations.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 pr-4 font-semibold">Subsystem / Feature</th>
                    <th className="py-3 px-4 font-semibold">Current Status</th>
                    <th className="py-3 pl-4 font-semibold">Configuration / Behavior Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="py-3.5 pr-4 font-medium">Express Backend &amp; Local Store</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-medium">Functional Now</td>
                    <td className="py-3.5 pl-4 text-slate-400">
                      Persists company copy, 11 services, portfolio projects, enquiries, and
                      internships in <code className="font-mono">data/lovanstrix-store.json</code>.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium">Quote &amp; Career Form Validation</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-medium">Functional Now</td>
                    <td className="py-3.5 pl-4 text-slate-400">
                      Client + server validation with optional reference link and honest database /
                      demo confirmation states.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium">Admin Authorization Lock</td>
                    <td className="py-3.5 px-4 font-medium">
                      {configStatus.adminAuthConfigured ? (
                        <span className="text-emerald-400">Configured (Locked)</span>
                      ) : (
                        <span className="text-amber-400">Preview Mode (Awaiting ADMIN_PASSCODE)</span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-slate-400">
                      Set <code className="font-mono">ADMIN_PASSCODE</code> in environment variables
                      to require server-verified HMAC authentication.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium">External Email / Webhook Delivery</td>
                    <td className="py-3.5 px-4 font-medium">
                      {configStatus.emailWebhookConfigured ? (
                        <span className="text-emerald-400">Configured (Active)</span>
                      ) : (
                        <span className="text-amber-400">Optional (Awaiting SMTP_WEBHOOK_URL)</span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-slate-400">
                      Enquiries save to server store; set{' '}
                      <code className="font-mono">SMTP_WEBHOOK_URL</code> to forward enquiries to
                      email/Slack.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium">Official WhatsApp Direct Button</td>
                    <td className="py-3.5 px-4 font-medium">
                      {configStatus.whatsappConfigured ? (
                        <span className="text-emerald-400">
                          Active (+{store.company.whatsappNumber})
                        </span>
                      ) : (
                        <span className="text-amber-400">Awaiting Real Company Number</span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-slate-400">
                      Hidden until a verified number is saved in the &ldquo;Company &amp; Founder
                      Copy&rdquo; tab or <code className="font-mono">COMPANY_WHATSAPP</code> env var.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-medium">Server-Side Gemini Scope Planner</td>
                    <td className="py-3.5 px-4 font-medium">
                      {configStatus.geminiConfigured ? (
                        <span className="text-emerald-400">Live Gemini API Active</span>
                      ) : (
                        <span className="text-blue-400">
                          Deterministic Template Fallback (Zero Paid API Required)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-slate-400">
                      Works without paid APIs using structured templates; automatically upgrades to
                      server-side Gemini when <code className="font-mono">GEMINI_API_KEY</code> is
                      set.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY DETAILS, FOUNDER PROFILE & WEBSITE COPY */}
      {activeTab === 'company' && companyForm && (
        <form
          onSubmit={handleSaveCompany}
          className={`rounded-2xl border p-7 space-y-5 ${
            isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="border-b border-slate-800/60 pb-4 flex items-center justify-between">
            <div>
              <h2
                className={`font-display text-xl font-bold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Update Company Details, Founder Introduction &amp; Website Copy
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Changes immediately reflect across the Homepage, About Us, Portfolio, Careers, and
                Contact pages.
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Brand Tagline</label>
              <input
                type="text"
                value={companyForm.tagline}
                onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Primary Contact Email</label>
              <input
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">
                Official WhatsApp Number (Digits only, e.g. 919876543210 — leave empty to hide button)
              </label>
              <input
                type="text"
                value={companyForm.whatsappNumber}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, whatsappNumber: e.target.value })
                }
                placeholder="Leave blank until official number is active"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={companyForm.portfolioComingSoonMode}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      portfolioComingSoonMode: e.target.checked,
                    })
                  }
                  className="rounded border-slate-600"
                />
                <span>
                  Show &ldquo;Portfolio Coming Soon&rdquo; notice instead of prototype cards on Our
                  Work page
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Homepage Hero Heading</label>
            <input
              type="text"
              value={companyForm.heroHeading}
              onChange={(e) => setCompanyForm({ ...companyForm, heroHeading: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                isDark
                  ? 'bg-[#050814] border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Homepage Hero Subtitle</label>
            <textarea
              rows={2}
              value={companyForm.heroSubtitle}
              onChange={(e) => setCompanyForm({ ...companyForm, heroSubtitle: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                isDark
                  ? 'bg-[#050814] border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Founder Introduction Section */}
          <div className="pt-4 border-t border-slate-800/60 space-y-4">
            <h3 className="font-display text-base font-bold text-blue-400">
              Founder Introduction (Displayed on About Us Page)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Founder Name / Title</label>
                <input
                  type="text"
                  value={companyForm.founderName || ''}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, founderName: e.target.value })
                  }
                  placeholder="e.g. Lovanstrix Founding Engineering Lead"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Founder Role</label>
                <input
                  type="text"
                  value={companyForm.founderRole || ''}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, founderRole: e.target.value })
                  }
                  placeholder="e.g. Founder & Principal Software Architect"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Founder Bio &amp; Philosophy</label>
              <textarea
                rows={3}
                value={companyForm.founderBio || ''}
                onChange={(e) => setCompanyForm({ ...companyForm, founderBio: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Careers Page Status Banner</label>
            <textarea
              rows={2}
              value={companyForm.careerStatusBanner}
              onChange={(e) =>
                setCompanyForm({ ...companyForm, careerStatusBanner: e.target.value })
              }
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                isDark
                  ? 'bg-[#050814] border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </form>
      )}

      {/* TAB 3: MANAGE SERVICES */}
      {activeTab === 'services' && store && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSaveService}
            className={`lg:col-span-5 rounded-2xl border p-6 space-y-4 ${
              isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">
                {editingServiceId ? 'Edit Service Capability' : 'Add Service Capability'}
              </h2>
              {editingServiceId && (
                <button
                  type="button"
                  onClick={resetServiceForm}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Service Title *</label>
              <input
                type="text"
                required
                value={srvTitle}
                onChange={(e) => setSrvTitle(e.target.value)}
                placeholder="e.g. Cloud API Migration"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category Label</label>
              <input
                type="text"
                value={srvCategory}
                onChange={(e) => setSrvCategory(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Availability Status</label>
              <select
                value={srvAvailability}
                onChange={(e) => setSrvAvailability(e.target.value as typeof srvAvailability)}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="Available for New Projects">Available for New Projects</option>
                <option value="Consultation & Scoping">Consultation & Scoping</option>
                <option value="Planned Capability">Planned Capability</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Card Summary *</label>
              <textarea
                rows={2}
                required
                value={srvSummary}
                onChange={(e) => setSrvSummary(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Detailed Page Overview (Optional)
              </label>
              <textarea
                rows={3}
                value={srvOverview}
                onChange={(e) => setSrvOverview(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Problems Addressed (One per line)
              </label>
              <textarea
                rows={2}
                value={srvProblems}
                onChange={(e) => setSrvProblems(e.target.value)}
                placeholder="Slow mobile load speed&#10;Manual lead qualification"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Deliverables (One per line)
              </label>
              <textarea
                rows={3}
                value={srvDeliverables}
                onChange={(e) => setSrvDeliverables(e.target.value)}
                placeholder="Architecture Blueprint&#10;REST API Endpoints&#10;Deployment Handover"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Technologies (Comma-separated)
              </label>
              <input
                type="text"
                value={srvTech}
                onChange={(e) => setSrvTech(e.target.value)}
                placeholder="React, TypeScript, Node.js"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              {editingServiceId ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Service</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Service Listing</span>
                </>
              )}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            {store.services.map((srv) => (
              <div
                key={srv.id}
                className={`rounded-2xl border p-5 flex items-start justify-between gap-4 ${
                  isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <p className="text-xs text-blue-400">
                    {srv.index} · {srv.category} · {srv.availability}
                  </p>
                  <h3 className="font-display text-base font-semibold mt-1">{srv.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{srv.summary}</p>
                  <p className="text-xs font-mono text-slate-500 mt-2">
                    /services/{srv.slug}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEditService(srv)}
                    aria-label={`Edit ${srv.title}`}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(srv.id)}
                    aria-label={`Remove ${srv.title}`}
                    className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PUBLISH & MANAGE PORTFOLIO PROJECTS */}
      {activeTab === 'projects' && store && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleSaveProject}
            className={`lg:col-span-5 rounded-2xl border p-6 space-y-4 ${
              isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">
                {editingProjectId ? 'Edit Portfolio Project' : 'Add Project or Prototype'}
              </h2>
              {editingProjectId && (
                <button
                  type="button"
                  onClick={resetProjectForm}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Project Title *</label>
              <input
                type="text"
                required
                value={projTitle}
                onChange={(e) => setProjTitle(e.target.value)}
                placeholder="e.g. Inventory & Order Portal"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Category</label>
                <select
                  value={projCategory}
                  onChange={(e) => setProjCategory(e.target.value as ProjectCategory)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Websites">Websites</option>
                  <option value="Web Applications">Web Applications</option>
                  <option value="AI Projects">AI Projects</option>
                  <option value="IoT and Hardware">IoT and Hardware</option>
                  <option value="Experimental Prototypes">Experimental Prototypes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Development Status Label</label>
                <select
                  value={projClassification}
                  onChange={(e) =>
                    setProjClassification(e.target.value as typeof projClassification)
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Prototype">Prototype</option>
                  <option value="Demo Project">Demo Project</option>
                  <option value="In Development">In Development</option>
                  <option value="Published Project">Published Project</option>
                  <option value="Internal Concept Prototype">Internal Concept Prototype</option>
                  <option value="Architecture Demo">Architecture Demo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Project Summary / Objective *</label>
              <textarea
                rows={2}
                required
                value={projObjective}
                onChange={(e) => setProjObjective(e.target.value)}
                placeholder="Concise overview of the project..."
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Problem Statement</label>
              <textarea
                rows={2}
                value={projProblemStatement}
                onChange={(e) => setProjProblemStatement(e.target.value)}
                placeholder="What operational or technical problem does this solve?"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Proposed Engineering Solution</label>
              <textarea
                rows={2}
                value={projProposedSolution}
                onChange={(e) => setProjProposedSolution(e.target.value)}
                placeholder="How was the architecture designed and implemented?"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Technologies Used (Comma-separated)
              </label>
              <input
                type="text"
                value={projTech}
                onChange={(e) => setProjTech(e.target.value)}
                placeholder="React, TypeScript, Express, PostgreSQL"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Key Features (One per line)</label>
              <textarea
                rows={3}
                value={projFeatures}
                onChange={(e) => setProjFeatures(e.target.value)}
                placeholder="Role-based login&#10;Automated PDF export"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Live Demo URL (Optional)</label>
                <input
                  type="text"
                  value={projLiveUrl}
                  onChange={(e) => setProjLiveUrl(e.target.value)}
                  placeholder="https://... or /internships"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">GitHub URL (Optional)</label>
                <input
                  type="text"
                  value={projGithubUrl}
                  onChange={(e) => setProjGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-medium mb-1">Schematic Visual Style</label>
                <select
                  value={projVisual}
                  onChange={(e) => setProjVisual(e.target.value as typeof projVisual)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="webapp">Web Application Schematic</option>
                  <option value="ai">AI Workflow Schematic</option>
                  <option value="website">Website Layout Schematic</option>
                  <option value="iot">IoT Edge Telemetry Schematic</option>
                </select>
              </div>

              <div className="pt-4">
                <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projPublished}
                    onChange={(e) => setProjPublished(e.target.checked)}
                    className="rounded border-slate-600"
                  />
                  <span>Published on Public Website</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              {editingProjectId ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Project Changes</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Publish to Portfolio</span>
                </>
              )}
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            {store.projects.map((p) => {
              const isPub = p.published !== false;
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-5 flex items-start justify-between gap-4 ${
                    isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-blue-400 font-medium">
                        {p.category} · {p.classification} · {p.publishedAt}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className={isPub ? 'text-emerald-400' : 'text-amber-400'}>
                        {isPub ? 'Published' : 'Unpublished (Draft)'}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-semibold mt-1">{p.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.objective}</p>
                    <p className="text-xs font-mono text-slate-500 mt-2">
                      {p.technologies.join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleProjectPublished(p)}
                      title={isPub ? 'Unpublish from public portfolio' : 'Publish to public portfolio'}
                      className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {isPub ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEditProject(p)}
                      aria-label={`Edit ${p.title}`}
                      className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(p.id)}
                      aria-label={`Delete ${p.title}`}
                      className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: MANAGE ENQUIRIES */}
      {activeTab === 'enquiries' && store && (
        <div className="space-y-4">
          {store.enquiries.length === 0 ? (
            <div
              className={`rounded-2xl border p-12 text-center ${
                isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <p className="text-sm font-semibold">No Project Enquiries Submitted Yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Submit a test quote on the Contact / Request a Quote page to inspect it here.
              </p>
            </div>
          ) : (
            store.enquiries.map((enq) => (
              <div
                key={enq.id}
                className={`rounded-2xl border p-6 space-y-3 ${
                  isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-blue-400">
                    <span>{enq.serviceRequired}</span>
                    <span aria-hidden="true"> · </span>
                    <span>Status: {enq.status}</span>
                    <span aria-hidden="true"> · </span>
                    <span>
                      {enq.emailDelivered
                        ? 'Email Dispatched (Server-Side)'
                        : 'Saved to DB · No Email Sent'}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono tabular-nums">
                      {new Date(enq.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateEnquiryStatus(enq.id, 'Reviewed')}
                      className="px-2.5 py-1 rounded border border-slate-700 text-xs hover:bg-slate-800"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateEnquiryStatus(enq.id, 'Archived')}
                      className="px-2.5 py-1 rounded border border-slate-700 text-xs hover:bg-slate-800"
                    >
                      Archive
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEnquiry(enq.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400"
                      aria-label="Delete enquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-base font-semibold">
                    {enq.name} ({enq.email}){' '}
                    {enq.organization ? `— ${enq.organization}` : ''}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Budget: {enq.estimatedBudget}</span>
                    <span aria-hidden="true">·</span>
                    <span>Timeline: {enq.expectedTimeline}</span>
                    {enq.referenceUrl && (
                      <>
                        <span aria-hidden="true">·</span>
                        <a
                          href={enq.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                        >
                          <span>Reference URL</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <p
                  className={`text-xs leading-relaxed p-3.5 rounded-xl border ${
                    isDark
                      ? 'bg-[#050814] border-slate-800 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {enq.projectDescription}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 6: CAREERS & INTERNSHIP OPENINGS */}
      {activeTab === 'careers' && store && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleCreateOpening}
              className={`lg:col-span-5 rounded-2xl border p-6 space-y-4 ${
                isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <h2 className="font-display text-lg font-bold">
                Publish Official Internship or Role Opening
              </h2>
              <p className="text-xs text-slate-400">
                Publishing an opening here makes it visible on the public Careers page.
              </p>

              <div>
                <label className="block text-xs font-medium mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={openTitle}
                  onChange={(e) => setOpenTitle(e.target.value)}
                  placeholder="e.g. Frontend Engineering Intern (React & TypeScript)"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Track</label>
                  <select
                    value={openTrack}
                    onChange={(e) => setOpenTrack(e.target.value as CareerOpening['track'])}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Backend Development">Backend Development</option>
                    <option value="Full-Stack Development">Full-Stack Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="AI & Software Research">AI & Software Research</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Engagement Type</label>
                  <select
                    value={openType}
                    onChange={(e) => setOpenType(e.target.value as CareerOpening['type'])}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Internship">Internship</option>
                    <option value="Part-Time Collaboration">Part-Time Collaboration</option>
                    <option value="Full-Time Role">Full-Time Role</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Duration *</label>
                  <input
                    type="text"
                    required
                    value={openDuration}
                    onChange={(e) => setOpenDuration(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Application Deadline *</label>
                  <input
                    type="text"
                    required
                    value={openDeadline}
                    onChange={(e) => setOpenDeadline(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Eligibility Criteria *</label>
                <input
                  type="text"
                  required
                  value={openEligibility}
                  onChange={(e) => setOpenEligibility(e.target.value)}
                  placeholder="CS/IT students or self-taught builders with React fundamentals"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Responsibilities (One per line)
                </label>
                <textarea
                  rows={3}
                  value={openResponsibilities}
                  onChange={(e) => setOpenResponsibilities(e.target.value)}
                  placeholder="Build responsive UI components&#10;Collaborate on REST API integration"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  External Application Form URL (Optional)
                </label>
                <input
                  type="text"
                  value={openLink}
                  onChange={(e) => setOpenLink(e.target.value)}
                  placeholder="https://..."
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Opening</span>
              </button>
            </form>

            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <h3 className="font-display text-lg font-bold">
                  Published &amp; Closed Role Openings ({store.openings.length})
                </h3>
                {store.openings.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No openings created yet. The public Careers page accurately states that
                    internships are not currently open.
                  </p>
                ) : (
                  store.openings.map((op) => (
                    <div
                      key={op.id}
                      className={`rounded-2xl border p-5 flex items-start justify-between gap-4 ${
                        isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div>
                        <p className="text-xs text-blue-400">
                          Status: {op.status} · {op.track} · {op.type} · Deadline: {op.deadline}
                        </p>
                        <h4 className="font-display text-base font-semibold mt-1">{op.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Duration: {op.duration} · Eligibility: {op.eligibility}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleOpeningStatus(op.id, op.status)}
                          className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium hover:bg-slate-800"
                        >
                          {op.status === 'Open' ? 'Close Role' : 'Re-Open Role'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOpening(op.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400"
                          aria-label="Delete opening"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-800/80">
                <h3 className="font-display text-lg font-bold">
                  Registered Career-Interest Submissions ({store.careerSubmissions.length})
                </h3>
                {store.careerSubmissions.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No career-interest registrations submitted yet.
                  </p>
                ) : (
                  store.careerSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className={`rounded-2xl border p-5 space-y-2 ${
                        isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-blue-400">
                          {sub.areaOfInterest} · {sub.status} ·{' '}
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateCareerSubmission(sub.id, 'Reviewed')}
                          className="px-2.5 py-1 rounded border border-slate-700 text-xs hover:bg-slate-800"
                        >
                          Mark Reviewed
                        </button>
                      </div>
                      <p className="text-sm font-semibold">
                        {sub.name} ({sub.email})
                      </p>
                      <p className="text-xs text-slate-400">Skills: {sub.skills}</p>
                      {sub.portfolioUrl && (
                        <p className="text-xs">
                          <a
                            href={sub.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                          >
                            {sub.portfolioUrl}
                          </a>
                        </p>
                      )}
                      <p className="text-xs text-slate-300 pt-1">{sub.introduction}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SETUP & DEPLOYMENT GUIDE */}
      {activeTab === 'setup' && (
        <div
          className={`rounded-2xl border p-7 sm:p-9 space-y-8 ${
            isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <h2 className="font-display text-2xl font-bold">
              Setup, Environment Variables &amp; Deployment Guide
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Complete operational handover for running and scaling the LOVANSTRIX platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-display text-base font-semibold text-blue-400">
                1. Local Development &amp; Build Commands
              </h3>
              <pre className="p-4 rounded-xl bg-[#050814] border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
{`# Install dependencies
npm install

# Start full-stack Express + Vite server on port 3000
npm run dev

# Type-check & build production bundle
npm run lint
npm run build

# Start production server
npm start`}
              </pre>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-base font-semibold text-blue-400">
                2. Environment Variables (.env)
              </h3>
              <pre className="p-4 rounded-xl bg-[#050814] border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
{`# Server-side Admin Passcode (locks /api/admin/*)
ADMIN_PASSCODE="choose-a-strong-passcode"

# Optional Webhook for real-time email forwarding
SMTP_WEBHOOK_URL="https://api.resend.com/..."

# Optional verified WhatsApp number (activates button)
COMPANY_WHATSAPP="919876543210"

# Optional Gemini API key for server-side Scope Planner
GEMINI_API_KEY="your-gemini-api-key"`}
              </pre>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/70 space-y-3">
            <h3 className="font-display text-base font-semibold text-blue-400">
              3. Free-Tier Cloud Deployment &amp; Database Upgrade Path
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>
                • <strong>Cloud Run / Render / Railway:</strong> Deploy directly as a Node.js web
                service running <code className="font-mono">npm run build &amp;&amp; npm start</code>.
              </li>
              <li>
                • <strong>Database Upgrade (Firebase Firestore or PostgreSQL):</strong> The current
                server persists data to <code className="font-mono">data/lovanstrix-store.json</code>{' '}
                so it works immediately with zero external billing. When deploying to stateless
                containers, connect Firebase Firestore or Cloud SQL inside{' '}
                <code className="font-mono">server.ts</code>.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
