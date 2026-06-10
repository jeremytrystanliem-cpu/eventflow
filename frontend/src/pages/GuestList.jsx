import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { guestsAPI, eventsAPI } from "../lib/api.js";
import Layout from "../components/Layout.jsx";

const RSVP_CONFIG = {
  pending:   { label: "Pending",   bg: "rgba(255,255,255,0.06)", color: "#7A7870" },
  confirmed: { label: "Confirmed", bg: "rgba(78,207,179,0.12)",  color: "#4ECFB3" },
  declined:  { label: "Declined",  bg: "rgba(255,107,87,0.12)",  color: "#FF6B57" },
};

const CSS = `
  :root{
    --bg:#09090C;--surface:#111116;--card:#16161C;
    --border:rgba(255,255,255,0.07);--border-h:rgba(255,255,255,0.13);
    --text:#F0EEE9;--muted:#7A7870;--muted2:#4A4A42;
    --accent:#C8FF57;--accent-dim:rgba(200,255,87,0.10);--accent-b:rgba(200,255,87,0.22);
    --teal:#4ECFB3;--red:#FF6B57;
  }
  .gl-page{padding:28px;max-width:1100px;}
  .gl-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
  .gl-stat{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;}
  .gl-stat-num{font-family:'Instrument Serif',serif;font-size:1.5rem;color:var(--text);line-height:1;margin-bottom:3px;}
  .gl-stat-label{font-size:0.7rem;color:var(--muted);}
  .gl-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap;}
  .gl-filter-btn{padding:6px 14px;border-radius:100px;font-size:0.78rem;font-weight:500;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;transition:all 0.15s;}
  .gl-filter-btn:hover{border-color:var(--border-h);color:var(--text);}
  .gl-filter-btn.active{background:var(--accent-dim);border-color:var(--accent-b);color:var(--accent);}
  .gl-search{flex:1;max-width:260px;padding:7px 14px;background:var(--card);border:1px solid var(--border);border-radius:9px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.82rem;outline:none;transition:border-color 0.2s;}
  .gl-search:focus{border-color:var(--accent-b);}
  .gl-search::placeholder{color:var(--muted2);}
  .gl-table-wrap{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;}
  .gl-table-header{display:grid;grid-template-columns:2fr 2fr 1fr 1fr auto;gap:12px;padding:12px 20px;border-bottom:1px solid var(--border);font-size:0.68rem;font-weight:600;color:var(--muted2);letter-spacing:0.08em;text-transform:uppercase;}
  .gl-table-row{display:grid;grid-template-columns:2fr 2fr 1fr 1fr auto;gap:12px;padding:13px 20px;border-bottom:1px solid var(--border);align-items:center;transition:background 0.15s;}
  .gl-table-row:last-child{border-bottom:none;}
  .gl-table-row:hover{background:rgba(255,255,255,0.02);}
  .gl-avatar{width:30px;height:30px;border-radius:8px;background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;color:var(--muted);flex-shrink:0;}
  .gl-name-cell{display:flex;align-items:center;gap:10px;}
  .gl-name{font-size:0.84rem;font-weight:500;color:var(--text);}
  .gl-email{font-size:0.75rem;color:var(--muted);}
  .gl-event-link{font-size:0.78rem;color:var(--muted);cursor:pointer;background:none;border:none;font-family:'DM Sans',sans-serif;padding:0;text-align:left;transition:color 0.15s;}
  .gl-event-link:hover{color:var(--accent);}
  .gl-rsvp-pill{font-size:0.68rem;font-weight:600;padding:4px 12px;border-radius:100px;cursor:pointer;transition:opacity 0.15s;border:none;font-family:'DM Sans',sans-serif;display:inline-block;}
  .gl-rsvp-pill:hover{opacity:0.8;}
  .gl-actions{display:flex;gap:6px;}
  .gl-del{width:28px;height:28px;border-radius:7px;border:1px solid transparent;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted2);transition:all 0.15s;}
  .gl-del:hover{border-color:rgba(255,107,87,0.3);color:var(--red);background:rgba(255,107,87,0.08);}
  .gl-empty{padding:60px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;}
  .gl-empty-icon{font-size:2.5rem;opacity:0.25;}
  .gl-empty-title{font-size:0.9rem;font-weight:600;color:var(--muted);}
  .gl-empty-sub{font-size:0.8rem;color:var(--muted2);}
  .skeleton{background:linear-gradient(90deg,var(--card) 25%,rgba(255,255,255,0.04) 50%,var(--card) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:6px;}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .ef-btn-primary{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:8px;background:var(--accent);color:var(--bg);border:none;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity 0.15s;}
  .ef-btn-primary:hover{opacity:0.9;}
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
  .ef-form-select{width:100%;padding:9px 12px;background:var(--card);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.84rem;outline:none;cursor:pointer;}
  .ef-modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;}
  .ef-btn-cancel{padding:8px 18px;border-radius:7px;font-size:0.8rem;font-weight:500;cursor:pointer;border:1px solid var(--border-h);background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;}
  .ef-btn-cancel:hover{color:var(--text);}
  .ef-btn-save{padding:8px 18px;border-radius:7px;font-size:0.8rem;font-weight:600;cursor:pointer;border:none;background:var(--accent);color:var(--bg);font-family:'DM Sans',sans-serif;}
  .ef-btn-save:hover{opacity:0.9;}
  .ef-btn-save:disabled{opacity:0.5;cursor:not-allowed;}
  .ef-error-banner{background:rgba(255,107,87,0.1);border:1px solid rgba(255,107,87,0.25);border-radius:8px;padding:9px 12px;font-size:0.78rem;color:#FF6B57;margin-bottom:12px;}
  @media(max-width:768px){.gl-page{padding:16px;}.gl-stats{grid-template-columns:repeat(2,1fr);}.gl-table-header,.gl-table-row{grid-template-columns:1fr auto;}.gl-table-header .col-email,.gl-table-header .col-event,.gl-table-row .col-email,.gl-table-row .col-event{display:none;}}
`;

