const BASE_URL = 'http://localhost:8000/api/auth';

// Helper to attach JWT token to requests
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('access')}`,
});

// Fetch all published tasks — supports search and filter params
export const fetchTasks = async (params = {}) => {
  // Build query string from filter object e.g. { search: 'image', category: 'labeling' }
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/tasks/?${query}`);
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Fetch a single task by ID
export const fetchTaskDetail = async (taskId) => {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}/`);
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Toggle save/unsave a task — requires login
export const toggleSaveTask = async (taskId) => {
  const response = await fetch(`${BASE_URL}/tasks/${taskId}/save/`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Fetch all tasks saved by the logged-in user
export const fetchSavedTasks = async () => {
  const response = await fetch(`${BASE_URL}/tasks/saved/`, {
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};

// Admin — upload a new task from the form
export const uploadTask = async (formData) => {
  const response = await fetch(`${BASE_URL}/admin/tasks/upload/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(formData),
  });
  const data = await response.json();
  if (!response.ok) throw data;
  return data;
};