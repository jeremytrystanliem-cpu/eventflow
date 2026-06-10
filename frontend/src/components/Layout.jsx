import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "events",    label: "Events",    path: "/events",    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { id: "tasks",     label: "Tasks",     path: "/tasks",     icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { id: "guests",    label: "Guest List",path: "/guests",    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "budget",    label: "Budget",    path: "/budget",    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "settings",  label: "Settings",  path: "/settings",  icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
  :root{
    --bg:#09090C;--surface:#111116;--card:#16161C;
    --border:rgba(255,255,255,0.07);--border-h:rgba(255,255,255,0.13);
    --text:#F0EEE9;--muted:#7A7870;--muted2:#4A4A42;
    --accent:#C8FF57;--accent-dim:rgba(200,255,87,0.10);--accent-b:rgba(200,255,87,0.22);
    --teal:#4ECFB3;--red:#FF6B57;
    --sidebar-w:220px;
  }
  html,body,#root{height:100%;}
  body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-weight:400;overflow:hidden;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px;}

  .layout-wrap{display:flex;height:100vh;overflow:hidden;}

  /* SIDEBAR */
  .layout-sidebar{width:var(--sidebar-w);flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;transition:transform 0.3s cubic-bezier(.25,.46,.45,.94);}
  .layout-logo{padding:20px 20px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;font-family:'Instrument Serif',serif;font-size:1.2rem;color:var(--text);cursor:pointer;flex-shrink:0;background:none;width:100%;text-align:left;border-right:none;transition:background 0.15s;}
  .layout-logo:hover{background:rgba(255,255,255,0.02);}
  .logo-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);flex-shrink:0;animation:dotPulse 2s ease-in-out infinite;}
  @keyframes dotPulse{0%,100%{opacity:1}50%{opacity:0.4}}
  .layout-nav{padding:16px 12px 0;flex:1;overflow-y:auto;}
  .layout-nav-label{font-size:0.62rem;font-weight:600;color:var(--muted2);letter-spacing:0.12em;text-transform:uppercase;padding:0 10px;margin-bottom:6px;}
  .layout-nav-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;font-size:0.82rem;font-weight:500;color:var(--muted);cursor:pointer;transition:all 0.15s;margin-bottom:2px;border:1px solid transparent;user-select:none;}
  .layout-nav-item:hover{background:rgba(255,255,255,0.04);color:var(--text);}
  .layout-nav-item.active{background:var(--accent-dim);color:var(--accent);border-color:var(--accent-b);}
  .layout-nav-icon{flex-shrink:0;opacity:0.7;}
  .layout-nav-item.active .layout-nav-icon{opacity:1;}
  .layout-footer{padding:16px 12px;border-top:1px solid var(--border);flex-shrink:0;}
  .layout-user{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:background 0.15s;}
  .layout-user:hover{background:rgba(255,255,255,0.04);}
  .layout-avatar{width:32px;height:32px;border-radius:8px;flex-shrink:0;background:linear-gradient(135deg,var(--accent-dim),rgba(78,207,179,0.15));border:1px solid var(--accent-b);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:600;color:var(--accent);}
  .layout-user-name{font-size:0.8rem;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .layout-user-role{font-size:0.68rem;color:var(--muted);}

  /* MAIN */
  .layout-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .layout-topbar{padding:14px 28px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--surface);flex-shrink:0;gap:12px;}
  .layout-page-title{font-family:'Instrument Serif',serif;font-size:1.3rem;font-weight:400;color:var(--text);line-height:1.1;}
  .layout-page-sub{font-size:0.75rem;color:var(--muted);}
  .layout-topbar-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}
  .layout-content{flex:1;overflow-y:auto;}

  /* PAGE TRANSITION */
  .layout-content-inner{animation:pageIn 0.2s ease both;}
  @keyframes pageIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

  /* MOBILE TOPBAR & BURGER */
  .layout-burger{display:none;background:none;border:none;cursor:pointer;padding:6px;color:var(--muted);transition:color 0.15s;}
  .layout-burger:hover{color:var(--text);}

  /* MOBILE OVERLAY */
  .layout-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:98;backdrop-filter:blur(2px);}
  .layout-overlay.open{display:block;}

  /* MOBILE */
  @media(max-width:768px){
    :root{--sidebar-w:260px;}
    .layout-sidebar{position:fixed;top:0;left:0;bottom:0;z-index:99;transform:translateX(-100%);}
    .layout-sidebar.open{transform:translateX(0);}
    .layout-burger{display:flex;}
    .layout-topbar{padding:12px 16px;}
    .layout-content{padding:0;}
  }
`;

const Icon = ({ path, size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

export default function Layout({ children, title, subtitle, actions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const activeId = NAV_ITEMS.find((item) =>
    location.pathname === item.path ||
    location.pathname.startsWith(item.path + "/")
  )?.id || "dashboard";

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="layout-wrap">

        {/* MOBILE OVERLAY */}
        <div
          className={"layout-overlay" + (sidebarOpen ? " open" : "")}
          onClick={() => setSidebarOpen(false)}
        />

        {/* SIDEBAR */}
        <aside className={"layout-sidebar" + (sidebarOpen ? " open" : "")}>
          <button className="layout-logo" onClick={() => handleNav("/dashboard")}>
            <div className="logo-dot" />EventFlow
          </button>
          <div className="layout-nav">
            <div className="layout-nav-label">Main</div>
            {NAV_ITEMS.slice(0, 5).map((item) => (
              <div key={item.id}
                className={"layout-nav-item" + (activeId === item.id ? " active" : "")}
                onClick={() => handleNav(item.path)}>
                <span className="layout-nav-icon"><Icon path={item.icon} size={16} /></span>
                {item.label}
              </div>
            ))}
            <div className="layout-nav-label" style={{ marginTop: 20 }}>Account</div>
            <div
              className={"layout-nav-item" + (activeId === "settings" ? " active" : "")}
              onClick={() => handleNav("/settings")}>
              <span className="layout-nav-icon"><Icon path={NAV_ITEMS[5].icon} size={16} /></span>
              Settings
            </div>
          </div>
          <div className="layout-footer">
            <div className="layout-user" onClick={logout} title="Klik untuk logout">
              <div className="layout-avatar">{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div className="layout-user-name">{user?.name || "User"}</div>
                <div className="layout-user-role">Klik untuk logout</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="layout-main">
          {(title || actions) && (
            <div className="layout-topbar">
              {/* Mobile burger */}
              <button className="layout-burger" onClick={() => setSidebarOpen(true)}>
                <Icon path="M4 6h16M4 12h16M4 18h16" size={22} />
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                {title && <div className="layout-page-title">{title}</div>}
                {subtitle && <div className="layout-page-sub">{subtitle}</div>}
              </div>
              {actions && <div className="layout-topbar-right">{actions}</div>}
            </div>
          )}
          <div className="layout-content">
            <div className="layout-content-inner">
              {children}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}