const Icon = ({ path, size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

function AddGuestModal({ events, onClose, onAdded }) {
  const [form, setForm] = useState({ name: "", email: "", eventId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name) { setError("Nama wajib diisi."); return; }
    if (!form.eventId) { setError("Pilih event terlebih dahulu."); return; }
    setLoading(true);
    try {
      const res = await guestsAPI.add(form);
      const eventData = events.find((e) => e.id === form.eventId);
      onAdded({ ...res.data, event: { name: eventData?.name || "" } });
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
        <div className="ef-modal-sub">Tambahkan peserta ke salah satu event.</div>
        {error && <div className="ef-error-banner">⚠ {error}</div>}
        <div className="ef-form-group">
          <label className="ef-form-label">Nama *</label>
          <input className="ef-form-input" placeholder="Nama lengkap"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="ef-form-group">
          <label className="ef-form-label">Email</label>
          <input className="ef-form-input" type="email" placeholder="email@contoh.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="ef-form-group">
          <label className="ef-form-label">Event *</label>
          <select className="ef-form-select" value={form.eventId}
            onChange={(e) => setForm({ ...form, eventId: e.target.value })}>
            <option value="">Pilih event...</option>
            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
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

export default function GuestList() {
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    Promise.all([guestsAPI.getAll(), eventsAPI.getAll()])
      .then(([gRes, eRes]) => {
        setGuests(gRes.data);
        setEvents(eRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateRsvp = async (id, current) => {
    const order = ["pending", "confirmed", "declined"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    try {
      const res = await guestsAPI.updateRsvp(id, next);
      setGuests((prev) => prev.map((g) => g.id === id ? { ...g, rsvp: res.data.rsvp } : g));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await guestsAPI.delete(id);
      setGuests((prev) => prev.filter((g) => g.id !== id));
    } catch (err) { console.error(err); }
  };

  const filtered = guests.filter((g) => {
    const matchRsvp = filter === "all" || g.rsvp === filter;
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.email || "").toLowerCase().includes(search.toLowerCase());
    return matchRsvp && matchSearch;
  });

  const confirmed = guests.filter((g) => g.rsvp === "confirmed").length;
  const pending = guests.filter((g) => g.rsvp === "pending").length;
  const declined = guests.filter((g) => g.rsvp === "declined").length;

  const topbarActions = (
    <button className="ef-btn-primary" onClick={() => setShowAdd(true)}>
      <Icon path="M12 4v16m8-8H4" size={14} color="#09090C" />
      Tambah Guest
    </button>
  );

  return (
    <Layout title="Guest List" subtitle={guests.length + " total guests"} actions={topbarActions}>
      <style>{CSS}</style>
      {showAdd && (
        <AddGuestModal events={events} onClose={() => setShowAdd(false)}
          onAdded={(g) => setGuests((prev) => [g, ...prev])} />
      )}
      <div className="gl-page">
        <div className="gl-stats">
          {[
            { num: guests.length, label: "Total Guests",  color: "var(--text)" },
            { num: confirmed,     label: "Confirmed",     color: "#4ECFB3" },
            { num: pending,       label: "Pending",       color: "#F59E0B" },
            { num: declined,      label: "Declined",      color: "#FF6B57" },
          ].map((s, i) => (
            <div key={i} className="gl-stat">
              <div className="gl-stat-num" style={{ color: s.color }}>{s.num}</div>
              <div className="gl-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="gl-toolbar">
          {["all", "confirmed", "pending", "declined"].map((f) => (
            <button key={f} className={"gl-filter-btn" + (filter === f ? " active" : "")}
              onClick={() => setFilter(f)}>
              {f === "all" ? "Semua" : RSVP_CONFIG[f]?.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <input className="gl-search" placeholder="Cari nama atau email..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="gl-table-wrap">
          <div className="gl-table-header">
            <div>Nama</div>
            <div className="col-email">Email</div>
            <div className="col-event">Event</div>
            <div>RSVP</div>
            <div></div>
          </div>

          {loading ? (
            [1,2,3,4].map((i) => (
              <div key={i} className="gl-table-row" style={{ cursor: "default" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="skeleton" style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0 }} />
                  <div className="skeleton" style={{ width: 120, height: 13 }} />
                </div>
                <div className="skeleton col-email" style={{ width: 140, height: 13 }} />
                <div className="skeleton col-event" style={{ width: 100, height: 13 }} />
                <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 100 }} />
                <div style={{ width: 28 }} />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="gl-empty">
              <div className="gl-empty-icon">👥</div>
              <div className="gl-empty-title">{search ? "Tidak ada guest yang cocok" : "Belum ada guest"}</div>
              <div className="gl-empty-sub">{!search && "Tambah guest dari halaman Event Detail atau klik 'Tambah Guest'."}</div>
            </div>
          ) : (
            filtered.map((guest) => {
              const r = RSVP_CONFIG[guest.rsvp] || RSVP_CONFIG.pending;
              const initials = guest.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
              const eventData = events.find((e) => e.id === guest.eventId);
              return (
                <div key={guest.id} className="gl-table-row">
                  <div className="gl-name-cell">
                    <div className="gl-avatar">{initials}</div>
                    <div className="gl-name">{guest.name}</div>
                  </div>
                  <div className="col-email gl-email">{guest.email || "—"}</div>
                  <div className="col-event">
                    <button className="gl-event-link"
                      onClick={() => eventData && navigate("/events/" + eventData.id)}>
                      {eventData?.name || "—"}
                    </button>
                  </div>
                  <div>
                    <button className="gl-rsvp-pill" style={{ background: r.bg, color: r.color }}
                      onClick={() => handleUpdateRsvp(guest.id, guest.rsvp)}
                      title="Klik untuk ubah RSVP">
                      {r.label}
                    </button>
                  </div>
                  <div className="gl-actions">
                    <button className="gl-del" onClick={() => handleDelete(guest.id)}>
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