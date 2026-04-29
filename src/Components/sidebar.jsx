import { useState } from 'react';
import { NavLink } from 'react-router-dom';

// ── Logo SVG — the Taskr AI icon mark ──
const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="3.5" fill="#4a90d9" />
    <path
      d="M9 2v2M9 14v2M2 9h2M14 9h2M4.05 4.05l1.41 1.41M12.54 12.54l1.41 1.41M4.05 13.95l1.41-1.41M12.54 5.46l1.41-1.41"
      stroke="#4a90d9" strokeWidth="1.5" strokeLinecap="round"
    />
  </svg>
);

// ── A single nav link with icon, label, and optional badge ──
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
    {/* Icon is always visible even when sidebar is collapsed */}
    <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
      {icon}
    </span>

    {/* Label fades in when sidebar expands on hover */}
    <span className={`text-xs whitespace-nowrap transition-all duration-200
      ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {label}
    </span>

    {/* Badge shows unread count — only visible when expanded */}
    {badge && (
      <span className={`ml-auto bg-blue-500 text-white text-[9px] font-medium
        px-1.5 py-0.5 rounded-full transition-opacity duration-200
        ${expanded ? 'opacity-100' : 'opacity-0'}`}>
        {badge}
      </span>
    )}
  </NavLink>
);

// ── Small uppercase section heading inside the sidebar ──
const SectionLabel = ({ label, expanded }) => (
  <p className={`text-[9px] font-medium text-[#4a6080] uppercase tracking-widest
    px-4 mb-1 mt-1 whitespace-nowrap transition-opacity duration-200
    ${expanded ? 'opacity-100' : 'opacity-0'}`}>
    {label}
  </p>
);

export default function Sidebar() {
  // Controls whether sidebar is wide (hovered) or narrow (icon only)
  const [expanded, setExpanded] = useState(false);

  // Pull logged-in user from localStorage to show initials at the bottom
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`h-screen bg-[#0a1628] flex flex-col flex-shrink-0 overflow-hidden
        z-20 transition-all duration-300 ease-in-out
        ${expanded ? 'w-56' : 'w-16'}`}
    >
      {/* ── Logo area ── */}
      <div className="flex items-center gap-3 px-4 py-5 mb-2">
        <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center flex-shrink-0">
          <Logo />
        </div>
        <div className={`transition-all duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-white text-sm font-medium whitespace-nowrap leading-tight">Taskr AI</p>
          <p className="text-[#4a6080] text-[10px] whitespace-nowrap">Marketplace</p>
        </div>
      </div>

      {/* ── MY JOBS section ── */}
      <div className="mb-3">
        <SectionLabel label="My Jobs" expanded={expanded} />
        <NavItem expanded={expanded} to="/dashboard" label="Ongoing Jobs" badge={3} icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="#4a90d9" />
            <rect x="9" y="2" width="5" height="5" rx="1" fill="#4a90d9" opacity=".5" />
            <rect x="2" y="9" width="5" height="5" rx="1" fill="#4a90d9" opacity=".5" />
            <rect x="9" y="9" width="5" height="5" rx="1" fill="#4a90d9" opacity=".5" />
          </svg>
        } />
        <NavItem expanded={expanded} to="/messages" label="Messages" badge={5} icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        } />
        <NavItem expanded={expanded} to="/notifications" label="Notifications" badge={2} icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2a4 4 0 0 1 4 4c0 3 1 4 1 4H3s1-1 1-4a4 4 0 0 1 4-4zM6.5 13a1.5 1.5 0 0 0 3 0"
              stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        } />
      </div>

      {/* ── FIND WORK section ── */}
      <div className="mb-3">
        <SectionLabel label="Find Work" expanded={expanded} />
        <NavItem expanded={expanded} to="/find-jobs" label="Find Jobs" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        } />
        <NavItem expanded={expanded} to="/proposals" label="My Proposals" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 5h10M3 8h7M3 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        } />
      </div>

      {/* ── PREVIOUS section ── */}
      <div className="mb-3">
        <SectionLabel label="Previous" expanded={expanded} />
        <NavItem expanded={expanded} to="/completed" label="Completed Jobs" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 5l-5 5-2-2-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        } />
        <NavItem expanded={expanded} to="/invoices" label="Invoices & Reports" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M6 6h4M6 9h4M6 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        } />
        <NavItem expanded={expanded} to="/payouts" label="Manage Payouts" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          </svg>
        } />
      </div>

      {/* ── BOTTOM: profile link + avatar ── */}
      <div className="mt-auto border-t border-white/5">
        <NavItem expanded={expanded} to="/profile" label="My Profile" icon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        } />

        {/* User avatar row at the very bottom */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-white/5">
          <div className="w-7 h-7 rounded-full bg-[#1e3a5f] flex items-center justify-center
            text-[11px] font-medium text-blue-400 flex-shrink-0">
            {initials}
          </div>
          <span className={`text-xs text-[#c8d8e8] whitespace-nowrap transition-all duration-200
            ${expanded ? 'opacity-100' : 'opacity-0'}`}>
            {user.full_name || 'User'}
          </span>
        </div>
      </div>
    </aside>
  );
}