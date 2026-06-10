import { useState, useEffect, createContext, useContext } from "react";
import { authAPI } from "../lib/api.js";

const AuthContext = createContext(null);

// Helper cek apakah JWT token sudah expired
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ef_token");
    const stored = localStorage.getItem("ef_user");

    if (token && stored) {
      // Cek expiry token sebelum set user
      if (isTokenExpired(token)) {
        localStorage.removeItem("ef_token");
        localStorage.removeItem("ef_user");
      } else {
        setUser(JSON.parse(stored));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem("ef_token", token);
    localStorage.setItem("ef_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token, user } = res.data;
    localStorage.setItem("ef_token", token);
    localStorage.setItem("ef_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("ef_token");
    localStorage.removeItem("ef_user");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return ctx;
};