// Base URL for all API requests — points to your running Django server
const BASE_URL = 'http://localhost:8000/api/auth';

// Sends registration data to Django and returns the user + tokens
export const registerUser = async (formData) => {
  const response = await fetch(`${BASE_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  // Parse the JSON response from Django
  const data = await response.json();

  // If the request failed, throw the error so the UI can display it
  if (!response.ok) throw data;

  return data;
};

// Sends login credentials to Django and returns the user + tokens
export const loginUser = async (formData) => {
  const response = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) throw data;

  return data;
};