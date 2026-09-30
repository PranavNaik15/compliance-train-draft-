const API_BASE = '/api';

export async function getWebinars() {
  const response = await fetch(`${API_BASE}/webinars?site=bridge`);
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
    body: JSON.stringify({ website: 'BRIDGE', ...registrationData }),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.message || 'Registration failed.');
    err.errors = data.errors || [data.message];
    throw err;
  }

  return data;
}

export async function getWebsiteContent(section) {
  try {
    const url = section
      ? `${API_BASE}/website-content?website=BRIDGE&section=${encodeURIComponent(section)}`
      : `${API_BASE}/website-content?website=BRIDGE`;
    const res = await fetch(url);
    if (!res.ok) return {};
    const json = await res.json();
    const list = json.data || json || [];
    const map = {};
    if (Array.isArray(list)) {
      list.forEach((item) => {
        if (item.status !== 'INACTIVE') {
          map[item.key] = item.content;
          map[`${item.section}_${item.key}`] = item.content;
        }
      });
    }
    return map;
  } catch (e) {
    return {};
  }
}
