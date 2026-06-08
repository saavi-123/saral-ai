"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ALL_TOOLS = [
  { id: "saral-ai", label: "Saral AI" },
  { id: "geolocation", label: "Geolocation Tracking" },
  { id: "email-security", label: "Email Security" },
  { id: "cdr", label: "CDR Processor" },
  { id: "imei-lookup", label: "IMEI Lookup" },
  { id: "ceir-tracer", label: "CEIR Tracer" },
  { id: "cell-spyder", label: "Cell Spyder" },
  { id: "mni-analysis", label: "MNI Analysis" },
  { id: "tsp-lookup", label: "TSP Lookup" },
  { id: "mcc-mnc", label: "MCC-MNC Lookup" },
  { id: "mac-lookup", label: "MAC Lookup" },
  { id: "sms-header", label: "SMS Header Intel" },
  { id: "bsa", label: "BSA" },
  { id: "phonepe-analyzer", label: "PhonePe Analyzer" },
  { id: "nccrp-graph", label: "NCCRP Graph" },
  { id: "tsdp", label: "TSDP" },
  { id: "atm-lookup", label: "ATM Lookup" },
  { id: "ifsc-lookup", label: "IFSC Lookup" },
  { id: "lat-long-mapper", label: "Lat Long Mapper" },
  { id: "sugam-route", label: "Sugam Route" },
  { id: "toll-plaza", label: "Toll Plaza" },
  { id: "ipdr-analysis", label: "IPDR Analysis" },
  { id: "google-analyzer", label: "Google Analyzer" },
  { id: "aadhaar-validator", label: "Aadhaar Validator" },
  { id: "caf-summarizer", label: "CAF Summarizer" },
  { id: "ip-intelligence", label: "IP Intelligence" },
  { id: "hash-generator", label: "Hash Generator" },
  { id: "ps-lookup", label: "PS Lookup" },
  { id: "nodal-officers", label: "Nodal Officers" },
  { id: "lea-templates", label: "LEA Templates" },
  { id: "ic-connect", label: "iC Connect" },
  { id: "tip-line", label: "Tip Line Analysis" },
];

const ROLE_COLORS = {
  admin: { color: "#e57373", bg: "rgba(229,115,115,0.1)", border: "rgba(229,115,115,0.25)" },
  investigator: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)" },
  corporate: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)" },
};

