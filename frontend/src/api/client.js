const BASE = 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('access_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.detail || `Request failed: ${res.status}`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────
  auth: {
    me: () => request('/auth/me'),
    refresh: (refresh_token) =>
      request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token }) }),
  },

  // ── Student ───────────────────────────────────────────────
  student: {
    getProfile:    () => request('/students/profile'),
    updateProfile: (data) => request('/students/profile', { method: 'PUT', body: JSON.stringify(data) }),

    getResume: () => request('/students/resume'),
    uploadResume: (file) => {
      const form = new FormData();
      form.append('file', file);
      return request('/students/resume', { method: 'POST', body: form });
    },

    browseJobs: (params = {}) => {
      // Strip empty/undefined params
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      return request(`/students/jobs?${new URLSearchParams(clean)}`);
    },
    applyJob: (jobId, data) =>
      request(`/students/jobs/${jobId}/apply`, { method: 'POST', body: JSON.stringify(data) }),
    getApplications: () => request('/students/applications'),
  },

  // ── Recruiter ─────────────────────────────────────────────
  recruiter: {
    getProfile:    () => request('/recruiters/profile'),
    updateProfile: (data) =>
      request('/recruiters/profile', { method: 'PUT', body: JSON.stringify(data) }),
    searchStudents: (params = {}) => {
      const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      return request(`/recruiters/students/search?${new URLSearchParams(clean)}`);
    },
    getStudent: (id) => request(`/recruiters/students/${id}`),
  },

  // ── Jobs ──────────────────────────────────────────────────
  jobs: {
    list:       (params = {}) => request(`/jobs?${new URLSearchParams(params)}`),
    get:        (id) => request(`/jobs/${id}`),
    myListings: () => request('/jobs/my/listings'),
    create:     (data) => request('/jobs', { method: 'POST', body: JSON.stringify(data) }),
    update:     (id, data) => request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete:     (id) => request(`/jobs/${id}`, { method: 'DELETE' }),
    getApplicants: (jobId) => request(`/jobs/${jobId}/applicants`),
    updateStatus: (jobId, appId, status) =>
      request(`/jobs/${jobId}/applicants/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // ── AI ────────────────────────────────────────────────────
  ai: {
    parseResume:     () => request('/ai/parse-resume', { method: 'POST' }),
    rankCandidates:  (jobId) => request(`/ai/rank-candidates/${jobId}`, { method: 'POST' }),
    matchJobs:       () => request('/ai/match-jobs'),
    generateSummary: () => request('/ai/generate-summary', { method: 'POST' }),
    skillGap:        (jobId) => request(`/ai/skill-gap/${jobId}`),
  },
};
