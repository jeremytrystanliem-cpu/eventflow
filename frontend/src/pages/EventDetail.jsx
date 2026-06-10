import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventsAPI, tasksAPI, guestsAPI } from "../lib/api.js";
import Layout from "../components/Layout.jsx";

const STATUS_CONFIG = {
  active:  { label: "Active",  bg: "rgba(78,207,179,0.12)",  color: "#4ECFB3" },
  urgent:  { label: "Urgent",  bg: "rgba(255,107,87,0.12)",  color: "#FF6B57" },
  planned: { label: "Planned", bg: "rgba(255,255,255,0.06)", color: "#7A7870" },
  done:    { label: "Done",    bg: "rgba(200,255,87,0.10)",  color: "#C8FF57" },
};

const PRIORITY_CONFIG = {
  urgent: { color: "#FF6B57", label: "Urgent" },
  high:   { color: "#F59E0B", label: "High" },
  medium: { color: "#4ECFB3", label: "Medium" },
  low:    { color: "#7A7870", label: "Low" },
};

const RSVP_CONFIG = {
  pending:   { label: "Pending",   bg: "rgba(255,255,255,0.06)", color: "#7A7870" },
  confirmed: { label: "Confirmed", bg: "rgba(78,207,179,0.12)",  color: "#4ECFB3" },
  declined:  { label: "Declined",  bg: "rgba(255,107,87,0.12)",  color: "#FF6B57" },
};

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const CSS = `
  :root{--bg:#09090C;--surface:#111116;--card:#16161C;--border:rgba(255,255,255,0.07);--border-h:rgba(255,255,255,0.13);--text:#F0EEE9;--muted:#7A7870;--muted2:#4A4A42;--accent:#C8FF57;--accent-dim:rgba(200,255,87,0.10);--accent-b:rgba(200,255,87,0.22);--teal:#4ECFB3;--red:#FF6B57;--amber:#F59E0B;}
  .ed-page{padding:28px;max-width:1100px;}
  .ed-hero{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px;margin-bottom:20px;position:relative;overflow:hidden;}
  .ed-hero::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--accent);}
  .ed-hero-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;}
  .ed-hero-desc{font-size:0.85rem;color:var(--muted);line-height:1.6;}
  .ed-status-pill{font-size:0.72rem;font-weight:600;padding:5px 14px;border-radius:100px;display:inline-flex;align-items:center;gap:6px;margin-bottom:16px;}
  .ed-meta-row{display:flex;gap:24px;flex-wrap:wrap;}
  .ed-meta-item{display:flex;flex-direction:column;gap:2px;}
  .ed-meta-label{font-size:0.65rem;font-weight:600;color:var(--muted2);text-transform:uppercase;letter-spacing:0.08em;}
  .ed-meta-value{font-size:0.85rem;font-weight:500;color:var(--text);}
  .ed-progress-wrap{margin-top:20px;padding-top:20px;border-top:1px solid var(--border);}
  .ed-progress-header{display:flex;justify-content:space-between;font-size:0.75rem;color:var(--muted);margin-bottom:8px;}
  .ed-progress-track{height:6px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden;}
  .ed-progress-fill{height:100%;border-radius:3px;background:var(--accent);transition:width 0.6s cubic-bezier(.25,.46,.45,.94);}
  .ed-two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .ed-panel{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;}
  .ed-panel-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);}
  .ed-panel-title{font-family:'Instrument Serif',serif;font-size:1rem;font-weight:400;color:var(--text);display:flex;align-items:center;gap:8px;}
  .ed-count-badge{font-size:0.65rem;font-weight:600;background:var(--accent-dim);color:var(--accent);border:1px solid var(--accent-b);padding:2px 8px;border-radius:100px;}
  .ed-panel-body{padding:0 20px;}
  .ed-task-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);}
  .ed-task-item:last-child{border-bottom:none;}
  .ed-task-check{width:18px;height:18px;border-radius:5px;flex-shrink:0;border:1.5px solid var(--border-h);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;background:transparent;}
  .ed-task-check.done{background:var(--accent);border-color:var(--accent);}
  .ed-task-body{flex:1;min-width:0;}
  .ed-task-title{font-size:0.82rem;font-weight:500;color:var(--text);margin-bottom:2px;}
  .ed-task-title.done{text-decoration:line-through;color:var(--muted);}
  .ed-task-meta{display:flex;align-items:center;gap:8px;}
  .ed-task-priority{font-size:0.65rem;font-weight:600;padding:2px 8px;border-radius:100px;}
  .ed-task-due{font-size:0.68rem;color:var(--muted);}
  /* Delete confirm inline */
  .ed-del-wrap{display:flex;align-items:center;gap:4px;}
  .ed-del{width:26px;height:26px;border-radius:6px;border:1px solid transparent;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted2);transition:all 0.15s;flex-shrink:0;}
  .ed-del:hover{border-color:rgba(255,107,87,0.3);color:var(--red);background:rgba(255,107,87,0.08);}
  .ed-del-confirm{display:flex;align-items:center;gap:4px;font-size:0.7rem;color:var(--red);white-space:nowrap;}
  .ed-del-yes{padding:3px 8px;border-radius:5px;background:rgba(255,107,87,0.15);border:1px solid rgba(255,107,87,0.3);color:var(--red);font-size:0.7rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;}
  .ed-del-no{padding:3px 8px;border-radius:5px;background:transparent;border:1px solid var(--border);color:var(--muted);font-size:0.7rem;cursor:pointer;font-family:'DM Sans',sans-serif;}
  .ed-guest-item{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);}
  .ed-guest-item:last-child{border-bottom:none;}
  .ed-guest-avatar{width:30px;height:30px;border-radius:8px;background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:600;color:var(--muted);flex-shrink:0;}
  .ed-guest-name{font-size:0.82rem;font-weight:500;color:var(--text);}
  .ed-guest-email{font-size:0.68rem;color:var(--muted);}
  .ed-guest-body{flex:1;min-width:0;}
  .ed-rsvp-pill{font-size:0.65rem;font-weight:600;padding:3px 10px;border-radius:100px;cursor:pointer;transition:opacity 0.15s;border:none;font-family:'DM Sans',sans-serif;}
  .ed-rsvp-pill:hover{opacity:0.8;}
  .ed-empty{padding:32px 20px;text-align:center;color:var(--muted2);font-size:0.82rem;display:flex;flex-direction:column;align-items:center;gap:8px;}
  .ed-empty-icon{font-size:1.8rem;opacity:0.25;}
  .ef-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
  .ef-modal{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px;width:100%;max-width:440px;position:relative;}
  .ef-modal-title{font-family:'Instrument Serif',serif;font-size:1.3rem;font-weight:400;color:var(--text);margin-bottom:4px;}
  .ef-modal-sub{font-size:0.8rem;color:var(--muted);margin-bottom:20px;}
  .ef-modal-close{position:absolute;top:18px;right:18px;background:none;border:none;color:var(--muted);cursor:pointer;font-size:1.1rem;}
  .ef-modal-close:hover{color:var(--text);}
  .ef-form-group{display:flex;flex-direction:column;gap:5px;margin-bottom:12px;}
  .ef-form-label{font-size:0.73rem;font-weight:500;color:var(--muted);}
  .ef-form-input{width:100%;padding:9px 12px;background:var(--card);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.84rem;outline:none;transition:border-color 0.2s;}
  .ef-form-input:focus{border-color:var(--accent-b);}
  .ef-form-input::placeholder{color:var(--muted2);}
  .ef-form-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .ef-form-select{width:100%;padding:9px 12px;background:var(--card);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.84rem;outline:none;cursor:pointer;}
  .ef-modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;}
  .ef-btn-cancel{padding:8px 18px;border-radius:7px;font-size:0.8rem;font-weight:500;cursor:pointer;border:1px solid var(--border-h);background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;}
  .ef-btn-cancel:hover{color:var(--text);}
  .ef-btn-save{padding:8px 18px;border-radius:7px;font-size:0.8rem;font-weight:600;cursor:pointer;border:none;background:var(--accent);color:var(--bg);font-family:'DM Sans',sans-serif;}
  .ef-btn-save:hover{opacity:0.9;}
  .ef-btn-save:disabled{opacity:0.5;cursor:not-allowed;}
  .ef-error-banner{background:rgba(255,107,87,0.1);border:1px solid rgba(255,107,87,0.25);border-radius:8px;padding:9px 12px;font-size:0.78rem;color:#FF6B57;margin-bottom:12px;}
  .ef-btn-primary{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:8px;background:var(--accent);color:var(--bg);border:none;font-size:0.78rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity 0.15s;}
  .ef-btn-primary:hover{opacity:0.9;}
  .ef-btn-outline{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:8px;background:transparent;color:var(--muted);border:1px solid var(--border-h);font-size:0.78rem;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .ef-btn-outline:hover{color:var(--text);}
  .skeleton{background:linear-gradient(90deg,var(--card) 25%,rgba(255,255,255,0.04) 50%,var(--card) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @media(max-width:768px){.ed-page{padding:16px;}.ed-two-col{grid-template-columns:1fr;}.ed-hero-top{flex-direction:column;gap:12px;}.ed-meta-row{gap:16px;}}
`;

