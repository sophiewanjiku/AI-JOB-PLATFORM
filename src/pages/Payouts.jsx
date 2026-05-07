import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getUserPayouts, getPaymentMethod, connectMpesa } from '../api/payouts';

// Status pill colors
const StatusPill = ({ status }) => {
  const styles = {
    paid:       'bg-green-50 text-green-700',
    approved:   'bg-amber-50 text-amber-700',
    pending:    'bg-amber-50 text-amber-700',
    processing: 'bg-blue-50 text-blue-700',
    failed:     'bg-red-50 text-red-700',
    rejected:   'bg-red-50 text-red-700',
  };
  const labels = {
    paid:       'Paid',
    approved:   'Awaiting Payout',
    pending:    'Pending Verification',
    processing: 'Processing',
    failed:     'Failed',
    rejected:   'Rejected',
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
};

export default function Payouts() {
  const [payouts, setPayouts]           = useState([]);
  const [summary, setSummary]           = useState({});
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading]           = useState(true);

  // Edit payment method state
  const [editing, setEditing]           = useState(false);
  const [newPhone, setNewPhone]         = useState('');
  const [newName, setNewName]           = useState('');
  const [saving, setSaving]             = useState(false);
  const [saveMsg, setSaveMsg]           = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [payoutData, pmData] = await Promise.all([
          getUserPayouts(),
          getPaymentMethod(),
        ]);
        setPayouts(payoutData.payouts);
        setSummary({
          total_earned:   payoutData.total_earned,
          pending_amount: payoutData.pending_amount,
        });
        setPaymentMethod(pmData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Update M-Pesa number
  const handleUpdateMpesa = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await connectMpesa(newPhone, newName);
      setPaymentMethod({ connected: true, ...result });
      setEditing(false);
      setSaveMsg('M-Pesa account updated successfully');
    } catch (err) {
      console.error(err);
      setSaveMsg('Failed to update. Check your number and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f0f2f5]">
      <p className="text-sm text-gray-400">Loading payouts...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-[#0a1628]">Manage Payouts</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Track your earnings and connected payment account
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Total Earned</p>
            <p className="text-2xl font-semibold text-[#0a1628]">
              ${summary.total_earned?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-blue-400 mt-1">All time</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Pending Amount</p>
            <p className="text-2xl font-semibold text-[#0a1628]">
              ${summary.pending_amount?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-amber-500 mt-1">In review or processing</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-1">Total Payouts</p>
            <p className="text-2xl font-semibold text-[#0a1628]">{payouts.length}</p>
            <p className="text-xs text-gray-400 mt-1">All transactions</p>
          </div>
        </div>

        {/* M-Pesa connection card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#0a1628]">
              Payment Method
            </h2>
            {paymentMethod?.connected && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-blue-500 hover:underline">
                Update
              </button>
            )}
          </div>

          {saveMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700
              rounded-lg p-2 text-xs mb-3">
              {saveMsg}
            </div>
          )}

          {paymentMethod?.connected && !editing ? (
            /* Connected state */
            <div className="flex items-center gap-4 p-3 bg-green-50
              border border-green-200 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex
                items-center justify-center text-lg">
                📱
              </div>
              <div>
                <p className="text-sm font-medium text-[#0a1628]">
                  {paymentMethod.account_name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {paymentMethod.masked_phone}
                </p>
              </div>
              <span className="ml-auto text-[10px] bg-green-100 text-green-700
                font-medium px-2 py-1 rounded-full">
                ✓ Connected
              </span>
            </div>
          ) : (
            /* Connect / Edit form */
            <form onSubmit={handleUpdateMpesa} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                  placeholder="e.g. My M-Pesa"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  required
                  placeholder="+254712345678"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving}
                  className="bg-[#0a1628] text-white text-xs font-medium px-4
                    py-2 rounded-lg hover:bg-[#1e3a5f] transition disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save M-Pesa'}
                </button>
                {editing && (
                  <button type="button" onClick={() => setEditing(false)}
                    className="text-xs text-gray-400 border border-gray-200 px-4
                      py-2 rounded-lg hover:bg-gray-50 transition">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Payout history table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-[#0a1628] mb-4">
            Payout History
          </h2>
          {payouts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No payouts yet — complete tasks to start earning!
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  {['Task', 'Amount', 'Accuracy', 'Date', 'M-Pesa Ref', 'Status'].map(h => (
                    <th key={h} className="text-left text-[10px] font-medium
                      text-gray-400 uppercase tracking-wide pb-2
                      border-b border-gray-50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-xs font-medium text-[#0a1628] max-w-[180px] truncate">
                      {p.task}
                    </td>
                    <td className="py-3 text-xs font-semibold text-[#0a1628]">
                      ${parseFloat(p.amount).toFixed(2)}
                    </td>
                    <td className="py-3 text-xs text-gray-500">
                      {p.accuracy ? `${p.accuracy}%` : '—'}
                    </td>
                    <td className="py-3 text-xs text-gray-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-xs text-gray-400 font-mono">
                      {p.mpesa_ref || '—'}
                    </td>
                    <td className="py-3">
                      <StatusPill status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}