import { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { fetchAdminStats, fetchAdminUsers, toggleUserActive } from '../api/admin';

// ── Stat card for platform metrics ──
const StatCard = ({ label, value, sub, subColor }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
    <p className="text-xs text-gray-400 mb-1.5">{label}</p>
    <p className="text-2xl font-semibold text-[#0a1628]">{value}</p>
    <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>
  </div>
);

// ── Status pill for submission review table ──
const StatusPill = ({ status }) => {
  const styles = {
    'Pending':  'bg-amber-50 text-amber-700',
    'Approved': 'bg-green-50 text-green-700',
    'Rejected': 'bg-red-50 text-red-700',
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
};

// ── Earnings bar for task category breakdown ──
const Bar = ({ label, value, pct, color }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs text-gray-400 mb-1">
      <span>{label}</span>
      <span className="font-medium text-[#0a1628]">{value}</span>
    </div>
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  </div>
);

// ── Activity feed item ──
const ActivityItem = ({ dotColor, text, time }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
    <p className="flex-1 text-xs text-[#0a1628] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: text }} />
    <span className="text-[11px] text-gray-400 whitespace-nowrap">{time}</span>
  </div>
);

export default function AdminDashboard() {
  // Platform stats fetched from Django
  const [stats, setStats] = useState(null);

  // Full user list fetched from Django
  const [users, setUsers] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch both stats and users when the page first loads
  useEffect(() => {
    const loadData = async () => {
      try {
        // Run both requests in parallel for speed
        const [statsData, usersData] = await Promise.all([
          fetchAdminStats(),
          fetchAdminUsers(),
        ]);
        setStats(statsData);
        setUsers(usersData);
      } catch (err) {
        setError('Failed to load admin data. Make sure you are logged in as an admin.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handles toggling a user's active/flagged status
  const handleToggleUser = async (userId) => {
    try {
      const result = await toggleUserActive(userId);
      // Update the local user list so the UI reflects the change immediately
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, is_active: result.is_active } : u)
      );
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f0f2f5]">
      <p className="text-sm text-gray-400">Loading admin dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="flex h-screen items-center justify-center bg-[#f0f2f5]">
      <p className="text-sm text-red-400">{error}</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden">

      {/* ── Admin sidebar navigation ── */}
      <AdminSidebar />

      {/* ── Scrollable main content ── */}
      <main className="flex-1 overflow-y-auto p-6">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-[#0a1628]">Platform Overview</h1>
            <p className="text-sm text-gray-400 mt-0.5">All systems operational</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Export button — placeholder for future CSV export */}
            <button className="bg-white border border-gray-200 text-[#0a1628] text-xs
              font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition">
              Export Report
            </button>
            {/* Upload tasks button — links to upload page */}
            <button className="bg-[#0a1628] text-white text-xs font-medium px-4 py-2
              rounded-lg shadow-sm hover:bg-[#1e3a5f] transition">
              + Upload Tasks
            </button>
          </div>
        </div>

        {/* ── Row 1: Stat cards (live from Django) ── */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          <StatCard label="Total Users"       value={stats?.total_users    ?? '—'} sub="Registered accounts"    subColor="text-blue-400" />
          <StatCard label="Verified Users"    value={stats?.verified_users ?? '—'} sub="ID confirmed"           subColor="text-green-500" />
          <StatCard label="Flagged Accounts"  value={stats?.flagged_users  ?? '—'} sub="Requires review"        subColor="text-red-400" />
          <StatCard label="Active Tasks"      value="312"                          sub="12 added today"         subColor="text-amber-500" />
        </div>

        {/* ── Row 2: Submissions table + Flagged accounts ── */}
        <div className="grid grid-cols-2 gap-4 mb-4">

          {/* Recent submissions table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#0a1628]">Pending Review</h2>
              <button className="text-xs text-blue-500 hover:underline">View all</button>
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  {/* Table column headers */}
                  {['Worker', 'Task', 'Submitted', 'Status', ''].map(h => (
                    <th key={h} className="text-left text-[10px] font-medium text-gray-400
                      uppercase tracking-wide pb-2 border-b border-gray-50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Static sample rows — replace with API data when task model is built */}
                {[
                  { name: 'Jane D.',  task: 'Image classification', time: '2h ago',  status: 'Pending'  },
                  { name: 'Mark O.',  task: 'Sentiment labeling',   time: '3h ago',  status: 'Pending'  },
                  { name: 'Amina K.', task: 'Audio transcription',  time: '5h ago',  status: 'Approved' },
                  { name: 'Peter N.', task: 'Data verification',    time: '6h ago',  status: 'Rejected' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-xs font-medium text-[#0a1628]">{row.name}</td>
                    <td className="py-2.5 text-xs text-gray-400">{row.task}</td>
                    <td className="py-2.5 text-xs text-gray-400">{row.time}</td>
                    <td className="py-2.5"><StatusPill status={row.status} /></td>
                    <td className="py-2.5 text-xs text-blue-500 cursor-pointer hover:underline">
                      {row.status === 'Pending' ? 'Review' : 'View'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User list — live from Django, with toggle action */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#0a1628]">All Users</h2>
              <span className="text-xs text-gray-400">{users.length} total</span>
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {users.slice(0, 8).map(user => (
                <div key={user.id} className="flex items-center gap-3 py-2
                  border-b border-gray-50 last:border-0">

                  {/* User initials avatar */}
                  <div className="w-7 h-7 rounded-full bg-[#0a1628] flex items-center
                    justify-center text-[10px] font-medium text-blue-400 flex-shrink-0">
                    {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#0a1628] truncate">{user.full_name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  </div>

                  {/* Verified badge */}
                  {user.is_verified && (
                    <span className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}

                  {/* Toggle active/flagged button */}
                  <button
                    onClick={() => handleToggleUser(user.id)}
                    className={`text-[10px] px-2 py-1 rounded-lg transition
                      ${user.is_active
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                  >
                    {user.is_active ? 'Flag' : 'Restore'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Task volume + Payouts + Activity ── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Task category volume bars */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-[#0a1628] mb-4">Task Category Volume</h2>
            <Bar label="Data labeling"  value="142" pct={90} color="bg-[#0a1628]" />
            <Bar label="Transcription"  value="78"  pct={49} color="bg-blue-400" />
            <Bar label="Verification"   value="54"  pct={34} color="bg-[#1e3a5f]" />
            <Bar label="Dataset review" value="38"  pct={24} color="bg-gray-300" />
          </div>

          {/* Payout summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-[#0a1628] mb-3">Payout Summary</h2>
            <p className="text-2xl font-semibold text-[#0a1628] mb-3">$24,310</p>
            <p className="text-xs text-gray-400 mb-3">Total paid out this month</p>
            {[
              { label: 'M-Pesa',        value: '$12,400 · 128 workers', color: 'bg-green-500' },
              { label: 'Bank transfer', value: '$8,910 · 64 workers',   color: 'bg-blue-400' },
              { label: 'Pending',       value: '$3,000 · 23 workers',   color: 'bg-amber-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
                <div>
                  <p className="text-xs font-medium text-[#0a1628]">{item.label}</p>
                  <p className="text-[11px] text-gray-400">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent platform activity */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-semibold text-[#0a1628] mb-3">Recent Activity</h2>
            <ActivityItem dotColor="bg-green-400"  text="New user registered — <strong>amina.k</strong>"          time="2m" />
            <ActivityItem dotColor="bg-blue-400"   text="Task uploaded — <strong>NLP batch 9</strong>"            time="18m" />
            <ActivityItem dotColor="bg-amber-400"  text="Payout approved — <strong>$320 to Mark O.</strong>"      time="1h" />
            <ActivityItem dotColor="bg-red-400"    text="Account flagged — <strong>worker_4421</strong>"          time="2h" />
            <ActivityItem dotColor="bg-green-400"  text="Submission approved — <strong>Audio set C</strong>"      time="3h" />
          </div>
        </div>

      </main>
    </div>
  );
}