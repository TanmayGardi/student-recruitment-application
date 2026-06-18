import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchMe(tkn) {
    try {
      const res = await fetch('http://localhost:8000/auth/me', {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setToken(tkn);
        return data;         // ← return user so callers can act on role immediately
      } else {
        logout();
        return null;
      }
    } catch {
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  }

  function saveToken(tkn, refreshTkn) {
    localStorage.setItem('access_token', tkn);
    if (refreshTkn) localStorage.setItem('refresh_token', refreshTkn);
    setToken(tkn);
  }

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
  }

  async function login(email, password) {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    saveToken(data.access_token, data.refresh_token);
    const userData = await fetchMe(data.access_token);  // ← now returns user
    return userData;   // ← callers get the user object with .role
  }

  async function signup(payload) {
    const res = await fetch('http://localhost:8000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Signup failed');
    return data;
  }

  async function googleLogin(credential, role = 'student') {
    const res = await fetch('http://localhost:8000/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Google sign-in failed');
    saveToken(data.access_token, data.refresh_token);
    const userData = await fetchMe(data.access_token);
    return userData;
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, googleLogin, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
