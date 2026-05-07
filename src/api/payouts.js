const BASE_URL = 'http://localhost:8000/api/auth';

// Attach JWT token to every request
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('access')}`,
});

// Get the user's connected payment method
export const getPaymentMethod = async () => {
  const res = await fetch(`${BASE_URL}/payment-method/`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// Connect or update M-Pesa number
export const connectMpesa = async (phone_number, account_name) => {
  const res = await fetch(`${BASE_URL}/payment-method/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ phone_number, account_name }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// Get user's payout history and summary
export const getUserPayouts = async () => {
  const res = await fetch(`${BASE_URL}/payouts/`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// Admin — get all payouts, optionally filtered by status
export const getAdminPayouts = async (status = '') => {
  const query = status ? `?status=${status}` : '';
  const res = await fetch(`${BASE_URL}/admin/payouts/${query}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// Admin — verify or reject a submission
export const verifyPayout = async (payoutId, action, accuracy_score, admin_notes = '') => {
  const res = await fetch(`${BASE_URL}/admin/payouts/${payoutId}/verify/`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ action, accuracy_score, admin_notes }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// Admin — send actual M-Pesa payout via Daraja
export const sendPayout = async (payoutId) => {
  const res = await fetch(`${BASE_URL}/admin/payouts/${payoutId}/send/`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};