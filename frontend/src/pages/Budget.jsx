import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventsAPI } from "../lib/api.js";
import Layout from "../components/Layout.jsx";

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
  .bg-page{padding:28px;max-width:1100px;}
  .bg-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
  .bg-stat{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 18px;position:relative;overflow:hidden;}
  .bg-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:var(--stat-accent,transparent);}
  .bg-stat-num{font-family:'Instrument Serif',serif;font-size:1.5rem;color:var(--text);line-height:1;margin-bottom:3px;}
  .bg-stat-label{font-size:0.7rem;color:var(--muted);}
  .bg-list{display:flex;flex-direction:column;gap:12px;}
  .bg-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px 24px;transition:border-color 0.2s,transform 0.15s;cursor:pointer;}
  .bg-card:hover{border-color:var(--border-h);transform:translateX(3px);}
  .bg-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;}
  .bg-card-name{font-size:0.92rem;font-weight:600;color:var(--text);margin-bottom:3px;}
  .bg-card-date{font-size:0.72rem;color:var(--muted);}
  .bg-amounts{display:flex;gap:24px;}
  .bg-amount-item{display:flex;flex-direction:column;gap:2px;}
  .bg-amount-label{font-size:0.65rem;font-weight:600;color:var(--muted2);text-transform:uppercase;letter-spacing:0.08em;}
  .bg-amount-value{font-size:0.9rem;font-weight:600;color:var(--text);}
  .bg-progress-wrap{margin-top:16px;}
  .bg-progress-header{display:flex;justify-content:space-between;font-size:0.72rem;color:var(--muted);margin-bottom:6px;}
  .bg-progress-track{height:6px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden;}
  .bg-progress-fill{height:100%;border-radius:3px;transition:width 0.8s cubic-bezier(.25,.46,.45,.94);}
  .bg-warning{display:inline-flex;align-items:center;gap:5px;font-size:0.7rem;font-weight:600;color:var(--red);margin-top:8px;}
  .bg-edit-form{margin-top:16px;padding-top:16px;border-top:1px solid var(--border);display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;}
  .bg-edit-group{display:flex;flex-direction:column;gap:4px;}
  .bg-edit-label{font-size:0.68rem;font-weight:500;color:var(--muted);}
  .bg-edit-input{padding:7px 12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.82rem;outline:none;width:160px;transition:border-color 0.2s;}
  .bg-edit-input:focus{border-color:var(--accent-b);}
  .bg-edit-btn{padding:7px 16px;border-radius:8px;background:var(--accent);color:var(--bg);border:none;font-size:0.78rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity 0.15s;white-space:nowrap;}
  .bg-edit-btn:hover{opacity:0.9;}
  .bg-edit-btn:disabled{opacity:0.5;cursor:not-allowed;}
  .bg-empty{padding:60px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;}
  .bg-empty-icon{font-size:2.5rem;opacity:0.25;}
  .bg-empty-title{font-size:0.9rem;font-weight:600;color:var(--muted);}
  .skeleton{background:linear-gradient(90deg,var(--card) 25%,rgba(255,255,255,0.04) 50%,var(--card) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @media(max-width:768px){.bg-page{padding:16px;}.bg-stats{grid-template-columns:repeat(2,1fr);}.bg-amounts{flex-wrap:wrap;gap:12px;}}
`;

const Icon = ({ path, size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

export default function Budget() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ budget: "", budgetUsed: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    eventsAPI.getAll()
      .then((res) => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaveBudget = async (eventId) => {
    setSaving(true);
    try {
      const res = await eventsAPI.update(eventId, {
        budget: parseFloat(editForm.budget) || 0,
        budgetUsed: parseFloat(editForm.budgetUsed) || 0,
      });
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, ...res.data } : e));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const totalBudget = events.reduce((a, e) => a + (e.budget || 0), 0);
  const totalUsed = events.reduce((a, e) => a + (e.budgetUsed || 0), 0);
  const totalRemaining = totalBudget - totalUsed;
  const overBudgetCount = events.filter((e) => (e.budgetUsed || 0) > (e.budget || 0)).length;

  return (
    <Layout title="Budget" subtitle="Monitor anggaran semua event">
      <style>{CSS}</style>
      <div className="bg-page">

        {/* STATS */}
        <div className="bg-stats">
          {[
            { num: fmt(totalBudget),     label: "Total Anggaran",   accent: "#C8FF57" },
            { num: fmt(totalUsed),       label: "Total Terpakai",   accent: "#F59E0B" },
            { num: fmt(totalRemaining),  label: "Sisa Anggaran",    accent: totalRemaining < 0 ? "#FF6B57" : "#4ECFB3" },
            { num: overBudgetCount,      label: "Event Over Budget", accent: overBudgetCount > 0 ? "#FF6B57" : "#C8FF57" },
          ].map((s, i) => (
            <div key={i} className="bg-stat" style={{ "--stat-accent": s.accent }}>
              <div className="bg-stat-num">{s.num}</div>
              <div className="bg-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* EVENT BUDGET LIST */}
        <div className="bg-list">
          {loading ? (
            [1,2,3].map((i) => (
              <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div className="skeleton" style={{ width: 180, height: 14, marginBottom: 8 }} />
                    <div className="skeleton" style={{ width: 100, height: 11 }} />
                  </div>
                  <div className="skeleton" style={{ width: 80, height: 28, borderRadius: 8 }} />
                </div>
                <div className="skeleton" style={{ width: "100%", height: 6, borderRadius: 3 }} />
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="bg-empty">
              <div className="bg-empty-icon">💰</div>
              <div className="bg-empty-title">Belum ada event</div>
            </div>
          ) : (
            events.map((event) => {
              const budget = event.budget || 0;
              const used = event.budgetUsed || 0;
              const remaining = budget - used;
              const pct = budget > 0 ? Math.min(Math.round((used / budget) * 100), 100) : 0;
              const isOver = used > budget && budget > 0;
              const isWarning = pct >= 80 && !isOver;
              const barColor = isOver ? "#FF6B57" : isWarning ? "#F59E0B" : "#C8FF57";
              const isEditing = editingId === event.id;
              const date = new Date(event.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

              return (
                <div key={event.id} className="bg-card"
                  onClick={() => !isEditing && navigate("/events/" + event.id)}>
                  <div className="bg-card-top">
                    <div>
                      <div className="bg-card-name">{event.name}</div>
                      <div className="bg-card-date">📅 {date}</div>
                    </div>
                    <button
                      style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border-h)", background: "transparent", color: "var(--muted)", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(isEditing ? null : event.id);
                        setEditForm({ budget: budget, budgetUsed: used });
                      }}>
                      {isEditing ? "Batal" : "Edit Budget"}
                    </button>
                  </div>

                  <div className="bg-amounts">
                    <div className="bg-amount-item">
                      <div className="bg-amount-label">Total Anggaran</div>
                      <div className="bg-amount-value">{fmt(budget)}</div>
                    </div>
                    <div className="bg-amount-item">
                      <div className="bg-amount-label">Terpakai</div>
                      <div className="bg-amount-value" style={{ color: isOver ? "#FF6B57" : "var(--text)" }}>
                        {fmt(used)}
                      </div>
                    </div>
                    <div className="bg-amount-item">
                      <div className="bg-amount-label">Sisa</div>
                      <div className="bg-amount-value" style={{ color: remaining < 0 ? "#FF6B57" : "#4ECFB3" }}>
                        {fmt(remaining)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-progress-wrap">
                    <div className="bg-progress-header">
                      <span>Penggunaan Budget</span>
                      <span style={{ color: barColor, fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div className="bg-progress-track">
                      <div className="bg-progress-fill" style={{ width: pct + "%", background: barColor }} />
                    </div>
                    {isOver && (
                      <div className="bg-warning">
                        <Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={13} color="#FF6B57" />
                        Over budget {fmt(used - budget)}
                      </div>
                    )}
                    {isWarning && (
                      <div className="bg-warning" style={{ color: "#F59E0B" }}>
                        <Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={13} color="#F59E0B" />
                        Mendekati batas budget
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="bg-edit-form" onClick={(e) => e.stopPropagation()}>
                      <div className="bg-edit-group">
                        <label className="bg-edit-label">Total Anggaran (Rp)</label>
                        <input className="bg-edit-input" type="number" placeholder="5000000"
                          value={editForm.budget}
                          onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })} />
                      </div>
                      <div className="bg-edit-group">
                        <label className="bg-edit-label">Sudah Terpakai (Rp)</label>
                        <input className="bg-edit-input" type="number" placeholder="0"
                          value={editForm.budgetUsed}
                          onChange={(e) => setEditForm({ ...editForm, budgetUsed: e.target.value })} />
                      </div>
                      <button className="bg-edit-btn" disabled={saving}
                        onClick={() => handleSaveBudget(event.id)}>
                        {saving ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div style={{ height: 32 }} />
      </div>
    </Layout>
  );
}