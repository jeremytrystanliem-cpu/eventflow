import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tasksAPI, eventsAPI } from "../lib/api.js";
import Layout from "../components/Layout.jsx";

const PRIORITY_CONFIG = {
  urgent: { color: "#FF6B57", bg: "rgba(255,107,87,0.12)", label: "Urgent" },
  high:   { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "High" },
  medium: { color: "#4ECFB3", bg: "rgba(78,207,179,0.12)", label: "Medium" },
  low:    { color: "#7A7870", bg: "rgba(255,255,255,0.06)", label: "Low" },
};

const CSS = `
  :root{
    --bg:#09090C;--surface:#111116;--card:#16161C;
    --border:rgba(255,255,255,0.07);--border-h:rgba(255,255,255,0.13);
    --text:#F0EEE9;--muted:#7A7870;--muted2:#4A4A42;
    --accent:#C8FF57;--accent-dim:rgba(200,255,87,0.10);--accent-b:rgba(200,255,87,0.22);
    --teal:#4ECFB3;--red:#FF6B57;--amber:#F59E0B;
  }
  .tk-page{padding:28px;max-width:1100px;}
  .tk-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap;}
  .tk-filter-btn{padding:6px 14px;border-radius:100px;font-size:0.78rem;font-weight:500;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .tk-filter-btn:hover{border-color:var(--border-h);color:var(--text);}
  .tk-filter-btn.active{background:var(--accent-dim);border-color:var(--accent-b);color:var(--accent);}
  .tk-search{flex:1;max-width:260px;padding:7px 14px;background:var(--card);border:1px solid var(--border);border-radius:9px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.82rem;outline:none;transition:border-color 0.2s;}
  .tk-search:focus{border-color:var(--accent-b);}
  .tk-search::placeholder{color:var(--muted2);}
  .tk-divider{flex:1;}

  /* GROUPED LIST */
  .tk-group{margin-bottom:24px;}
  .tk-group-label{font-size:0.68rem;font-weight:600;color:var(--muted2);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;padding:0 4px;display:flex;align-items:center;gap:8px;}
  .tk-group-label::after{content:'';flex:1;height:1px;background:var(--border);}

  /* TASK CARD */
  .tk-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 18px;margin-bottom:8px;display:flex;align-items:center;gap:14px;transition:border-color 0.15s,transform 0.15s;cursor:default;}
  .tk-card:hover{border-color:var(--border-h);transform:translateX(3px);}
  .tk-check{width:20px;height:20px;border-radius:6px;flex-shrink:0;border:1.5px solid var(--border-h);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;background:transparent;}
  .tk-check.done{background:var(--accent);border-color:var(--accent);}
  .tk-body{flex:1;min-width:0;}
  .tk-title{font-size:0.86rem;font-weight:500;color:var(--text);margin-bottom:4px;}
  .tk-title.done{text-decoration:line-through;color:var(--muted);}
  .tk-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
  .tk-priority{font-size:0.65rem;font-weight:600;padding:2px 9px;border-radius:100px;}
  .tk-event-link{font-size:0.72rem;color:var(--muted);cursor:pointer;transition:color 0.15s;background:none;border:none;font-family:'DM Sans',sans-serif;padding:0;display:flex;align-items:center;gap:4px;}
  .tk-event-link:hover{color:var(--accent);}
  .tk-due{font-size:0.72rem;font-weight:500;}
  .tk-del{width:28px;height:28px;border-radius:7px;border:1px solid transparent;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted2);transition:all 0.15s;flex-shrink:0;}
  .tk-del:hover{border-color:rgba(255,107,87,0.3);color:var(--red);background:rgba(255,107,87,0.08);}

  /* EMPTY */
  .tk-empty{padding:60px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;}
  .tk-empty-icon{font-size:2.5rem;opacity:0.25;}
  .tk-empty-title{font-size:0.9rem;font-weight:600;color:var(--muted);}
  .tk-empty-sub{font-size:0.8rem;color:var(--muted2);}

  /* STATS */
  .tk-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
  .tk-stat{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;}
  .tk-stat-num{font-family:'Instrument Serif',serif;font-size:1.5rem;color:var(--text);line-height:1;margin-bottom:3px;}
  .tk-stat-label{font-size:0.7rem;color:var(--muted);}

  /* MODAL */
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
  .ef-btn-cancel{padding:8px 18px;border-radius:7px;font-size:0.8rem;font-weight:500;cursor:pointer;border:1px solid var(--border-h);background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .ef-btn-cancel:hover{color:var(--text);}
  .ef-btn-save{padding:8px 18px;border-radius:7px;font-size:0.8rem;font-weight:600;cursor:pointer;border:none;background:var(--accent);color:var(--bg);font-family:'DM Sans',sans-serif;transition:opacity 0.15s;}
  .ef-btn-save:hover{opacity:0.9;}
  .ef-btn-save:disabled{opacity:0.5;cursor:not-allowed;}
  .ef-error-banner{background:rgba(255,107,87,0.1);border:1px solid rgba(255,107,87,0.25);border-radius:8px;padding:9px 12px;font-size:0.78rem;color:#FF6B57;margin-bottom:12px;}
  .ef-btn-primary{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:8px;background:var(--accent);color:var(--bg);border:none;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity 0.15s;}
  .ef-btn-primary:hover{opacity:0.9;}

  .skeleton{background:linear-gradient(90deg,var(--card) 25%,rgba(255,255,255,0.04) 50%,var(--card) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

  @media(max-width:768px){
    .tk-page{padding:16px;}
    .tk-stats{grid-template-columns:repeat(2,1fr);}
  }
`;

