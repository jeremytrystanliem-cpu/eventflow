import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Cek token expiry sebelum request
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch { return true; }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ef_token");
  if (token) {
    if (isTokenExpired(token)) {
      localStorage.removeItem("ef_token");
      localStorage.removeItem("ef_user");
      window.location.href = "/login";
      return Promise.reject(new Error("Token expired"));
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Hanya redirect ke /login jika 401 terjadi di luar halaman login/register
    // Kalau sudah di /login, biarkan error mengalir ke catch block di komponen
    const isAuthPage = window.location.pathname === "/login";
    if (error.response?.status === 401 && !isAuthPage) {
      localStorage.removeItem("ef_token");
      localStorage.removeItem("ef_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/password", data),
};

export const eventsAPI = {
  getAll: () => api.get("/events"),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post("/events", data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

export const tasksAPI = {
  getAll: (eventId) => api.get("/tasks", { params: eventId ? { eventId } : {} }),
  create: (data) => api.post("/tasks", data),
  toggle: (id) => api.patch(`/tasks/${id}/toggle`),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const guestsAPI = {
  getAll: (eventId) => api.get("/guests", { params: eventId ? { eventId } : {} }),
  add: (data) => api.post("/guests", data),
  updateRsvp: (id, rsvp) => api.patch(`/guests/${id}/rsvp`, { rsvp }),
  delete: (id) => api.delete(`/guests/${id}`),
};

export default api;