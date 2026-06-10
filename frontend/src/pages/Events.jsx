import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventsAPI } from "../lib/api.js";
import Layout from "../components/Layout.jsx";

const STATUS_CONFIG = {
  active:  { label: "Active",  bg: "rgba(78,207,179,0.12)",  color: "#4ECFB3", dot: "#4ECFB3" },
  urgent:  { label: "Urgent",  bg: "rgba(255,107,87,0.12)",  color: "#FF6B57", dot: "#FF6B57" },
  planned: { label: "Planned", bg: "rgba(255,255,255,0.06)", color: "#7A7870", dot: "#7A7870" },
  done:    { label: "Done",    bg: "rgba(200,255,87,0.10)",  color: "#C8FF57", dot: "#C8FF57" },
};

const PROGRESS_COLOR = {
  active: "#C8FF57", urgent: "#FF6B57", planned: "rgba(255,255,255,0.2)", done: "#C8FF57",
};

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const CSS = `
  :root{
    --bg:#09090C;--surface:#111116;--card:#16161C;
    --border:rgba(255,255,255,0.07);--border-h:rgba(255,255,255,0.13);
    --text:#F0EEE9;--muted:#7A7870;--muted2:#4A4A42;
    --accent:#C8FF57;--accent-dim:rgba(200,255,87,0.10);--accent-b:rgba(200,255,87,0.22);
    --teal:#4ECFB3;--red:#FF6B57;--amber:#F59E0B;
  }
  .ev-page{padding:28px;max-width:1100px;}
  .ev-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
  .ev-title{font-family:'Instrument Serif',serif;font-size:1.6rem;font-weight:400;color:var(--text);}
  .ev-sub{font-size:0.78rem;color:var(--muted);margin-top:2px;}
  .ev-filters{display:flex;align-items:center;gap:8px;margin-bottom:20px;flex-wrap:wrap;}
  .ev-filter-btn{padding:6px 16px;border-radius:100px;font-size:0.78rem;font-weight:500;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .ev-filter-btn:hover{border-color:var(--border-h);color:var(--text);}
  .ev-filter-btn.active{background:var(--accent-dim);border-color:var(--accent-b);color:var(--accent);}
  .ev-search{flex:1;max-width:280px;padding:7px 14px;background:var(--card);border:1px solid var(--border);border-radius:9px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.82rem;outline:none;transition:border-color 0.2s;}
  .ev-search:focus{border-color:var(--accent-b);}
  .ev-search::placeholder{color:var(--muted2);}
  .ev-table-wrap{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;}
  .ev-table-header{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr auto;gap:12px;padding:12px 20px;border-bottom:1px solid var(--border);font-size:0.68rem;font-weight:600;color:var(--muted2);letter-spacing:0.08em;text-transform:uppercase;}
  .ev-table-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr auto;gap:12px;padding:14px 20px;border-bottom:1px solid var(--border);align-items:center;transition:background 0.15s;cursor:pointer;}
  .ev-table-row:last-child{border-bottom:none;}
  .ev-table-row:hover{background:rgba(255,255,255,0.02);}
  .ev-table-name{font-size:0.88rem;font-weight:600;color:var(--text);margin-bottom:3px;}
  .ev-table-desc{font-size:0.72rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;}
  .ev-table-date{font-size:0.78rem;color:var(--muted);}
  .ev-table-budget{font-size:0.78rem;color:var(--text);font-weight:500;}
  .ev-table-budget-sub{font-size:0.68rem;color:var(--muted);}
  .ev-status-pill{font-size:0.68rem;font-weight:600;padding:4px 10px;border-radius:100px;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;}
  .ev-status-dot{width:5px;height:5px;border-radius:50%;}
  .ev-progress-bar{width:80px;height:4px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;}
  .ev-progress-fill{height:100%;border-radius:2px;}
  .ev-actions{display:flex;gap:6px;align-items:center;}
  .ev-action-btn{width:30px;height:30px;border-radius:7px;border:1px solid var(--border);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted);transition:all 0.15s;}
  .ev-action-btn:hover{border-color:var(--border-h);color:var(--text);background:rgba(255,255,255,0.04);}
  .ev-action-btn.danger:hover{border-color:rgba(255,107,87,0.4);color:var(--red);background:rgba(255,107,87,0.08);}
  .ev-action-btn.view:hover{border-color:var(--accent-b);color:var(--accent);background:var(--accent-dim);}
  .ev-empty{padding:64px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;}
  .ev-empty-icon{font-size:3rem;opacity:0.25;}
  .ev-empty-title{font-size:1rem;font-weight:600;color:var(--muted);}
  .ev-empty-sub{font-size:0.82rem;color:var(--muted2);}
  .skeleton{background:linear-gradient(90deg,var(--card) 25%,rgba(255,255,255,0.04) 50%,var(--card) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px;}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
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
  .ef-btn-danger{padding:9px 20px;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;background:rgba(255,107,87,0.15);color:var(--red);font-family:'DM Sans',sans-serif;border:1px solid rgba(255,107,87,0.3);transition:all 0.15s;}
  .ef-btn-danger:hover{background:rgba(255,107,87,0.25);}
  .ef-error-banner{background:rgba(255,107,87,0.1);border:1px solid rgba(255,107,87,0.25);border-radius:8px;padding:10px 14px;font-size:0.8rem;color:#FF6B57;margin-bottom:14px;}
  .ef-btn-primary{display:inline-flex;align-items:center;gap:7px;padding:9px 20px;border-radius:9px;background:var(--accent);color:var(--bg);border:none;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity 0.15s;}
  .ef-btn-primary:hover{opacity:0.9;}
  @media(max-width:768px){
    .ev-page{padding:16px;}
    .ev-table-header,.ev-table-row{grid-template-columns:1fr auto;}
    .ev-table-header .col-date,.ev-table-header .col-budget,.ev-table-header .col-progress,
    .ev-table-row .col-date,.ev-table-row .col-budget,.ev-table-row .col-progress{display:none;}
  }
`;

