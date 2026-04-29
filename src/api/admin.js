// Base URL pointing to your Django admin endpoints
const BASE_URL = 'http://localhost:8000/api/auth';

// Helper that adds the JWT token to every admin request
// Admin endpoints require authentication
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('access')}`,
});

// Fetches platform-wide stats for the dashboard header cards
export const fetchAdminStats = async () => {
  const response = await fetch(`${BASE_URL}/admin/stats/`, {
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Fetches the full list of registered users
export const fetchAdminUsers = async () => {
  const response = await fetch(`${BASE_URL}/admin/users/`, {
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Toggles a user's active/flagged status by their ID
export const toggleUserActive = async (userId) => {
  const response = await fetch(`${BASE_URL}/admin/users/${userId}/toggle/`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};