const Icon = ({ path, size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

function AddTaskModal({ eventId, onClose, onAdded }) {
  const [form, setForm] = useState({ title: "", priority: "medium", dueDate: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.title) { setError("Judul task wajib diisi."); return; }
    setLoading(true);
    try {
      const res = await tasksAPI.create({ ...form, eventId, dueDate: form.dueDate || null });
      onAdded(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Gagal membuat task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ef-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ef-modal">
        <button className="ef-modal-close" onClick={onClose}>✕</button>
        <div className="ef-modal-title">Tambah Task</div>
        <div className="ef-modal-sub">Tambahkan task baru ke event ini.</div>
        {error && <div className="ef-error-banner">⚠ {error}</div>}
        <div className="ef-form-group">
          <label className="ef-form-label">Judul Task *</label>
          <input className="ef-form-input" placeholder="Contoh: Konfirmasi venue"
            value={form.title}
            onChange={(e) => { setForm({ ...form, title: e.target.value }); setError(""); }} />
        </div>
        <div className="ef-form-row">
          <div className="ef-form-group">
            <label className="ef-form-label">Prioritas</label>
            <select className="ef-form-select" value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="ef-form-group">
            <label className="ef-form-label">Due Date</label>
            <input className="ef-form-input" type="date"
              value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
        </div>
        <div className="ef-modal-actions">
          <button className="ef-btn-cancel" onClick={onClose}>Batal</button>
          <button className="ef-btn-save" onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : "Tambah Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddGuestModal({ eventId, onClose, onAdded }) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name) { setError("Nama guest wajib diisi."); return; }
    setLoading(true);
    try {
      const res = await guestsAPI.add({ ...form, eventId });
      onAdded(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Gagal menambah guest.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ef-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ef-modal">
        <button className="ef-modal-close" onClick={onClose}>✕</button>
        <div className="ef-modal-title">Tambah Guest</div>
        <div className="ef-modal-sub">Tambahkan peserta ke event ini.</div>
        {error && <div className="ef-error-banner">⚠ {error}</div>}
        <div className="ef-form-group">
          <label className="ef-form-label">Nama *</label>
          <input className="ef-form-input" placeholder="Nama lengkap"
            value={form.name}
            onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(""); }} />
        </div>
        <div className="ef-form-group">
          <label className="ef-form-label">Email</label>
          <input className="ef-form-input" type="email" placeholder="email@contoh.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="ef-modal-actions">
          <button className="ef-btn-cancel" onClick={onClose}>Batal</button>
          <button className="ef-btn-save" onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : "Tambah Guest"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Task item dengan inline delete confirm
function TaskItem({ task, onToggle, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const due = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    : null;

  return (
    <div className="ed-task-item">
      <div className={"ed-task-check" + (task.done ? " done" : "")} onClick={() => onToggle(task.id)}>
        {task.done && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#09090C" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <div className="ed-task-body">
        <div className={"ed-task-title" + (task.done ? " done" : "")}>{task.title}</div>
        <div className="ed-task-meta">
          <span className="ed-task-priority" style={{ background: p.color + "20", color: p.color }}>{p.label}</span>
          {due && <span className="ed-task-due">{due}</span>}
        </div>
      </div>
      <div className="ed-del-wrap">
        {confirmDelete ? (
          <div className="ed-del-confirm">
            Hapus?
            <button className="ed-del-yes" onClick={() => onDelete(task.id)}>Ya</button>
            <button className="ed-del-no" onClick={() => setConfirmDelete(false)}>Tidak</button>
          </div>
        ) : (
          <button className="ed-del" onClick={() => setConfirmDelete(true)}>
            <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);

  useEffect(() => {
    Promise.all([eventsAPI.getOne(id), tasksAPI.getAll(id), guestsAPI.getAll(id)])
      .then(([evRes, taskRes, guestRes]) => {
        setEvent(evRes.data);
        setTasks(taskRes.data);
        setGuests(guestRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Progress dihitung dari tasks state — otomatis update saat task di-toggle
  const doneTasks = tasks.filter((t) => t.done).length;
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  const handleToggleTask = async (taskId) => {
    try {
      const res = await tasksAPI.toggle(taskId);
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, done: res.data.done } : t));
    } catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) { console.error(err); }
  };

  const handleUpdateRsvp = async (guestId, current) => {
    const order = ["pending", "confirmed", "declined"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    try {
      const res = await guestsAPI.updateRsvp(guestId, next);
      setGuests((prev) => prev.map((g) => g.id === guestId ? { ...g, rsvp: res.data.rsvp } : g));
    } catch (err) { console.error(err); }
  };

  const handleDeleteGuest = async (guestId) => {
    try {
      await guestsAPI.delete(guestId);
      setGuests((prev) => prev.filter((g) => g.id !== guestId));
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <Layout>
        <style>{CSS}</style>
        <div style={{ padding: 28 }}>
          <div className="skeleton" style={{ width: 120, height: 13, marginBottom: 24 }} />
          <div className="skeleton" style={{ width: "100%", height: 180, borderRadius: 16, marginBottom: 16 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
            <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <style>{CSS}</style>
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>😕</div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.2rem", marginBottom: 8 }}>Event tidak ditemukan</div>
          <button className="ef-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/events")}>
            Kembali ke Events
          </button>
        </div>
      </Layout>
    );
  }

  const s = STATUS_CONFIG[event.status] || STATUS_CONFIG.planned;
  const confirmedGuests = guests.filter((g) => g.rsvp === "confirmed").length;
  const budgetPct = event.budget > 0 ? Math.min(Math.round(((event.budgetUsed || 0) / event.budget) * 100), 100) : 0;
  const date = new Date(event.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const topbarActions = (
    <button className="ef-btn-outline" onClick={() => navigate("/events")}>
      <Icon path="M15 19l-7-7 7-7" size={14} />
      Kembali
    </button>
  );

  return (
    <Layout title={event.name} subtitle={date} actions={topbarActions}>
      <style>{CSS}</style>
      {showAddTask && <AddTaskModal eventId={id} onClose={() => setShowAddTask(false)} onAdded={(t) => setTasks((prev) => [...prev, t])} />}
      {showAddGuest && <AddGuestModal eventId={id} onClose={() => setShowAddGuest(false)} onAdded={(g) => setGuests((prev) => [...prev, g])} />}

      <div className="ed-page">
        <div className="ed-hero">
          <div className="ed-hero-top">
            <div>
              <div className="ed-status-pill" style={{ background: s.bg, color: s.color }}>{s.label}</div>
              <div className="ed-hero-desc">{event.description || "Tidak ada deskripsi."}</div>
            </div>
          </div>
          <div className="ed-meta-row">
            <div className="ed-meta-item"><div className="ed-meta-label">Tanggal</div><div className="ed-meta-value">📅 {date}</div></div>
            <div className="ed-meta-item"><div className="ed-meta-label">Budget</div><div className="ed-meta-value">{fmt(event.budget || 0)}</div></div>
            <div className="ed-meta-item">
              <div className="ed-meta-label">Terpakai</div>
              <div className="ed-meta-value" style={{ color: budgetPct > 80 ? "var(--red)" : "var(--text)" }}>{fmt(event.budgetUsed || 0)}</div>
            </div>
            <div className="ed-meta-item"><div className="ed-meta-label">Tasks</div><div className="ed-meta-value">{doneTasks}/{tasks.length} selesai</div></div>
            <div className="ed-meta-item"><div className="ed-meta-label">Guests</div><div className="ed-meta-value">{confirmedGuests}/{guests.length} confirmed</div></div>
          </div>
          <div className="ed-progress-wrap">
            <div className="ed-progress-header">
              <span>Progress Keseluruhan</span>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{progress}%</span>
            </div>
            <div className="ed-progress-track">
              <div className="ed-progress-fill" style={{ width: progress + "%" }} />
            </div>
          </div>
        </div>

        <div className="ed-two-col">
          <div className="ed-panel">
            <div className="ed-panel-header">
              <div className="ed-panel-title">Tasks <span className="ed-count-badge">{tasks.length}</span></div>
              <button className="ef-btn-primary" onClick={() => setShowAddTask(true)}>
                <Icon path="M12 4v16m8-8H4" size={12} color="#09090C" />Tambah
              </button>
            </div>
            <div className="ed-panel-body">
              {tasks.length === 0 ? (
                <div className="ed-empty"><div className="ed-empty-icon">📋</div><div>Belum ada task</div></div>
              ) : (
                tasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
                ))
              )}
            </div>
          </div>

          <div className="ed-panel">
            <div className="ed-panel-header">
              <div className="ed-panel-title">Guest List <span className="ed-count-badge">{guests.length}</span></div>
              <button className="ef-btn-primary" onClick={() => setShowAddGuest(true)}>
                <Icon path="M12 4v16m8-8H4" size={12} color="#09090C" />Tambah
              </button>
            </div>
            <div className="ed-panel-body">
              {guests.length === 0 ? (
                <div className="ed-empty"><div className="ed-empty-icon">👥</div><div>Belum ada guest</div></div>
              ) : (
                guests.map((guest) => {
                  const r = RSVP_CONFIG[guest.rsvp] || RSVP_CONFIG.pending;
                  const initials = guest.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <div key={guest.id} className="ed-guest-item">
                      <div className="ed-guest-avatar">{initials}</div>
                      <div className="ed-guest-body">
                        <div className="ed-guest-name">{guest.name}</div>
                        {guest.email && <div className="ed-guest-email">{guest.email}</div>}
                      </div>
                      <button className="ed-rsvp-pill" style={{ background: r.bg, color: r.color }}
                        onClick={() => handleUpdateRsvp(guest.id, guest.rsvp)} title="Klik untuk ubah RSVP">
                        {r.label}
                      </button>
                      <button className="ed-del" onClick={() => handleDeleteGuest(guest.id)}>
                        <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        <div style={{ height: 32 }} />
      </div>
    </Layout>
  );
}