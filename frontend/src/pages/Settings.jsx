import { useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import api from "../lib/api.js";
import Layout from "../components/Layout.jsx";

const CSS = `
  :root{
    --bg:#09090C;--surface:#111116;--card:#16161C;
    --border:rgba(255,255,255,0.07);--border-h:rgba(255,255,255,0.13);
    --text:#F0EEE9;--muted:#7A7870;--muted2:#4A4A42;
    --accent:#C8FF57;--accent-dim:rgba(200,255,87,0.10);--accent-b:rgba(200,255,87,0.22);
    --teal:#4ECFB3;--red:#FF6B57;
  }
  .st-page{padding:28px;max-width:680px;}
  .st-section{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:16px;}
  .st-section-header{padding:18px 24px;border-bottom:1px solid var(--border);}
  .st-section-title{font-family:'Instrument Serif',serif;font-size:1.05rem;font-weight:400;color:var(--text);margin-bottom:3px;}
  .st-section-sub{font-size:0.78rem;color:var(--muted);}
  .st-section-body{padding:20px 24px;}
  .st-form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
  .st-form-label{font-size:0.75rem;font-weight:500;color:var(--muted);}
  .st-form-input{width:100%;padding:10px 13px;background:var(--surface);border:1px solid var(--border);border-radius:9px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.86rem;outline:none;transition:border-color 0.2s,box-shadow 0.2s;}
  .st-form-input:focus{border-color:var(--accent-b);box-shadow:0 0 0 3px rgba(200,255,87,0.06);}
  .st-form-input::placeholder{color:var(--muted2);}
  .st-form-input:disabled{opacity:0.4;cursor:not-allowed;}
  .st-form-input.error{border-color:rgba(255,107,87,0.5);}
  .st-field-error{font-size:0.72rem;color:var(--red);display:flex;align-items:center;gap:5px;}
  .st-form-actions{display:flex;justify-content:flex-end;margin-top:16px;}
  .st-btn-save{padding:9px 22px;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;border:none;background:var(--accent);color:var(--bg);font-family:'DM Sans',sans-serif;transition:opacity 0.15s;}
  .st-btn-save:hover{opacity:0.9;}
  .st-btn-save:disabled{opacity:0.5;cursor:not-allowed;}
  .st-btn-danger{padding:9px 22px;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;background:rgba(255,107,87,0.1);color:var(--red);font-family:'DM Sans',sans-serif;border:1px solid rgba(255,107,87,0.25);transition:all 0.15s;}
  .st-btn-danger:hover{background:rgba(255,107,87,0.2);}
  .st-success{background:rgba(78,207,179,0.1);border:1px solid rgba(78,207,179,0.25);border-radius:8px;padding:10px 14px;font-size:0.8rem;color:#4ECFB3;margin-bottom:14px;display:flex;align-items:center;gap:6px;animation:slideIn 0.2s ease;}
  .st-error{background:rgba(255,107,87,0.1);border:1px solid rgba(255,107,87,0.25);border-radius:8px;padding:10px 14px;font-size:0.8rem;color:#FF6B57;margin-bottom:14px;animation:slideIn 0.2s ease;}
  @keyframes slideIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
  .st-avatar-row{display:flex;align-items:center;gap:16px;margin-bottom:20px;}
  .st-avatar-big{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,var(--accent-dim),rgba(78,207,179,0.15));border:1px solid var(--accent-b);display:flex;align-items:center;justify-content:center;font-family:'Instrument Serif',serif;font-size:1.4rem;color:var(--accent);}
  .st-avatar-name{font-size:0.92rem;font-weight:600;color:var(--text);}
  .st-avatar-role{font-size:0.75rem;color:var(--muted);}
  .st-danger-row{display:flex;align-items:center;justify-content:space-between;padding:4px 0;}
  .st-danger-title{font-size:0.85rem;font-weight:500;color:var(--text);margin-bottom:2px;}
  .st-danger-sub{font-size:0.75rem;color:var(--muted);}
  .st-built-by{padding:16px 0 0;font-size:0.72rem;color:var(--muted2);text-align:center;}
  .st-built-by span{color:var(--muted);}
  @media(max-width:768px){.st-page{padding:16px;}}
`;

export default function Settings() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const [name, setName] = useState(user?.name || "");
  const [nameMsg, setNameMsg] = useState(null);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  const [passForm, setPassForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passErrors, setPassErrors] = useState({});
  const [passMsg, setPassMsg] = useState(null);
  const [passSaving, setPassSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim()) { setNameError("Nama tidak boleh kosong."); return; }
    setNameSaving(true);
    setNameMsg(null);
    setNameError("");
    try {
      await api.patch("/auth/profile", { name: name.trim() });
      const stored = localStorage.getItem("ef_user");
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem("ef_user", JSON.stringify({ ...u, name: name.trim() }));
      }
      setNameMsg({ type: "success", text: "Nama berhasil diperbarui." });
    } catch (err) {
      setNameMsg({ type: "error", text: err.response?.data?.error || "Gagal memperbarui nama." });
    } finally {
      setNameSaving(false);
    }
  };

  const validatePass = () => {
    const e = {};
    if (!passForm.current) e.current = "Password saat ini wajib diisi";
    if (!passForm.newPass) e.newPass = "Password baru wajib diisi";
    else if (passForm.newPass.length < 8) e.newPass = "Password baru minimal 8 karakter";
    if (passForm.newPass !== passForm.confirm) e.confirm = "Konfirmasi password tidak cocok";
    setPassErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePass = async () => {
    if (!validatePass()) return;
    setPassSaving(true);
    setPassMsg(null);
    try {
      await api.patch("/auth/password", {
        currentPassword: passForm.current,
        newPassword: passForm.newPass,
      });
      setPassMsg({ type: "success", text: "Password berhasil diubah." });
      setPassForm({ current: "", newPass: "", confirm: "" });
      setPassErrors({});
    } catch (err) {
      setPassMsg({ type: "error", text: err.response?.data?.error || "Gagal mengubah password." });
    } finally {
      setPassSaving(false);
    }
  };

  const clearPassError = (field) => {
    if (passErrors[field]) setPassErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  };

  return (
    <Layout title="Pengaturan" subtitle="Kelola akun dan preferensi kamu">
      <style>{CSS}</style>
      <div className="st-page">

        {/* PROFIL */}
        <div className="st-section">
          <div className="st-section-header">
            <div className="st-section-title">Profil</div>
            <div className="st-section-sub">Informasi akun yang ditampilkan di dalam aplikasi.</div>
          </div>
          <div className="st-section-body">
            <div className="st-avatar-row">
              <div className="st-avatar-big">{initials}</div>
              <div>
                <div className="st-avatar-name">{user?.name}</div>
                <div className="st-avatar-role">{user?.email} · {user?.role}</div>
              </div>
            </div>
            {nameMsg && (
              <div className={nameMsg.type === "success" ? "st-success" : "st-error"}>
                {nameMsg.type === "success" ? "✓" : "⚠"} {nameMsg.text}
              </div>
            )}
            <div className="st-form-group">
              <label className="st-form-label">Nama Lengkap</label>
              <input className={"st-form-input" + (nameError ? " error" : "")}
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(""); setNameMsg(null); }} />
              {nameError && <span className="st-field-error">⚠ {nameError}</span>}
            </div>
            <div className="st-form-group">
              <label className="st-form-label">Email</label>
              <input className="st-form-input" value={user?.email || ""} disabled />
            </div>
            <div className="st-form-actions">
              <button className="st-btn-save" onClick={handleSaveName} disabled={nameSaving}>
                {nameSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>

        {/* UBAH PASSWORD */}
        <div className="st-section">
          <div className="st-section-header">
            <div className="st-section-title">Ubah Password</div>
            <div className="st-section-sub">Gunakan password yang kuat dan unik.</div>
          </div>
          <div className="st-section-body">
            {passMsg && (
              <div className={passMsg.type === "success" ? "st-success" : "st-error"}>
                {passMsg.type === "success" ? "✓" : "⚠"} {passMsg.text}
              </div>
            )}
            <div className="st-form-group">
              <label className="st-form-label">Password Saat Ini</label>
              <input className={"st-form-input" + (passErrors.current ? " error" : "")}
                type={showPass ? "text" : "password"} placeholder="••••••••"
                value={passForm.current}
                onChange={(e) => { setPassForm({ ...passForm, current: e.target.value }); clearPassError("current"); }} />
              {passErrors.current && <span className="st-field-error">⚠ {passErrors.current}</span>}
            </div>
            <div className="st-form-group">
              <label className="st-form-label">Password Baru</label>
              <input className={"st-form-input" + (passErrors.newPass ? " error" : "")}
                type={showPass ? "text" : "password"} placeholder="Minimal 8 karakter"
                value={passForm.newPass}
                onChange={(e) => { setPassForm({ ...passForm, newPass: e.target.value }); clearPassError("newPass"); }} />
              {passErrors.newPass && <span className="st-field-error">⚠ {passErrors.newPass}</span>}
            </div>
            <div className="st-form-group">
              <label className="st-form-label">Konfirmasi Password Baru</label>
              <input className={"st-form-input" + (passErrors.confirm ? " error" : "")}
                type={showPass ? "text" : "password"} placeholder="Ulangi password baru"
                value={passForm.confirm}
                onChange={(e) => { setPassForm({ ...passForm, confirm: e.target.value }); clearPassError("confirm"); }} />
              {passErrors.confirm && <span className="st-field-error">⚠ {passErrors.confirm}</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.78rem", color: "var(--muted)" }}>
                <input type="checkbox" checked={showPass} onChange={(e) => setShowPass(e.target.checked)}
                  style={{ accentColor: "var(--accent)" }} />
                Tampilkan password
              </label>
              <button className="st-btn-save" onClick={handleChangePass} disabled={passSaving}>
                {passSaving ? "Menyimpan..." : "Ubah Password"}
              </button>
            </div>
          </div>
        </div>

        {/* ZONA BAHAYA */}
        <div className="st-section" style={{ borderColor: "rgba(255,107,87,0.2)" }}>
          <div className="st-section-header" style={{ borderBottomColor: "rgba(255,107,87,0.15)" }}>
            <div className="st-section-title" style={{ color: "var(--red)" }}>Zona Bahaya</div>
            <div className="st-section-sub">Tindakan di bawah ini tidak dapat dibatalkan.</div>
          </div>
          <div className="st-section-body">
            <div className="st-danger-row">
              <div>
                <div className="st-danger-title">Keluar dari akun</div>
                <div className="st-danger-sub">Sesi aktif akan diakhiri di perangkat ini.</div>
              </div>
              <button className="st-btn-danger" onClick={logout}>Logout</button>
            </div>
          </div>
        </div>

        <div className="st-built-by">Dibangun oleh <span>Jeremy Trystan</span> · {new Date().getFullYear()}</div>
        <div style={{ height: 32 }} />
      </div>
    </Layout>
  );
}