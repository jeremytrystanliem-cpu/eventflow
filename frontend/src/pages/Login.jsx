import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg:#09090C; --surface:#111116; --card:#16161C;
    --border:rgba(255,255,255,0.07); --border-h:rgba(255,255,255,0.15);
    --text:#F0EEE9; --muted:#7A7870; --muted2:#4A4A42;
    --accent:#C8FF57; --accent-dim:rgba(200,255,87,0.10); --accent-b:rgba(200,255,87,0.22);
    --teal:#4ECFB3; --red:#FF6B57;
  }
  html,body{height:100%;}
  body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-weight:400;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}
  .auth-wrap{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;}
  .auth-left{background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:40px 48px;position:relative;overflow:hidden;}
  .auth-left-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);background-size:40px 40px;mask-image:radial-gradient(ellipse 80% 80% at 30% 50%,black 20%,transparent 100%);}
  .auth-left-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;}
  .orb1{width:400px;height:300px;background:rgba(200,255,87,0.05);top:-80px;left:-80px;}
  .orb2{width:300px;height:300px;background:rgba(78,207,179,0.05);bottom:-60px;right:-60px;}
  .auth-left-logo{font-family:'Instrument Serif',serif;font-size:1.3rem;color:var(--text);display:flex;align-items:center;gap:8px;text-decoration:none;position:relative;z-index:1;}
  .logo-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);}
  .auth-left-content{flex:1;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:1;padding:40px 0;}
  .auth-left-label{font-size:0.7rem;font-weight:600;color:var(--accent);letter-spacing:0.15em;text-transform:uppercase;display:flex;align-items:center;gap:8px;margin-bottom:20px;}
  .auth-left-label::before{content:'';width:20px;height:1px;background:var(--accent);}
  .auth-left-title{font-family:'Instrument Serif',serif;font-size:clamp(2rem,3.5vw,2.8rem);font-weight:400;line-height:1.1;letter-spacing:-0.02em;margin-bottom:20px;}
  .auth-left-title em{color:var(--accent);font-style:italic;}
  .auth-left-desc{font-size:0.9rem;color:var(--muted);line-height:1.75;max-width:360px;margin-bottom:40px;}
  .auth-left-desc strong{color:var(--text);font-weight:500;}
  .auth-feature-list{display:flex;flex-direction:column;gap:14px;}
  .auth-feature{display:flex;align-items:center;gap:12px;font-size:0.85rem;color:var(--muted);}
  .auth-feature-check{width:22px;height:22px;border-radius:6px;flex-shrink:0;background:var(--accent-dim);border:1px solid var(--accent-b);display:flex;align-items:center;justify-content:center;}
  .auth-left-footer{position:relative;z-index:1;font-size:0.75rem;color:var(--muted2);}
  .auth-right{display:flex;align-items:center;justify-content:center;padding:40px 48px;background:var(--bg);overflow-y:auto;}
  .auth-form-wrap{width:100%;max-width:400px;}
  .auth-form-header{margin-bottom:32px;}
  .auth-form-title{font-family:'Instrument Serif',serif;font-size:1.8rem;font-weight:400;color:var(--text);margin-bottom:6px;}
  .auth-form-sub{font-size:0.85rem;color:var(--muted);}
  .auth-form-sub a{color:var(--accent);text-decoration:none;font-weight:500;}
  .auth-form-sub a:hover{text-decoration:underline;}
  .auth-form{display:flex;flex-direction:column;gap:16px;}
  .form-group{display:flex;flex-direction:column;gap:6px;}
  .form-label{font-size:0.78rem;font-weight:500;color:var(--muted);letter-spacing:0.03em;}
  .form-input{width:100%;padding:11px 14px;background:var(--card);border:1px solid var(--border);border-radius:10px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.88rem;transition:border-color 0.2s,box-shadow 0.2s;outline:none;}
  .form-input:focus{border-color:var(--accent-b);box-shadow:0 0 0 3px rgba(200,255,87,0.08);}
  .form-input::placeholder{color:var(--muted2);}
  .form-input.error{border-color:rgba(255,107,87,0.6);box-shadow:0 0 0 3px rgba(255,107,87,0.08);}
  .form-input-wrap{position:relative;}
  .form-input-wrap .form-input{padding-right:44px;}
  .input-toggle{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);display:flex;align-items:center;padding:0;transition:color 0.15s;}
  .input-toggle:hover{color:var(--text);}
  .form-error{font-size:0.72rem;color:var(--red);display:flex;align-items:center;gap:5px;}
  .submit-error{background:rgba(255,107,87,0.12);border:1px solid rgba(255,107,87,0.35);border-radius:10px;padding:12px 16px;font-size:0.83rem;color:#FF6B57;display:flex;align-items:flex-start;gap:10px;animation:slideIn 0.25s ease;}
  .submit-error svg{flex-shrink:0;margin-top:1px;}
  @keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  .auth-tabs{display:flex;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:4px;gap:4px;margin-bottom:28px;}
  .auth-tab{flex:1;padding:8px;border-radius:7px;font-size:0.82rem;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;transition:all 0.15s;text-align:center;}
  .auth-tab.active{background:var(--accent);color:var(--bg);font-weight:600;}
  .btn-submit{width:100%;padding:13px;background:var(--accent);color:var(--bg);border:none;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer;transition:opacity 0.2s,transform 0.2s;display:flex;align-items:center;justify-content:center;gap:8px;}
  .btn-submit:hover{opacity:0.92;transform:translateY(-1px);}
  .btn-submit:disabled{opacity:0.6;cursor:not-allowed;transform:none;}
  .form-remember{display:flex;align-items:center;justify-content:space-between;font-size:0.78rem;}
  .form-remember-left{display:flex;align-items:center;gap:8px;cursor:pointer;}
  .custom-check{width:16px;height:16px;border-radius:4px;border:1.5px solid var(--border-h);background:transparent;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;}
  .custom-check.checked{background:var(--accent);border-color:var(--accent);}
  .form-remember-label{color:var(--muted);user-select:none;}
  .form-forgot{color:var(--accent);text-decoration:none;font-weight:500;font-size:0.78rem;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;padding:0;}
  .form-forgot:hover{text-decoration:underline;}
  .success-state{text-align:center;padding:40px 0;display:flex;flex-direction:column;align-items:center;gap:16px;}
  .success-icon{width:56px;height:56px;border-radius:16px;background:var(--accent-dim);border:1px solid var(--accent-b);display:flex;align-items:center;justify-content:center;font-size:1.5rem;}
  .success-title{font-family:'Instrument Serif',serif;font-size:1.4rem;color:var(--text);}
  .success-sub{font-size:0.85rem;color:var(--muted);}
  /* FORGOT PASSWORD MODAL */
  .fp-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
  .fp-modal{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;width:100%;max-width:400px;position:relative;}
  .fp-title{font-family:'Instrument Serif',serif;font-size:1.3rem;font-weight:400;color:var(--text);margin-bottom:6px;}
  .fp-sub{font-size:0.82rem;color:var(--muted);margin-bottom:24px;line-height:1.6;}
  .fp-close{position:absolute;top:18px;right:18px;background:none;border:none;color:var(--muted);cursor:pointer;font-size:1.1rem;line-height:1;}
  .fp-close:hover{color:var(--text);}
  .fp-label{font-size:0.75rem;font-weight:500;color:var(--muted);margin-bottom:6px;display:block;}
  .fp-input{width:100%;padding:11px 14px;background:var(--card);border:1px solid var(--border);border-radius:10px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.88rem;outline:none;transition:border-color 0.2s;margin-bottom:16px;}
  .fp-input:focus{border-color:var(--accent-b);}
  .fp-input::placeholder{color:var(--muted2);}
  .fp-input.error{border-color:rgba(255,107,87,0.5);}
  .fp-actions{display:flex;gap:10px;justify-content:flex-end;}
  .fp-btn-cancel{padding:9px 20px;border-radius:8px;font-size:0.82rem;font-weight:500;cursor:pointer;border:1px solid var(--border-h);background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;}
  .fp-btn-cancel:hover{color:var(--text);}
  .fp-btn-send{padding:9px 20px;border-radius:8px;font-size:0.82rem;font-weight:600;cursor:pointer;border:none;background:var(--accent);color:var(--bg);font-family:'DM Sans',sans-serif;transition:opacity 0.15s;}
  .fp-btn-send:hover{opacity:0.9;}
  .fp-btn-send:disabled{opacity:0.5;cursor:not-allowed;}
  .fp-success{background:rgba(78,207,179,0.1);border:1px solid rgba(78,207,179,0.25);border-radius:8px;padding:12px 14px;font-size:0.82rem;color:#4ECFB3;margin-bottom:16px;line-height:1.5;}
  .fp-error{background:rgba(255,107,87,0.1);border:1px solid rgba(255,107,87,0.25);border-radius:8px;padding:10px 14px;font-size:0.8rem;color:#FF6B57;margin-bottom:14px;}
  @media(max-width:768px){.auth-wrap{grid-template-columns:1fr;}.auth-left{display:none;}.auth-right{padding:32px 24px;}}
`;

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    {open ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#09090C" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const features = [
  "Dashboard event terpusat",
  "Task & tim management",
  "Budget tracker real-time",
  "Guest list & RSVP system",
];

// ─── Forgot Password Modal ────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) { setEmailError("Email wajib diisi."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError("Format email tidak valid."); return; }
    setLoading(true);
    setEmailError("");
    // Simulasi kirim — sambungkan ke endpoint reset password saat tersedia
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="fp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fp-modal">
        <button className="fp-close" onClick={onClose}>✕</button>
        <div className="fp-title">Lupa Password?</div>
        <div className="fp-sub">
          Masukkan email yang terdaftar. Kami akan mengirimkan instruksi untuk mereset password kamu.
        </div>
        {sent ? (
          <div className="fp-success">
            Instruksi reset password telah dikirim ke <strong>{email}</strong>. Cek kotak masuk atau folder spam kamu.
          </div>
        ) : (
          <>
            {emailError && <div className="fp-error">⚠ {emailError}</div>}
            <label className="fp-label">Alamat Email</label>
            <input
              className={"fp-input" + (emailError ? " error" : "")}
              type="email"
              placeholder="Masukkan email terdaftar"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              autoFocus
            />
          </>
        )}
        <div className="fp-actions">
          <button className="fp-btn-cancel" onClick={onClose}>
            {sent ? "Tutup" : "Batal"}
          </button>
          {!sent && (
            <button className="fp-btn-send" onClick={handleSend} disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Instruksi"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Login ───────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const { user, login, register } = useAuth();

  // Redirect jika sudah login
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const [tab, setTab] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForgot, setShowForgot] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [regData, setRegData] = useState({ name: "", email: "", password: "", confirm: "" });

  const clearError = (field) => {
    setErrors((prev) => {
      const e = { ...prev };
      delete e[field];
      delete e.submit;
      return e;
    });
  };

  const validate = () => {
    const e = {};
    if (tab === "login") {
      if (!loginData.email) e.email = "Email wajib diisi";
      else if (!/\S+@\S+\.\S+/.test(loginData.email)) e.email = "Format email tidak valid";
      if (!loginData.password) e.password = "Password wajib diisi";
    } else {
      if (!regData.name.trim()) e.name = "Nama wajib diisi";
      if (!regData.email) e.email = "Email wajib diisi";
      else if (!/\S+@\S+\.\S+/.test(regData.email)) e.email = "Format email tidak valid";
      if (!regData.password || regData.password.length < 8) e.password = "Password minimal 8 karakter";
      if (regData.password !== regData.confirm) e.confirm = "Password tidak cocok";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      if (tab === "login") {
        await login(loginData.email, loginData.password);
        navigate("/dashboard");
      } else {
        await register(regData.name, regData.email, regData.password);
        setSuccess(true);
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Terjadi kesalahan. Silakan coba lagi.";
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const switchTab = (t) => {
    setTab(t);
    setErrors({});
    setShowPass(false);
    setShowConfirm(false);
  };

  return (
    <>
      <style>{CSS}</style>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="auth-wrap">
        {/* LEFT */}
        <div className="auth-left">
          <div className="auth-left-grid" />
          <div className="auth-left-orb orb1" />
          <div className="auth-left-orb orb2" />
          <a href="/" className="auth-left-logo"><div className="logo-dot" />EventFlow</a>
          <div className="auth-left-content">
            <div className="auth-left-label">Platform</div>
            <h2 className="auth-left-title">Satu platform,<br /><em>semua event</em><br />terkendali.</h2>
            <p className="auth-left-desc">
              EventFlow dibangun untuk <strong>event coordinator</strong> yang butuh tools nyata — bukan spreadsheet yang berantakan.
            </p>
            <div className="auth-feature-list">
              {features.map((f) => (
                <div key={f} className="auth-feature">
                  <div className="auth-feature-check"><CheckIcon /></div>
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div className="auth-left-footer">© {new Date().getFullYear()} EventFlow · Dibangun oleh Jeremy Trystan</div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            {success ? (
              <div className="success-state">
                <div className="success-icon">🎉</div>
                <div className="success-title">Akun berhasil dibuat!</div>
                <div className="success-sub">Silakan login dengan akun kamu.</div>
                <button className="btn-submit" style={{ width: "auto", padding: "12px 32px" }}
                  onClick={() => {
                    setSuccess(false);
                    switchTab("login");
                    setRegData({ name: "", email: "", password: "", confirm: "" });
                  }}>
                  Login Sekarang →
                </button>
              </div>
            ) : (
              <>
                <div className="auth-form-header">
                  <div className="auth-form-title">
                    {tab === "login" ? "Selamat datang kembali." : "Buat akun baru."}
                  </div>
                  <div className="auth-form-sub">
                    {tab === "login"
                      ? <>Belum punya akun? <a href="#" onClick={(e) => { e.preventDefault(); switchTab("register"); }}>Daftar sekarang</a></>
                      : <>Sudah punya akun? <a href="#" onClick={(e) => { e.preventDefault(); switchTab("login"); }}>Masuk</a></>
                    }
                  </div>
                </div>

                <div className="auth-tabs">
                  <button className={"auth-tab" + (tab === "login" ? " active" : "")} onClick={() => switchTab("login")}>Masuk</button>
                  <button className={"auth-tab" + (tab === "register" ? " active" : "")} onClick={() => switchTab("register")}>Daftar</button>
                </div>

                <div className="auth-form" onKeyDown={handleKeyDown}>

                  {/* ── Error banner dari server ── */}
                  {errors.submit && (
                    <div className="submit-error">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {errors.submit}
                    </div>
                  )}

                  {/* Nama — register only */}
                  {tab === "register" && (
                    <div className="form-group">
                      <label className="form-label">Nama Lengkap</label>
                      <input
                        className={"form-input" + (errors.name ? " error" : "")}
                        placeholder="Nama lengkap kamu"
                        value={regData.name}
                        onChange={(e) => { setRegData({ ...regData, name: e.target.value }); clearError("name"); }}
                      />
                      {errors.name && <span className="form-error">⚠ {errors.name}</span>}
                    </div>
                  )}

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className={"form-input" + (errors.email ? " error" : "")}
                      type="email"
                      placeholder="Alamat email kamu"
                      value={tab === "login" ? loginData.email : regData.email}
                      onChange={(e) => {
                        tab === "login"
                          ? setLoginData({ ...loginData, email: e.target.value })
                          : setRegData({ ...regData, email: e.target.value });
                        clearError("email");
                      }}
                    />
                    {errors.email && <span className="form-error">⚠ {errors.email}</span>}
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="form-input-wrap">
                      <input
                        className={"form-input" + (errors.password ? " error" : "")}
                        type={showPass ? "text" : "password"}
                        placeholder={tab === "register" ? "Minimal 8 karakter" : "Password kamu"}
                        value={tab === "login" ? loginData.password : regData.password}
                        onChange={(e) => {
                          tab === "login"
                            ? setLoginData({ ...loginData, password: e.target.value })
                            : setRegData({ ...regData, password: e.target.value });
                          clearError("password");
                        }}
                      />
                      <button className="input-toggle" type="button" onClick={() => setShowPass(!showPass)}>
                        <EyeIcon open={showPass} />
                      </button>
                    </div>
                    {errors.password && <span className="form-error">⚠ {errors.password}</span>}
                  </div>

                  {/* Konfirmasi password — register only */}
                  {tab === "register" && (
                    <div className="form-group">
                      <label className="form-label">Konfirmasi Password</label>
                      <div className="form-input-wrap">
                        <input
                          className={"form-input" + (errors.confirm ? " error" : "")}
                          type={showConfirm ? "text" : "password"}
                          placeholder="Ulangi password"
                          value={regData.confirm}
                          onChange={(e) => { setRegData({ ...regData, confirm: e.target.value }); clearError("confirm"); }}
                        />
                        <button className="input-toggle" type="button" onClick={() => setShowConfirm(!showConfirm)}>
                          <EyeIcon open={showConfirm} />
                        </button>
                      </div>
                      {errors.confirm && <span className="form-error">⚠ {errors.confirm}</span>}
                    </div>
                  )}

                  {/* Ingat saya + Lupa password — login only */}
                  {tab === "login" && (
                    <div className="form-remember">
                      <div className="form-remember-left" onClick={() => setRemember(!remember)}>
                        <div className={"custom-check" + (remember ? " checked" : "")}>
                          {remember && <CheckIcon />}
                        </div>
                        <span className="form-remember-label">Ingat saya</span>
                      </div>
                      <button
                        className="form-forgot"
                        type="button"
                        onClick={() => setShowForgot(true)}
                      >
                        Lupa password?
                      </button>
                    </div>
                  )}

                  {/* Submit */}
                  <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round">
                            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                          </path>
                        </svg>
                        {tab === "login" ? "Masuk..." : "Mendaftar..."}
                      </>
                    ) : (
                      tab === "login" ? "Masuk ke Dashboard →" : "Buat Akun →"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}