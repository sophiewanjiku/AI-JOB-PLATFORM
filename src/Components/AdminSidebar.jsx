import { useState } from 'react';
import { NavLink } from 'react-router-dom';

// ── Logo mark — same Taskr AI icon ──
const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="3.5" fill="#4a90d9" />
    <path
      d="M9 2v2M9 14v2M2 9h2M14 9h2M4.05 4.05l1.41 1.41M12.54 12.54l1.41 1.41M4.05 13.95l1.41-1.41M12.54 5.46l1.41-1.41"
      stroke="#4a90d9" strokeWidth="1.5" strokeLinecap="round"
    />
  </svg>
);

// ── Single nav link with icon, label and optional badge ──
const NavItem = ({ icon, label, to, badge, expanded }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 w-full transition-all duration-150
       border-l-2 ${isActive
        ? 'bg-white/10 border-blue-400 text-white'
        : 'border-transparent text-[#c8d8e8] hover:bg-white/[0.07]'}`
    }
  >
    {/* Icon — always visible */}
    <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
      {icon}
    </span>

    {/* Label — fades in when expanded */}
    <span className={`text-xs whitespace-nowrap transition-all duration-200
      ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {label}
    </span>

    {/* Badge — alert count, red for admin urgency */}
    {badge && (
      <span className={`ml-auto bg-red-500 text-white text-[9px] font-medium
        px-1.5 py-0.5 rounded-full transition-opacity duration-200
        ${expanded ? 'opacity-100' : 'opacity-0'}`}>
        {badge}
      </span>
    )}
  </NavLink>
);

// ── Section heading ──
const SectionLabel = ({ label, expanded }) => (
  <p className={`text-[9px] font-medium text-[#4a6080] uppercase tracking-widest
    px-4 mb-1 mt-1 whitespace-nowrap transition-opacity duration-200
    ${expanded ? 'opacity-100' : 'opacity-0'}`}>
    {label}
  </p>
);

export default function AdminSidebar() {
  // Controls collapsed/expanded state on hover
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`h-screen bg-[#0a1628] flex flex-col flex-shrink-0 overflow-hidden
        z-20 transition-all duration-300 ease-in-out
        ${expanded ? 'w-56' : 'w-16'}`}
    >
      {/* ── Logo + Admin badge ── */}
      <div className="flex items-center gap-3 px-4 py-5 mb-2">
        <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center flex-shrink-0">
          <Logo />
        </div>
        <div className={`transition-all duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-white text-sm font-medium whitespace-nowrap leading-tight">Taskr AI</p>
          {/* Admin badge — distinguishes this from the worker sidebar */}
          <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-medium">
            Admin
          </span>
        </div>
      </div>

      {/* ── OVERVIEW section ── */}
      <div className="mb-3">
        <SectionLabel label="Overview" expanded={expanded} />
        <NavItem expanded={expanded} to="/admin/dashboard" label="Dashboard" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="#4a90d9" />
            <rect x="9" y="2" width="5" height="5" rx="1" fill="#4a90d9" opacity=".5" />
            <rect x="2" y="9" width="5" height="5" rx="1" fill="#4a90d9" opacity=".5" />
            <rect x="9" y="9" width="5" height="5" rx="1" fill="#4a90d9" opacity=".5" />
          </svg>
        } />
        <NavItem expanded={expanded} to="/admin/analytics" label="Analytics" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 12l3-4 3 2 3-5 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        } />
      </div>

      {/* ── TASK MANAGEMENT section ── */}
      <div className="mb-3">
        <SectionLabel label="Task Management" expanded={expanded} />
        <NavItem expanded={expanded} to="/admin/tasks" label="All Tasks" badge="12" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M6 6h4M6 9h4M6 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        } />
        <NavItem expanded={expanded} to="/admin/review" label="Pending Review" badge="7" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        } />
        <NavItem expanded={expanded} to="/admin/upload" label="Upload Tasks" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 10V4M5 7l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 13h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        } />
      </div>

      {/* ── USERS section ── */}
      <div className="mb-3">
        <SectionLabel label="Users" expanded={expanded} />
        <NavItem expanded={expanded} to="/admin/users" label="All Users" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2 13c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M11 5a2 2 0 1 1 0-4M14 13c0-1.86-1.27-3.41-3-3.86" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        } />
        <NavItem expanded={expanded} to="/admin/flagged" label="Flagged Accounts" badge="3" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 2v12M3 2l8 3-8 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        } />
        <NavItem expanded={expanded} to="/admin/verification" label="Verification Queue" badge="9" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 5l-5 5-2-2-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        } />
      </div>

      {/* ── FINANCE section ── */}
      <div className="mb-3">
        <SectionLabel label="Finance" expanded={expanded} />
        <NavItem expanded={expanded} to="/admin/payouts" label="Payouts" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          </svg>
        } />
        <NavItem expanded={expanded} to="/admin/reports" label="Revenue Reports" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M6 6h4M6 9h4M6 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        } />
      </div>

      {/* ── BOTTOM: Settings + Admin avatar ── */}
      <div className="mt-auto border-t border-white/5">
        <NavItem expanded={expanded} to="/admin/settings" label="Settings" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 2v1M8 13v1M2 8h1M13 8h1M3.76 3.76l.71.71M11.53 11.53l.71.71M3.76 12.24l.71-.71M11.53 4.47l.71-.71"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        } />

        {/* Admin avatar at the very bottom */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-white/5">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center
            text-[11px] font-medium text-white flex-shrink-0">
            AD
          </div>
          <div className={`transition-all duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-xs text-[#c8d8e8] whitespace-nowrap">Admin User</p>
            <p className="text-[10px] text-[#4a6080] whitespace-nowrap">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}