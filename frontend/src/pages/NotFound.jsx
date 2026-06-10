import { useNavigate } from "react-router-dom";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
  :root{--bg:#09090C;--surface:#111116;--card:#16161C;--border:rgba(255,255,255,0.07);--border-h:rgba(255,255,255,0.13);--text:#F0EEE9;--muted:#7A7870;--muted2:#4A4A42;--accent:#C8FF57;--accent-dim:rgba(200,255,87,0.10);--accent-b:rgba(200,255,87,0.22);}
  html,body{height:100%;}
  body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;}
  .nf-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px;position:relative;overflow:hidden;}
  .nf-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse 60% 60% at 50% 50%,black 20%,transparent 100%);}
  .nf-inner{position:relative;z-index:1;max-width:480px;}
  .nf-code{font-family:'Instrument Serif',serif;font-size:clamp(6rem,20vw,10rem);font-weight:400;line-height:1;color:var(--accent);opacity:0.1;margin-bottom:-20px;letter-spacing:-0.04em;}
  .nf-title{font-family:'Instrument Serif',serif;font-size:clamp(1.6rem,4vw,2.4rem);font-weight:400;color:var(--text);margin-bottom:12px;}
  .nf-sub{font-size:0.92rem;color:var(--muted);line-height:1.7;margin-bottom:40px;}
  .nf-actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
  .nf-btn-primary{display:inline-flex;align-items:center;gap:8px;padding:12px 28px;border-radius:10px;background:var(--accent);color:#09090C;border:none;font-size:0.88rem;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity 0.2s,transform 0.2s;}
  .nf-btn-primary:hover{opacity:0.9;transform:translateY(-1px);}
  .nf-btn-outline{display:inline-flex;align-items:center;gap:8px;padding:12px 28px;border-radius:10px;background:transparent;color:var(--muted);border:1px solid var(--border-h);font-size:0.88rem;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
  .nf-btn-outline:hover{border-color:rgba(255,255,255,0.25);color:var(--text);transform:translateY(-1px);}
  .nf-footer{position:absolute;bottom:24px;font-size:0.72rem;color:var(--muted2);}
  .nf-footer span{color:var(--muted);}
`;

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <>
      <style>{CSS}</style>
      <div className="nf-wrap">
        <div className="nf-grid" />
        <div className="nf-inner">
          <div className="nf-code">404</div>
          <h1 className="nf-title">Halaman tidak ditemukan.</h1>
          <p className="nf-sub">
            Alamat yang kamu akses tidak tersedia atau sudah dipindahkan.
            Kembali ke dashboard atau halaman sebelumnya.
          </p>
          <div className="nf-actions">
            <button className="nf-btn-primary" onClick={() => navigate("/dashboard")}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Kembali ke Dashboard
            </button>
            <button className="nf-btn-outline" onClick={() => navigate(-1)}>
              ← Halaman Sebelumnya
            </button>
          </div>
        </div>
        <div className="nf-footer">EventFlow · Dibangun oleh <span>Jeremy Trystan</span></div>
      </div>
    </>
  );
}