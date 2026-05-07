import { useState } from 'react';
import { connectMpesa } from '../api/payouts';
import { useNavigate } from 'react-router-dom';

export default function MpesaSetup() {
  const navigate   = useNavigate();
  const [phone, setPhone]   = useState('');
  const [name, setName]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await connectMpesa(phone, name);
      // Mark payment method as set in localStorage
      // so we don't show this screen again
      localStorage.setItem('payment_method_set', 'true');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.error || 'Failed to connect. Please check your number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-[#0a1628] rounded-xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="3.5" fill="#4a90d9"/>
              <path d="M9 2v2M9 14v2M2 9h2M14 9h2"
                stroke="#4a90d9" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#0a1628]">Taskr AI</span>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-bold text-[#0a1628] mb-1">
          Connect your M-Pesa
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Before you can start working and earning, you need to connect your
          M-Pesa account so we know where to send your payments.
        </p>

        {/* Why we need this */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6">
          <p className="text-xs text-blue-700 font-medium mb-1">🔒 Your details are safe</p>
          <p className="text-xs text-blue-600">
            Your phone number is encrypted and stored securely.
            It is only used to send you earnings — never shared with anyone.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600
            rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Account nickname */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Account Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. My M-Pesa"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5
                text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Phone number */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              M-Pesa Phone Number
            </label>
            <div className="relative">
              {/* Kenya flag prefix */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2
                flex items-center gap-1.5 text-sm text-gray-500 border-r
                border-gray-200 pr-3">
                🇰🇪 +254
              </div>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                placeholder="712 345 678"
                className="w-full border border-gray-200 rounded-lg pl-24 pr-4
                  py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Enter your number without the country code e.g. 712345678
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0a1628] hover:bg-[#1e3a5f] text-white
              font-semibold py-3 rounded-xl text-sm transition disabled:opacity-50">
            {loading ? 'Connecting...' : 'Connect M-Pesa & Continue'}
          </button>
        </form>

        {/* Skip option — will prompt again next login */}
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full text-xs text-gray-400 mt-3 hover:text-gray-600 transition">
          Skip for now — remind me later
        </button>
      </div>
    </div>
  );
}