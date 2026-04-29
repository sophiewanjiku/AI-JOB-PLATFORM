import Sidebar from '../components/Sidebar';

// ── Stat card — shows a single metric at the top of the page ──
const StatCard = ({ label, value, sub, subColor }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
    <p className="text-xs text-gray-400 mb-1.5">{label}</p>
    <p className="text-2xl font-semibold text-[#0a1628]">{value}</p>
    <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>
  </div>
);

// ── Status pill — color-coded badge for job status ──
const StatusPill = ({ status }) => {
  const styles = {
    'Active':     'bg-blue-50 text-blue-700',
    'In review':  'bg-amber-50 text-amber-700',
    'Approved':   'bg-green-50 text-green-700',
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

// ── Job row — one ongoing task in the list ──
const JobRow = ({ name, due, amount, status, dotColor }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
    {/* Colored dot indicating job status at a glance */}
    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-[#0a1628] truncate">{name}</p>
      <p className="text-xs text-gray-400 mt-0.5">Due {due} · {amount}</p>
    </div>
    <StatusPill status={status} />
  </div>
);

// ── Activity item — one entry in the recent activity feed ──
const ActivityItem = ({ emoji, bg, text, time }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center text-sm flex-shrink-0`}>
      {emoji}
    </div>
    <div className="flex-1 min-w-0">
      {/* dangerouslySetInnerHTML lets us bold parts of the text */}
      <p className="text-xs text-[#0a1628] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: text }} />
      <p className="text-[11px] text-gray-400 mt-0.5">{time}</p>
    </div>
  </div>
);

// ── Earnings bar — horizontal bar showing income by category ──
const EarningsBar = ({ label, amount, pct, color }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs text-gray-400 mb-1">
      <span>{label}</span>
      <span className="font-medium text-[#0a1628]">{amount}</span>
    </div>
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  </div>
);

export default function Dashboard() {
  // Get the logged-in user's info from localStorage (saved during login)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const firstName = user.full_name?.split(' ')[0] || 'there';

  // Show a different greeting depending on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // User's initials for the avatar in the top bar
  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden">

      {/* ── Collapsible left sidebar ── */}
      <Sidebar />

      {/* ── Scrollable main content ── */}
      <main className="flex-1 overflow-y-auto p-6">

        {/* Top bar: greeting + notification bell + avatar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-[#0a1628]">{greeting}, {firstName}</h1>
            <p className="text-sm text-gray-400 mt-0.5">Here's what's happening with your work today</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification bell with unread dot */}
            <button className="relative w-9 h-9 bg-white border border-gray-100 rounded-lg
              flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2a4 4 0 0 1 4 4c0 3 1 4 1 4H3s1-1 1-4a4 4 0 0 1 4-4zM6.5 13a1.5 1.5 0 0 0 3 0"
                  stroke="#0a1628" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </button>
            {/* Avatar circle with user initials */}
            <div className="w-9 h-9 rounded-full bg-[#0a1628] flex items-center justify-center
              text-xs font-medium text-blue-400">
              {initials}
            </div>
          </div>
        </div>

        {/* ── Row 1: Stat cards ── */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          <StatCard label="Ongoing Jobs"   value="3"      sub="2 due this week"     subColor="text-blue-400" />
          <StatCard label="Total Earned"   value="$1,240" sub="+$320 this month"    subColor="text-green-500" />
          <StatCard label="Proposals Sent" value="7"      sub="2 awaiting response" subColor="text-amber-500" />
          <StatCard label="Success Rate"   value="94%"    sub="Above average"       subColor="text-blue-400" />
        </div>

        {/* ── Row 2: Ongoing jobs + Recent activity ── */}
        <div className="grid grid-cols-2 gap-4 mb-4">

          {/* Ongoing jobs list */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-[#0a1628]">Ongoing Jobs</h2>
              <button className="text-xs text-blue-500 hover:underline">View all</button>
            </div>
            <JobRow name="Image classification — batch 4" due="Apr 30" amount="$120" status="Active"     dotColor="bg-blue-400" />
            <JobRow name="Sentiment labeling dataset"      due="May 2"  amount="$85"  status="In review" dotColor="bg-amber-400" />
            <JobRow name="Audio transcription — set B"     due="May 5"  amount="$200" status="Active"     dotColor="bg-green-400" />
          </div>

          {/* Recent activity feed */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-[#0a1628]">Recent Activity</h2>
              <button className="text-xs text-blue-500 hover:underline">See all</button>
            </div>
            <ActivityItem emoji="💬" bg="bg-blue-50"  text="New message on <strong>Image classification</strong>" time="10 mins ago" />
            <ActivityItem emoji="✓"  bg="bg-green-50" text="Submission approved — <strong>NLP batch 3</strong>"    time="2 hours ago" />
            <ActivityItem emoji="$"  bg="bg-amber-50" text="Payout of <strong>$95.00</strong> sent to M-Pesa"      time="Yesterday" />
          </div>
        </div>

        {/* ── Row 3: Monthly earnings breakdown ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-[#0a1628] mb-4">Monthly Earnings Breakdown</h2>
          <div className="grid grid-cols-2 gap-x-8">
            <div>
              <EarningsBar label="Data labeling" amount="$640" pct={82} color="bg-[#0a1628]" />
              <EarningsBar label="Transcription"  amount="$320" pct={41} color="bg-blue-400" />
            </div>
            <div>
              <EarningsBar label="Verification tasks" amount="$180" pct={23} color="bg-[#1e3a5f]" />
              <EarningsBar label="Dataset review"     amount="$100" pct={13} color="bg-gray-300" />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}