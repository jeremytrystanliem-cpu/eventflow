import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { eventsAPI, tasksAPI } from "../lib/api.js";
import Layout from "../components/Layout.jsx";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active:  { label: "Active",  bg: "rgba(78,207,179,0.12)",  color: "#4ECFB3", dot: "#4ECFB3" },
  urgent:  { label: "Urgent",  bg: "rgba(255,107,87,0.12)",  color: "#FF6B57", dot: "#FF6B57" },
  planned: { label: "Planned", bg: "rgba(255,255,255,0.06)", color: "#7A7870", dot: "#7A7870" },
  done:    { label: "Done",    bg: "rgba(200,255,87,0.10)",  color: "#C8FF57", dot: "#C8FF57" },
};

const PRIORITY_CONFIG = {
  urgent: { color: "#FF6B57" },
  high:   { color: "#F59E0B" },
  medium: { color: "#4ECFB3" },
  low:    { color: "#7A7870" },
};

const PROGRESS_COLOR = {
  active: "#C8FF57", urgent: "#FF6B57", planned: "rgba(255,255,255,0.2)", done: "#C8FF57",
};

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  :root{
    --bg:#09090C;--surface:#111116;--card:#16161C;
    --border:rgba(255,255,255,0.07);--border-h:rgba(255,255,255,0.13);
    --text:#F0EEE9;--muted:#7A7870;--muted2:#4A4A42;
    --accent:#C8FF57;--accent-dim:rgba(200,255,87,0.10);--accent-b:rgba(200,255,87,0.22);
    --teal:#4ECFB3;--red:#FF6B57;--amber:#F59E0B;
  }
  .ef-content{padding:24px 28px;overflow-y:auto;}
  .ef-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
  .ef-stat-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;transition:border-color 0.2s,transform 0.2s;position:relative;overflow:hidden;}
  .ef-stat-card:hover{border-color:var(--border-h);transform:translateY(-2px);}
  .ef-stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:var(--stat-accent,transparent);}
  .ef-stat-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
  .ef-stat-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;}
  .ef-stat-change{font-size:0.68rem;font-weight:600;padding:3px 8px;border-radius:100px;}
  .ef-stat-change.up{background:rgba(78,207,179,0.12);color:var(--teal);}
  .ef-stat-change.neutral{background:rgba(255,255,255,0.06);color:var(--muted);}
  .ef-stat-num{font-family:'Instrument Serif',serif;font-size:2rem;color:var(--text);line-height:1;margin-bottom:4px;}
  .ef-stat-label{font-size:0.75rem;color:var(--muted);font-weight:500;}
  .ef-two-col{display:grid;grid-template-columns:1fr 360px;gap:16px;}
  .ef-section-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
  .ef-section-hd-left{display:flex;align-items:center;gap:10px;}
  .ef-section-hd h3{font-family:'Instrument Serif',serif;font-size:1.05rem;font-weight:400;color:var(--text);}
  .ef-count-badge{font-size:0.68rem;font-weight:600;background:var(--accent-dim);color:var(--accent);border:1px solid var(--accent-b);padding:2px 9px;border-radius:100px;}
  .ef-see-all{font-size:0.75rem;font-weight:500;color:var(--muted);cursor:pointer;transition:color 0.15s;background:none;border:none;padding:0;font-family:'DM Sans',sans-serif;}
  .ef-see-all:hover{color:var(--text);}
  .ef-event-list{display:flex;flex-direction:column;gap:10px;}
  .ef-event-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px 20px;transition:border-color 0.2s,transform 0.2s;cursor:pointer;}
  .ef-event-card:hover{border-color:var(--border-h);transform:translateX(3px);}
  .ef-event-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;}
  .ef-event-name{font-size:0.92rem;font-weight:600;color:var(--text);margin-bottom:4px;}
  .ef-event-meta{display:flex;align-items:center;gap:10px;}
  .ef-event-date{font-size:0.72rem;color:var(--muted);}
  .ef-status-pill{font-size:0.68rem;font-weight:600;padding:4px 12px;border-radius:100px;flex-shrink:0;display:flex;align-items:center;gap:5px;}
  .ef-status-dot{width:5px;height:5px;border-radius:50%;}
  .ef-event-card-bottom{display:grid;grid-template-columns:1fr auto auto;gap:16px;align-items:center;}
  .ef-progress-label{display:flex;justify-content:space-between;font-size:0.68rem;color:var(--muted);margin-bottom:6px;}
  .ef-progress-track{height:4px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;}
  .ef-progress-fill{height:100%;border-radius:2px;transition:width 0.8s cubic-bezier(.25,.46,.45,.94);}
  .ef-event-info{display:flex;flex-direction:column;align-items:flex-end;gap:2px;}
  .ef-event-info-num{font-size:0.8rem;font-weight:600;color:var(--text);}
  .ef-event-info-label{font-size:0.62rem;color:var(--muted);}
  .ef-right-col{display:flex;flex-direction:column;gap:16px;}
  .ef-task-panel{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px 20px;}
  .ef-task-item{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);}
  .ef-task-item:last-child{border-bottom:none;padding-bottom:0;}
  .ef-task-check{width:18px;height:18px;border-radius:5px;flex-shrink:0;margin-top:1px;border:1.5px solid var(--border-h);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;background:transparent;}
  .ef-task-check.done{background:var(--accent);border-color:var(--accent);}
  .ef-task-body{flex:1;min-width:0;}
  .ef-task-title{font-size:0.8rem;font-weight:500;color:var(--text);margin-bottom:3px;line-height:1.4;}
  .ef-task-title.done{text-decoration:line-through;color:var(--muted);}
  .ef-task-meta{display:flex;align-items:center;gap:8px;}
  .ef-task-event{font-size:0.68rem;color:var(--muted);}
  .ef-task-due{font-size:0.68rem;font-weight:500;}
  .ef-priority-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:5px;}
  .ef-mini-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .ef-mini-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;}
  .ef-mini-num{font-family:'Instrument Serif',serif;font-size:1.5rem;color:var(--text);line-height:1;margin-bottom:3px;}
  .ef-mini-label{font-size:0.7rem;color:var(--muted);}
  .skeleton{background:linear-gradient(90deg,var(--card) 25%,rgba(255,255,255,0.04) 50%,var(--card) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .ef-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 20px;text-align:center;gap:12px;}
  .ef-empty-icon{font-size:2.5rem;opacity:0.3;}
  .ef-empty-title{font-size:0.9rem;font-weight:600;color:var(--muted);}
  .ef-empty-sub{font-size:0.8rem;color:var(--muted2);}
  .ef-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
  .ef-modal{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;width:100%;max-width:480px;position:relative;}
  .ef-modal-title{font-family:'Instrument Serif',serif;font-size:1.4rem;font-weight:400;color:var(--text);margin-bottom:4px;}
  .ef-modal-sub{font-size:0.82rem;color:var(--muted);margin-bottom:24px;}
  .ef-modal-close{position:absolute;top:20px;right:20px;background:none;border:none;color:var(--muted);cursor:pointer;font-size:1.2rem;line-height:1;}
  .ef-modal-close:hover{color:var(--text);}
  .ef-form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
  .ef-form-label{font-size:0.75rem;font-weight:500;color:var(--muted);}
  .ef-form-input{width:100%;padding:10px 13px;background:var(--card);border:1px solid var(--border);border-radius:9px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.86rem;outline:none;transition:border-color 0.2s;}
  .ef-form-input:focus{border-color:var(--accent-b);}
  .ef-form-input::placeholder{color:var(--muted2);}
  .ef-form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .ef-form-select{width:100%;padding:10px 13px;background:var(--card);border:1px solid var(--border);border-radius:9px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.86rem;outline:none;cursor:pointer;}
  .ef-modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:20px;}
  .ef-btn-cancel{padding:9px 20px;border-radius:8px;font-size:0.82rem;font-weight:500;cursor:pointer;border:1px solid var(--border-h);background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .ef-btn-cancel:hover{color:var(--text);}
  .ef-btn-save{padding:9px 20px;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;border:none;background:var(--accent);color:var(--bg);font-family:'DM Sans',sans-serif;transition:opacity 0.15s;}
  .ef-btn-save:hover{opacity:0.9;}
  .ef-btn-save:disabled{opacity:0.5;cursor:not-allowed;}
  .ef-error-banner{background:rgba(255,107,87,0.1);border:1px solid rgba(255,107,87,0.25);border-radius:8px;padding:10px 14px;font-size:0.8rem;color:#FF6B57;margin-bottom:14px;}
  .ef-topbar-btn{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:8px;font-size:0.8rem;font-weight:500;cursor:pointer;border:1px solid var(--border-h);background:transparent;color:var(--muted);transition:all 0.15s;font-family:'DM Sans',sans-serif;}
  .ef-topbar-btn:hover{background:rgba(255,255,255,0.04);color:var(--text);}
  .ef-topbar-btn.primary{background:var(--accent);color:var(--bg);border-color:transparent;font-weight:600;}
  .ef-topbar-btn.primary:hover{opacity:0.9;}
  @media(max-width:1024px){.ef-stats-grid{grid-template-columns:repeat(2,1fr);}.ef-two-col{grid-template-columns:1fr;}}
  @media(max-width:768px){.ef-content{padding:16px;}.ef-stats-grid{grid-template-columns:repeat(2,1fr);}}
`;

// ─── Icon ─────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
      <div>
        <div className="skeleton" style={{ width: 160, height: 14, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 100, height: 11 }} />
      </div>
      <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 100 }} />
    </div>
    <div className="skeleton" style={{ width: "100%", height: 4, borderRadius: 2 }} />
  </div>
);

// ─── Create Event Modal ───────────────────────────────────────────────────────
function CreateEventModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "", date: "", status: "planned", budget: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.date) { setError("Nama dan tanggal wajib diisi."); return; }
    setLoading(true);
    try {
      const res = await eventsAPI.create({ ...form, budget: parseFloat(form.budget) || 0 });
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Gagal membuat event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ef-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ef-modal">
        <button className="ef-modal-close" onClick={onClose}>✕</button>
        <div className="ef-modal-title">Buat Event Baru</div>
        <div className="ef-modal-sub">Isi detail event yang ingin kamu kelola.</div>
        {error && <div className="ef-error-banner">⚠ {error}</div>}
        <div className="ef-form-group">
          <label className="ef-form-label">Nama Event *</label>
          <input className="ef-form-input" placeholder="Contoh: Tech Summit 2025"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="ef-form-group">
          <label className="ef-form-label">Deskripsi</label>
          <input className="ef-form-input" placeholder="Deskripsi singkat"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="ef-form-row">
          <div className="ef-form-group">
            <label className="ef-form-label">Tanggal *</label>
            <input className="ef-form-input" type="date"
              value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="ef-form-group">
            <label className="ef-form-label">Status</label>
            <select className="ef-form-select" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div className="ef-form-group">
          <label className="ef-form-label">Budget (Rp)</label>
          <input className="ef-form-input" type="number" placeholder="5000000"
            value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
        </div>
        <div className="ef-modal-actions">
          <button className="ef-btn-cancel" onClick={onClose}>Batal</button>
          <button className="ef-btn-save" onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : "Buat Event →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, onClick }) {
  const s = STATUS_CONFIG[event.status] || STATUS_CONFIG.planned;
  const progress = event.progress || 0;
  const date = new Date(event.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="ef-event-card" onClick={onClick}>
      <div className="ef-event-card-top">
        <div>
          <div className="ef-event-name">{event.name}</div>
          <div className="ef-event-meta">
            <span className="ef-event-date">📅 {date}</span>
          </div>
        </div>
        <div className="ef-status-pill" style={{ background: s.bg, color: s.color }}>
          <div className="ef-status-dot" style={{ background: s.dot }} />
          {s.label}
        </div>
      </div>
      <div className="ef-event-card-bottom">
        <div>
          <div className="ef-progress-label">
            <span>Progress</span>
            <span style={{ color: PROGRESS_COLOR[event.status] || "#C8FF57" }}>{progress}%</span>
          </div>
          <div className="ef-progress-track">
            <div className="ef-progress-fill"
              style={{ width: `${progress}%`, background: PROGRESS_COLOR[event.status] || "#C8FF57" }} />
          </div>
        </div>
        <div className="ef-event-info">
          <div className="ef-event-info-num">{event.taskDone || 0}/{event.taskCount || 0}</div>
          <div className="ef-event-info-label">Tasks</div>
        </div>
        <div className="ef-event-info">
          <div className="ef-event-info-num">{event.guestCount || 0}</div>
          <div className="ef-event-info-label">Guests</div>
        </div>
      </div>
    </div>
  );
}

// ─── Task Item ────────────────────────────────────────────────────────────────
function TaskItem({ task, onToggle }) {
  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const due = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    : null;

  return (
    <div className="ef-task-item">
      <div className={`ef-task-check ${task.done ? "done" : ""}`} onClick={() => onToggle(task.id)}>
        {task.done && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#09090C" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <div className="ef-priority-dot" style={{ background: p.color, opacity: task.done ? 0.3 : 1 }} />
      <div className="ef-task-body">
        <div className={`ef-task-title ${task.done ? "done" : ""}`}>{task.title}</div>
        <div className="ef-task-meta">
          <span className="ef-task-event">{task.event?.name}</span>
          {due && (
            <span className="ef-task-due"
              style={{ color: task.priority === "urgent" && !task.done ? "#FF6B57" : "#7A7870" }}>
              {due}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskFilter, setTaskFilter] = useState("all");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    eventsAPI.getAll()
      .then((res) => setEvents(res.data))
      .catch(() => setApiError("Gagal memuat events. Pastikan backend berjalan."))
      .finally(() => setLoadingEvents(false));
  }, []);

  useEffect(() => {
    tasksAPI.getAll()
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingTasks(false));
  }, []);

  const handleToggleTask = async (id) => {
    try {
      const res = await tasksAPI.toggle(id);
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: res.data.done } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventCreated = (newEvent) => {
    setEvents((prev) => [{ ...newEvent, taskCount: 0, taskDone: 0, guestCount: 0, progress: 0 }, ...prev]);
  };

  const totalBudgetUsed = events.reduce((a, e) => a + (e.budgetUsed || 0), 0);
  const doneTasks = tasks.filter((t) => t.done).length;
  const pendingTasks = tasks.filter((t) => !t.done).length;
  const urgentTasks = tasks.filter((t) => t.priority === "urgent" && !t.done).length;
  const activeEvents = events.filter((e) => e.status === "active").length;
  const filteredTasks = tasks.filter((t) =>
    taskFilter === "pending" ? !t.done : taskFilter === "done" ? t.done : true
  );

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const topbarActions = (
    <>
      {urgentTasks > 0 && (
        <button className="ef-topbar-btn">
          <Icon path="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" size={15} />
          <span style={{ background: "#FF6B57", color: "#fff", borderRadius: "100px", fontSize: "0.6rem", padding: "1px 6px", fontWeight: 600 }}>
            {urgentTasks}
          </span>
        </button>
      )}
      <button className="ef-topbar-btn primary" onClick={() => setShowCreateModal(true)}>
        <Icon path="M12 4v16m8-8H4" size={15} color="#09090C" />
        Event Baru
      </button>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      {showCreateModal && (
        <CreateEventModal onClose={() => setShowCreateModal(false)} onCreated={handleEventCreated} />
      )}
      <Layout title="Dashboard" subtitle={today} actions={topbarActions}>
        <div className="ef-content">
          {apiError && <div className="ef-error-banner" style={{ marginBottom: 20 }}>⚠ {apiError}</div>}

          {/* STATS */}
          <div className="ef-stats-grid">
            {[
              { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "#C8FF57", bg: "rgba(200,255,87,0.1)", accent: "#C8FF57", num: loadingEvents ? "—" : events.length, label: "Total Events", change: `${activeEvents} aktif`, type: "up" },
              { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", color: "#4ECFB3", bg: "rgba(78,207,179,0.1)", accent: "#4ECFB3", num: loadingTasks ? "—" : `${doneTasks}/${tasks.length}`, label: "Tasks Selesai", change: tasks.length > 0 ? `${Math.round((doneTasks/tasks.length)*100)}%` : "0%", type: "up" },
              { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", accent: "#F59E0B", num: loadingEvents ? "—" : fmt(totalBudgetUsed), label: "Budget Terpakai", change: "total terpakai", type: "neutral" },
              { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "#FF6B57", bg: "rgba(255,107,87,0.1)", accent: "#FF6B57", num: loadingTasks ? "—" : pendingTasks, label: "Tasks Pending", change: urgentTasks > 0 ? `${urgentTasks} urgent` : "semua aman", type: urgentTasks > 0 ? "up" : "neutral" },
            ].map((s, i) => (
              <div key={i} className="ef-stat-card" style={{ "--stat-accent": s.accent }}>
                <div className="ef-stat-top">
                  <div className="ef-stat-icon" style={{ background: s.bg }}>
                    <Icon path={s.icon} size={18} color={s.color} />
                  </div>
                  <div className={`ef-stat-change ${s.type}`}>{s.change}</div>
                </div>
                <div className="ef-stat-num">{s.num}</div>
                <div className="ef-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* EVENTS + TASKS */}
          <div className="ef-two-col">
            <div>
              <div className="ef-section-hd">
                <div className="ef-section-hd-left">
                  <h3>Events Kamu</h3>
                  <div className="ef-count-badge">{events.length} events</div>
                </div>
                <button className="ef-see-all" onClick={() => navigate("/events")}>Lihat semua →</button>
              </div>
              <div className="ef-event-list">
                {loadingEvents ? (
                  [1,2,3].map((i) => <SkeletonCard key={i} />)
                ) : events.length === 0 ? (
                  <div className="ef-empty">
                    <div className="ef-empty-icon">📅</div>
                    <div className="ef-empty-title">Belum ada event</div>
                    <div className="ef-empty-sub">Klik "Event Baru" untuk mulai.</div>
                    <button className="ef-btn-save" style={{ marginTop: 4, padding: "9px 20px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", border: "none", background: "var(--accent)", color: "var(--bg)", fontFamily: "'DM Sans',sans-serif" }}
                      onClick={() => setShowCreateModal(true)}>
                      Buat Event Pertama →
                    </button>
                  </div>
                ) : (
                  events.slice(0, 4).map((e) => (
                    <EventCard key={e.id} event={e} onClick={() => navigate(`/events/${e.id}`)} />
                  ))
                )}
              </div>
            </div>

            <div className="ef-right-col">
              <div className="ef-mini-stats">
                <div className="ef-mini-card">
                  <div className="ef-mini-num" style={{ color: "#FF6B57" }}>{urgentTasks}</div>
                  <div className="ef-mini-label">Task Urgent</div>
                </div>
                <div className="ef-mini-card">
                  <div className="ef-mini-num" style={{ color: "#C8FF57" }}>{activeEvents}</div>
                  <div className="ef-mini-label">Event Aktif</div>
                </div>
              </div>

              <div className="ef-task-panel">
                <div className="ef-section-hd" style={{ marginBottom: 12 }}>
                  <div className="ef-section-hd-left">
                    <h3>Tasks</h3>
                    <div className="ef-count-badge">{pendingTasks} pending</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  {["all", "pending", "done"].map((f) => (
                    <button key={f} onClick={() => setTaskFilter(f)} style={{
                      padding: "4px 12px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 500,
                      cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
                      border: `1px solid ${taskFilter === f ? "var(--accent-b)" : "var(--border)"}`,
                      background: taskFilter === f ? "var(--accent-dim)" : "transparent",
                      color: taskFilter === f ? "var(--accent)" : "var(--muted)",
                    }}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
                {loadingTasks ? (
                  <div style={{ color: "var(--muted)", fontSize: "0.82rem", padding: "20px 0", textAlign: "center" }}>Memuat tasks...</div>
                ) : filteredTasks.length === 0 ? (
                  <div className="ef-empty" style={{ padding: "24px 0" }}>
                    <div className="ef-empty-icon">✅</div>
                    <div className="ef-empty-title">{taskFilter === "done" ? "Belum ada task selesai" : "Tidak ada task pending"}</div>
                  </div>
                ) : (
                  filteredTasks.map((t) => <TaskItem key={t.id} task={t} onToggle={handleToggleTask} />)
                )}
              </div>
            </div>
          </div>
          <div style={{ height: 32 }} />
        </div>
      </Layout>
    </>
  );
}