const Icon = ({ path, size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

function EventFormModal({ event, onClose, onSaved }) {
  const isEdit = !!event;
  const [form, setForm] = useState({
    name: event?.name || "",
    description: event?.description || "",
    date: event?.date ? event.date.slice(0, 10) : "",
    status: event?.status || "planned",
    budget: event?.budget || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.date) { setError("Nama dan tanggal wajib diisi."); return; }
    setLoading(true);
    try {
      const payload = { ...form, budget: parseFloat(form.budget) || 0 };
      const res = isEdit ? await eventsAPI.update(event.id, payload) : await eventsAPI.create(payload);
      onSaved(res.data, isEdit);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Gagal menyimpan event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ef-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ef-modal">
        <button className="ef-modal-close" onClick={onClose}>✕</button>
        <div className="ef-modal-title">{isEdit ? "Edit Event" : "Buat Event Baru"}</div>
        <div className="ef-modal-sub">{isEdit ? "Update detail event ini." : "Isi detail event yang ingin kamu kelola."}</div>
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
              <option value="done">Done</option>
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
            {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Event →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ event, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await eventsAPI.delete(event.id);
      onDeleted(event.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ef-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ef-modal" style={{ maxWidth: 400 }}>
        <div className="ef-modal-title">Hapus Event?</div>
        <div className="ef-modal-sub" style={{ marginBottom: 8 }}>
          Kamu akan menghapus <strong style={{ color: "var(--text)" }}>{event.name}</strong>.
          Semua tasks dan guests terkait akan ikut terhapus. Aksi ini tidak bisa dibatalkan.
        </div>
        <div className="ef-modal-actions" style={{ marginTop: 24 }}>
          <button className="ef-btn-cancel" onClick={onClose}>Batal</button>
          <button className="ef-btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);

  useEffect(() => {
    eventsAPI.getAll()
      .then((res) => setEvents(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (savedEvent, isEdit) => {
    if (isEdit) {
      setEvents((prev) => prev.map((e) => e.id === savedEvent.id ? { ...e, ...savedEvent } : e));
    } else {
      setEvents((prev) => [{ ...savedEvent, taskCount: 0, taskDone: 0, guestCount: 0, progress: 0 }, ...prev]);
    }
  };

  const handleDeleted = (id) => setEvents((prev) => prev.filter((e) => e.id !== id));

  const filtered = events.filter((e) => {
    const matchFilter = filter === "all" || e.status === filter;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const topbarActions = (
    <button className="ef-btn-primary" onClick={() => setShowCreate(true)}>
      <Icon path="M12 4v16m8-8H4" size={14} color="#09090C" />
      Event Baru
    </button>
  );

  return (
    <Layout
      title="Events"
      subtitle={events.length + " event terdaftar"}
      actions={topbarActions}
    >
      <style>{CSS}</style>

      {showCreate && (
        <EventFormModal onClose={() => setShowCreate(false)} onSaved={handleSaved} />
      )}
      {editEvent && (
        <EventFormModal event={editEvent} onClose={() => setEditEvent(null)} onSaved={handleSaved} />
      )}
      {deleteEvent && (
        <DeleteModal event={deleteEvent} onClose={() => setDeleteEvent(null)} onDeleted={handleDeleted} />
      )}

      <div className="ev-page">
        <div className="ev-filters">
          {["all", "active", "planned", "urgent", "done"].map((f) => (
            <button key={f} className={"ev-filter-btn" + (filter === f ? " active" : "")}
              onClick={() => setFilter(f)}>
              {f === "all" ? "Semua" : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
          <input className="ev-search" placeholder="Cari event..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="ev-table-wrap">
          <div className="ev-table-header">
            <div>Event</div>
            <div className="col-date">Tanggal</div>
            <div>Status</div>
            <div className="col-budget">Budget</div>
            <div className="col-progress">Progress</div>
            <div></div>
          </div>

          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="ev-table-row" style={{ cursor: "default" }}>
                <div>
                  <div className="skeleton" style={{ width: 180, height: 13, marginBottom: 6 }} />
                  <div className="skeleton" style={{ width: 120, height: 11 }} />
                </div>
                <div className="skeleton col-date" style={{ width: 80, height: 13 }} />
                <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 100 }} />
                <div className="skeleton col-budget" style={{ width: 90, height: 13 }} />
                <div className="skeleton col-progress" style={{ width: 80, height: 4, borderRadius: 2 }} />
                <div style={{ width: 72 }} />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="ev-empty">
              <div className="ev-empty-icon">📅</div>
              <div className="ev-empty-title">
                {search ? "Tidak ada event yang cocok" : "Belum ada event"}
              </div>
              <div className="ev-empty-sub">
                {search ? "Coba kata kunci lain." : "Klik 'Event Baru' untuk mulai."}
              </div>
              {!search && (
                <button className="ef-btn-primary" style={{ marginTop: 8 }}
                  onClick={() => setShowCreate(true)}>
                  Buat Event Pertama →
                </button>
              )}
            </div>
          ) : (
            filtered.map((event) => {
              const s = STATUS_CONFIG[event.status] || STATUS_CONFIG.planned;
              const progress = event.progress || 0;
              const date = new Date(event.date).toLocaleDateString("id-ID", {
                day: "numeric", month: "short", year: "numeric",
              });
              return (
                <div key={event.id} className="ev-table-row"
                  onClick={() => navigate("/events/" + event.id)}>
                  <div>
                    <div className="ev-table-name">{event.name}</div>
                    <div className="ev-table-desc">{event.description || "—"}</div>
                  </div>
                  <div className="col-date ev-table-date">{date}</div>
                  <div>
                    <div className="ev-status-pill" style={{ background: s.bg, color: s.color }}>
                      <div className="ev-status-dot" style={{ background: s.dot }} />
                      {s.label}
                    </div>
                  </div>
                  <div className="col-budget">
                    <div className="ev-table-budget">{fmt(event.budgetUsed || 0)}</div>
                    <div className="ev-table-budget-sub">dari {fmt(event.budget || 0)}</div>
                  </div>
                  <div className="col-progress">
                    <div className="ev-progress-bar">
                      <div className="ev-progress-fill"
                        style={{ width: progress + "%", background: PROGRESS_COLOR[event.status] || "#C8FF57" }} />
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 3 }}>
                      {progress}%
                    </div>
                  </div>
                  <div className="ev-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="ev-action-btn view" title="Lihat Detail"
                      onClick={() => navigate("/events/" + event.id)}>
                      <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={14} />
                    </button>
                    <button className="ev-action-btn" title="Edit"
                      onClick={() => setEditEvent(event)}>
                      <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" size={14} />
                    </button>
                    <button className="ev-action-btn danger" title="Hapus"
                      onClick={() => setDeleteEvent(event)}>
                      <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}