const Icon = ({ path, size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

// ─── Add Task Modal ───────────────────────────────────────────────────────────
function AddTaskModal({ events, onClose, onAdded }) {
  const [form, setForm] = useState({ title: "", priority: "medium", dueDate: "", eventId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.title) { setError("Judul task wajib diisi."); return; }
    if (!form.eventId) { setError("Pilih event untuk task ini."); return; }
    setLoading(true);
    try {
      const res = await tasksAPI.create({ ...form, dueDate: form.dueDate || null });
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
        <div className="ef-modal-title">Tambah Task Baru</div>
        <div className="ef-modal-sub">Task akan ditambahkan ke event yang dipilih.</div>
        {error && <div className="ef-error-banner">⚠ {error}</div>}
        <div className="ef-form-group">
          <label className="ef-form-label">Judul Task *</label>
          <input className="ef-form-input" placeholder="Contoh: Konfirmasi venue"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="ef-form-group">
          <label className="ef-form-label">Event *</label>
          <select className="ef-form-select" value={form.eventId}
            onChange={(e) => setForm({ ...form, eventId: e.target.value })}>
            <option value="">Pilih event...</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
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

// ─── Task Card with inline delete confirm ────────────────────────────────────
function TaskCard({ task, onToggle, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const p = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const due = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    : null;
  const isOverdue = task.dueDate && !task.done && new Date(task.dueDate) < new Date();

  return (
    <div className="tk-card">
      <div className={"tk-check" + (task.done ? " done" : "")} onClick={() => onToggle(task.id)}>
        {task.done && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#09090C" strokeWidth="3" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <div className="tk-body">
        <div className={"tk-title" + (task.done ? " done" : "")}>{task.title}</div>
        <div className="tk-meta">
          <span className="tk-priority" style={{ background: p.bg, color: p.color }}>{p.label}</span>
          {due && (
            <span className="tk-due" style={{ color: isOverdue ? "#FF6B57" : "var(--muted)" }}>
              {isOverdue ? "⚠ " : ""}{due}
            </span>
          )}
        </div>
      </div>
      {confirmDelete ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: "0.7rem", color: "var(--red)", whiteSpace: "nowrap" }}>Hapus?</span>
          <button
            onClick={() => onDelete(task.id)}
            style={{ padding: "3px 8px", borderRadius: 5, background: "rgba(255,107,87,0.15)", border: "1px solid rgba(255,107,87,0.3)", color: "var(--red)", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Ya
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            style={{ padding: "3px 8px", borderRadius: 5, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: "0.7rem", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Tidak
          </button>
        </div>
      ) : (
        <button className="tk-del" onClick={() => setConfirmDelete(true)}>
          <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Main Tasks Page ──────────────────────────────────────────────────────────
export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    Promise.all([tasksAPI.getAll(), eventsAPI.getAll()])
      .then(([taskRes, eventRes]) => {
        setTasks(taskRes.data);
        setEvents(eventRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await tasksAPI.toggle(id);
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: res.data.done } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await tasksAPI.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdded = (newTask) => {
    const eventData = events.find((e) => e.id === newTask.eventId);
    setTasks((prev) => [{ ...newTask, event: eventData ? { name: eventData.name } : null }, ...prev]);
  };

  // Filter & search
  const filtered = tasks.filter((t) => {
    const matchStatus = filter === "all" ? true : filter === "done" ? t.done : !t.done;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  // Group by event
  const grouped = filtered.reduce((acc, task) => {
    const key = task.event?.name || "Tanpa Event";
    if (!acc[key]) acc[key] = { eventId: task.eventId, tasks: [] };
    acc[key].tasks.push(task);
    return acc;
  }, {});

  // Stats
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pending = tasks.filter((t) => !t.done).length;
  const urgent = tasks.filter((t) => t.priority === "urgent" && !t.done).length;

  const topbarActions = (
    <button className="ef-btn-primary" onClick={() => setShowAdd(true)}>
      <Icon path="M12 4v16m8-8H4" size={14} color="#09090C" />
      Task Baru
    </button>
  );

  return (
    <Layout title="Tasks" subtitle={total + " task total"} actions={topbarActions}>
      <style>{CSS}</style>

      {showAdd && (
        <AddTaskModal events={events} onClose={() => setShowAdd(false)} onAdded={handleAdded} />
      )}

      <div className="tk-page">

        {/* STATS */}
        <div className="tk-stats">
          {[
            { num: total,   label: "Total Tasks",   color: "var(--text)" },
            { num: done,    label: "Selesai",        color: "#C8FF57" },
            { num: pending, label: "Pending",        color: "#4ECFB3" },
            { num: urgent,  label: "Urgent",         color: "#FF6B57" },
          ].map((s, i) => (
            <div key={i} className="tk-stat">
              <div className="tk-stat-num" style={{ color: s.color }}>{s.num}</div>
              <div className="tk-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* TOOLBAR */}
        <div className="tk-toolbar">
          {/* Status filter */}
          {["all", "pending", "done"].map((f) => (
            <button key={f} className={"tk-filter-btn" + (filter === f ? " active" : "")}
              onClick={() => setFilter(f)}>
              {f === "all" ? "Semua" : f === "done" ? "Selesai" : "Pending"}
            </button>
          ))}

          <div style={{ width: 1, height: 20, background: "var(--border)" }} />

          {/* Priority filter */}
          {["all", "urgent", "high", "medium", "low"].map((p) => (
            <button key={p} className={"tk-filter-btn" + (priorityFilter === p ? " active" : "")}
              onClick={() => setPriorityFilter(p)}
              style={priorityFilter === p && p !== "all" ? {
                background: PRIORITY_CONFIG[p]?.bg,
                borderColor: PRIORITY_CONFIG[p]?.color + "50",
                color: PRIORITY_CONFIG[p]?.color,
              } : {}}>
              {p === "all" ? "Semua Prioritas" : PRIORITY_CONFIG[p]?.label}
            </button>
          ))}

          <div className="tk-divider" />

          <input className="tk-search" placeholder="Cari task..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* TASK LIST */}
        {loading ? (
          [1,2,3,4,5].map((i) => (
            <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px", marginBottom: 8, display: "flex", alignItems: "center", gap: 14 }}>
              <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: "60%", height: 13, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: "30%", height: 11 }} />
              </div>
            </div>
          ))
        ) : Object.keys(grouped).length === 0 ? (
          <div className="tk-empty">
            <div className="tk-empty-icon">✅</div>
            <div className="tk-empty-title">
              {search ? "Tidak ada task yang cocok" : filter === "done" ? "Belum ada task selesai" : "Tidak ada task pending"}
            </div>
            <div className="tk-empty-sub">
              {!search && filter === "all" && "Klik 'Task Baru' untuk mulai."}
            </div>
            {!search && filter === "all" && (
              <button className="ef-btn-primary" style={{ marginTop: 4 }} onClick={() => setShowAdd(true)}>
                Tambah Task Pertama →
              </button>
            )}
          </div>
        ) : (
          Object.entries(grouped).map(([eventName, group]) => (
            <div key={eventName} className="tk-group">
              <div className="tk-group-label">
                <button className="tk-event-link" onClick={() => group.eventId && navigate("/events/" + group.eventId)}>
                  📅 {eventName}
                </button>
                <span style={{ fontSize: "0.65rem", color: "var(--muted2)" }}>
                  {group.tasks.filter((t) => t.done).length}/{group.tasks.length}
                </span>
              </div>
              {group.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ))
        )}
        <div style={{ height: 32 }} />
      </div>
    </Layout>
  );
}