const EMPTY_FORM = {
  username: "", email: "", password: "",
  role_type: "investigator", allowed_tools: [],
};

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ── ALL HOOKS FIRST — no returns before this block ──
  const [theme, setTheme] = useState("dark");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Theme init
  useEffect(() => {
    const saved = localStorage.getItem("saral-theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  // Fetch users
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role_type === "admin") {
      fetchUsers();
    }
  }, [status, session]);

  // Auth guard — redirect non-admins
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role_type !== "admin") {
      router.replace("/");
    }
  }, [session, status]);

  // ── EARLY RETURN after all hooks ──
  if (status === "loading" || !session || session.user?.role_type !== "admin") {
    return null;
  }

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("saral-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const openCreate = () => { setForm(EMPTY_FORM); setModal("create"); };
  const openEdit = (user) => {
    setSelectedUser(user);
    setForm({
      username: user.username || "",
      email: user.email || "",
      password: "",
      role_type: user.role_type || "investigator",
      allowed_tools: user.allowed_tools || [],
    });
    setModal("edit");
  };
  const openDelete = (user) => { setSelectedUser(user); setModal("delete"); };
  const openReset = (user) => { setSelectedUser(user); setNewPassword(""); setModal("reset"); };
  const closeModal = () => { setModal(null); setSelectedUser(null); setForm(EMPTY_FORM); setNewPassword(""); };

  const toggleTool = (toolId) => {
    setForm(f => ({
      ...f,
      allowed_tools: f.allowed_tools.includes(toolId)
        ? f.allowed_tools.filter(t => t !== toolId)
        : [...f.allowed_tools, toolId],
    }));
  };

  const selectAllTools = () => setForm(f => ({ ...f, allowed_tools: ALL_TOOLS.map(t => t.id) }));
  const clearAllTools = () => setForm(f => ({ ...f, allowed_tools: [] }));

  const handleCreate = async () => {
    if (!form.username || !form.email || !form.password || !form.role_type) {
      showToast("All fields are required", "error"); return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { showToast("User created successfully"); closeModal(); fetchUsers(); }
    else { const data = await res.json(); showToast(data?.error?.message || "Failed to create user", "error"); }
  };

  const handleEdit = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username,
        email: form.email,
        role_type: form.role_type,
        allowed_tools: form.allowed_tools,
      }),
    });
    setSaving(false);
    if (res.ok) { showToast("User updated"); closeModal(); fetchUsers(); }
    else { showToast("Failed to update user", "error"); }
  };

  const handleToggleBlock = async (user) => {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: !user.blocked }),
    });
    if (res.ok) { showToast(user.blocked ? "User enabled" : "User disabled"); fetchUsers(); }
    else { showToast("Failed to update user", "error"); }
  };

  const handleDelete = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/users/${selectedUser.id}`, { method: "DELETE" });
    setSaving(false);
    if (res.ok) { showToast("User deleted"); closeModal(); fetchUsers(); }
    else { showToast("Failed to delete user", "error"); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
    setSaving(true);
    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setSaving(false);
    if (res.ok) { showToast("Password reset successfully"); closeModal(); }
    else { showToast("Failed to reset password", "error"); }
  };

  const isDark = theme === "dark";
  const inputStyle = {
    width: "100%", padding: "9px 12px",
    background: "var(--bg3)", border: "0.5px solid var(--border2)",
    borderRadius: "8px", fontSize: "13px",
    color: "var(--text)", fontFamily: "var(--font-dm)",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: "11px", fontWeight: 600, color: "var(--text3)",
    textTransform: "uppercase", letterSpacing: "0.5px",
    marginBottom: "6px", display: "block",
  };
  const btnPrimary = {
    padding: "8px 18px", borderRadius: "8px",
    background: "var(--accent)", border: "none",
    color: "var(--accent-text)", fontSize: "13px",
    fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-dm)",
  };
  const btnGhost = {
    padding: "8px 18px", borderRadius: "8px",
    background: "transparent", border: "0.5px solid var(--border2)",
    color: "var(--text2)", fontSize: "13px",
    cursor: "pointer", fontFamily: "var(--font-dm)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-dm)" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 1000,
          padding: "12px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 500,
          background: toast.type === "error" ? "rgba(163,45,45,0.95)" : "rgba(29,158,117,0.95)",
          color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Top bar */}
      <div style={{
        borderBottom: "0.5px solid var(--border)", padding: "0 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "56px", background: "var(--bg2)",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text3)", fontSize: "13px", cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Dashboard
            </div>
          </Link>
          <span style={{ color: "var(--border2)" }}>·</span>
          <span style={{ fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: 700, letterSpacing: "-0.3px" }}>
            Admin Panel
          </span>
          <span style={{
            fontSize: "10px", color: "#e57373",
            background: "rgba(229,115,115,0.1)", border: "0.5px solid rgba(229,115,115,0.25)",
            padding: "2px 8px", borderRadius: "10px",
            textTransform: "uppercase", letterSpacing: "0.5px"
          }}>
            Admin Only
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={toggleTheme} style={{
            background: "var(--bg3)", border: "0.5px solid var(--border2)",
            borderRadius: "8px", padding: "7px 12px", fontSize: "12px",
            color: "var(--text2)", cursor: "pointer", fontFamily: "var(--font-dm)",
            display: "flex", alignItems: "center", gap: "6px"
          }}>
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <span style={{ fontSize: "13px", color: "var(--text3)" }}>
            {session?.user?.name || session?.user?.email}
          </span>
        </div>
      </div>

      {/* Main */}
      <div style={{ padding: "32px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "4px" }}>
              User Management
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text3)" }}>
              {users.length} {users.length === 1 ? "user" : "users"} registered
            </p>
          </div>
          <button onClick={openCreate} style={btnPrimary}>+ New User</button>
        </div>

        {/* Table */}
        <div style={{ background: "var(--bg2)", border: "0.5px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 2fr 1fr 3fr 1fr 1fr",
            padding: "10px 20px", borderBottom: "0.5px solid var(--border)",
            fontSize: "10px", fontWeight: 600, color: "var(--text3)",
            textTransform: "uppercase", letterSpacing: "0.8px"
          }}>
            <span>User</span><span>Email</span><span>Role</span>
            <span>Tools Access</span><span>Status</span><span>Actions</span>
          </div>

          {loading ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--text3)", fontSize: "13px" }}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--text3)", fontSize: "13px" }}>No users found</div>
          ) : (
            users.map((user, i) => {
              const roleInfo = ROLE_COLORS[user.role_type] || ROLE_COLORS.investigator;
              const toolCount = (user.allowed_tools || []).length;
              const isCurrentUser = Number(session?.user?.id) === Number(user.id);
              return (
                <div key={user.id} style={{
                  display: "grid", gridTemplateColumns: "2fr 2fr 1fr 3fr 1fr 1fr",
                  padding: "14px 20px", alignItems: "center",
                  borderBottom: i < users.length - 1 ? "0.5px solid var(--border)" : "none",
                  opacity: user.blocked ? 0.5 : 1, transition: "opacity 0.15s"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "30px", height: "30px", borderRadius: "50%",
                      background: roleInfo.bg, border: `0.5px solid ${roleInfo.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 700, color: roleInfo.color, flexShrink: 0
                    }}>
                      {(user.username || "?")[0].toUpperCase()}
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
                      {user.username}
                      {isCurrentUser && <span style={{ fontSize: "10px", color: "var(--text3)", marginLeft: "6px" }}>(you)</span>}
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text2)" }}>{user.email}</div>

                  <div>
                    <span style={{
                      fontSize: "10px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px",
                      textTransform: "uppercase", letterSpacing: "0.5px",
                      color: roleInfo.color, background: roleInfo.bg, border: `0.5px solid ${roleInfo.border}`
                    }}>{user.role_type || "investigator"}</span>
                  </div>

                  <div style={{ fontSize: "12px", color: "var(--text2)" }}>
                    {user.role_type === "admin" ? (
                      <span style={{ color: "#10b981", fontSize: "11px" }}>All tools</span>
                    ) : toolCount === 0 ? (
                      <span style={{ color: "var(--text3)", fontSize: "11px" }}>No tools assigned</span>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {(user.allowed_tools || []).slice(0, 4).map(t => (
                          <span key={t} style={{
                            fontSize: "10px", padding: "2px 6px", borderRadius: "4px",
                            background: "var(--bg3)", border: "0.5px solid var(--border)", color: "var(--text3)"
                          }}>{t}</span>
                        ))}
                        {toolCount > 4 && <span style={{ fontSize: "10px", color: "var(--text3)", padding: "2px 4px" }}>+{toolCount - 4} more</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <span style={{
                      fontSize: "10px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px",
                      textTransform: "uppercase", letterSpacing: "0.5px",
                      color: user.blocked ? "#e57373" : "#10b981",
                      background: user.blocked ? "rgba(229,115,115,0.1)" : "rgba(16,185,129,0.1)",
                      border: user.blocked ? "0.5px solid rgba(229,115,115,0.25)" : "0.5px solid rgba(16,185,129,0.25)"
                    }}>{user.blocked ? "Disabled" : "Active"}</span>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => openEdit(user)} title="Edit" style={{ background: "var(--bg3)", border: "0.5px solid var(--border)", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", fontSize: "12px", color: "var(--text2)" }}>✏️</button>
                    <button onClick={() => openReset(user)} title="Reset Password" style={{ background: "var(--bg3)", border: "0.5px solid var(--border)", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", fontSize: "12px", color: "var(--text2)" }}>🔑</button>
                    {!isCurrentUser && (
                      <>
                        <button onClick={() => handleToggleBlock(user)} title={user.blocked ? "Enable" : "Disable"} style={{ background: "var(--bg3)", border: "0.5px solid var(--border)", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", fontSize: "12px", color: "var(--text2)" }}>{user.blocked ? "✅" : "🚫"}</button>
                        <button onClick={() => openDelete(user)} title="Delete" style={{ background: "rgba(163,45,45,0.08)", border: "0.5px solid rgba(163,45,45,0.2)", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", fontSize: "12px", color: "#e57373" }}>🗑️</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODALS */}
      {modal && (
        <div onClick={closeModal} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg2)", border: "0.5px solid var(--border)", borderRadius: "14px", padding: "28px", width: "100%", maxWidth: modal === "edit" || modal === "create" ? "560px" : "400px", maxHeight: "90vh", overflowY: "auto" }}>

            {(modal === "create" || modal === "edit") && (
              <>
                <div style={{ fontFamily: "var(--font-syne)", fontSize: "17px", fontWeight: 700, marginBottom: "22px" }}>
                  {modal === "create" ? "Create New User" : `Edit — ${selectedUser?.username}`}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Username</label>
                    <input style={inputStyle} value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="username" />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@example.com" />
                  </div>
                  {modal === "create" && (
                    <div>
                      <label style={labelStyle}>Password</label>
                      <input style={inputStyle} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" />
                    </div>
                  )}
                  <div>
                    <label style={labelStyle}>Role</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {["admin", "investigator", "corporate"].map(r => {
                        const rc = ROLE_COLORS[r];
                        const selected = form.role_type === r;
                        return (
                          <button key={r} onClick={() => setForm(f => ({ ...f, role_type: r }))} style={{
                            flex: 1, padding: "8px", borderRadius: "8px",
                            border: `0.5px solid ${selected ? rc.border : "var(--border2)"}`,
                            background: selected ? rc.bg : "transparent",
                            color: selected ? rc.color : "var(--text3)",
                            fontSize: "12px", fontWeight: 600, cursor: "pointer",
                            textTransform: "capitalize", fontFamily: "var(--font-dm)"
                          }}>{r}</button>
                        );
                      })}
                    </div>
                  </div>

                  {form.role_type !== "admin" && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <label style={{ ...labelStyle, marginBottom: 0 }}>Tool Access ({form.allowed_tools.length}/{ALL_TOOLS.length})</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={selectAllTools} style={{ ...btnGhost, fontSize: "11px", padding: "4px 10px" }}>All</button>
                          <button onClick={clearAllTools} style={{ ...btnGhost, fontSize: "11px", padding: "4px 10px" }}>None</button>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", maxHeight: "220px", overflowY: "auto", padding: "2px" }}>
                        {ALL_TOOLS.map(tool => {
                          const checked = form.allowed_tools.includes(tool.id);
                          return (
                            <div key={tool.id} onClick={() => toggleTool(tool.id)} style={{
                              display: "flex", alignItems: "center", gap: "8px",
                              padding: "7px 10px", borderRadius: "7px", cursor: "pointer",
                              border: `0.5px solid ${checked ? "var(--accent)" : "var(--border)"}`,
                              background: checked ? "var(--active-bg)" : "var(--bg3)",
                              transition: "all 0.12s"
                            }}>
                              <div style={{
                                width: "14px", height: "14px", borderRadius: "3px", flexShrink: 0,
                                border: `1.5px solid ${checked ? "var(--accent)" : "var(--border2)"}`,
                                background: checked ? "var(--accent)" : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center"
                              }}>
                                {checked && <span style={{ color: "var(--accent-text)", fontSize: "9px", lineHeight: 1 }}>✓</span>}
                              </div>
                              <span style={{ fontSize: "11px", color: checked ? "var(--text)" : "var(--text2)" }}>{tool.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {form.role_type === "admin" && (
                    <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(229,115,115,0.06)", border: "0.5px solid rgba(229,115,115,0.2)", fontSize: "12px", color: "var(--text3)" }}>
                      Admin users have access to all tools automatically.
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                  <button onClick={closeModal} style={btnGhost}>Cancel</button>
                  <button onClick={modal === "create" ? handleCreate : handleEdit} style={btnPrimary} disabled={saving}>
                    {saving ? "Saving..." : modal === "create" ? "Create User" : "Save Changes"}
                  </button>
                </div>
              </>
            )}

            {modal === "reset" && (
              <>
                <div style={{ fontFamily: "var(--font-syne)", fontSize: "17px", fontWeight: 700, marginBottom: "8px" }}>Reset Password</div>
                <div style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "20px" }}>
                  Setting new password for <strong style={{ color: "var(--text)" }}>{selectedUser?.username}</strong>
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input style={inputStyle} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                  <button onClick={closeModal} style={btnGhost}>Cancel</button>
                  <button onClick={handleResetPassword} style={btnPrimary} disabled={saving}>
                    {saving ? "Saving..." : "Reset Password"}
                  </button>
                </div>
              </>
            )}

            {modal === "delete" && (
              <>
                <div style={{ fontFamily: "var(--font-syne)", fontSize: "17px", fontWeight: 700, marginBottom: "8px" }}>Delete User</div>
                <div style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "24px", lineHeight: 1.6 }}>
                  Are you sure you want to delete <strong style={{ color: "var(--text)" }}>{selectedUser?.username}</strong>? This cannot be undone.
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button onClick={closeModal} style={btnGhost}>Cancel</button>
                  <button onClick={handleDelete} disabled={saving} style={{ ...btnPrimary, background: "#A32D2D", border: "none" }}>
                    {saving ? "Deleting..." : "Delete User"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}