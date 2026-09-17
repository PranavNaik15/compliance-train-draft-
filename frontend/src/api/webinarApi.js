const API_BASE = '/api';

export async function getWebinars() {
  const response = await fetch(`${API_BASE}/webinars`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch webinars.');
  }
  const result = await response.json();
  return result.data || result;
}

export async function getWebinarById(id) {
  const response = await fetch(`${API_BASE}/webinars/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Webinar with ID "${id}" not found.`);
  }
  const result = await response.json();
  return result.data || result;
}

export async function registerForWebinar(registrationData) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(registrationData),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.message || 'Registration failed.');
    err.errors = data.errors || [data.message];
    throw err;
  }

  return data;
}
