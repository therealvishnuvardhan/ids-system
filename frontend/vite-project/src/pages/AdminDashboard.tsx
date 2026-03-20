import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminNavbar from "../components/AdminNavbar"
import { getMetrics, getUsers, removeUser, logoutCurrentSession, addAuditLog, getAuditLogs, getConfig, saveConfig } from "../utils/authUtils"
import type { AppConfig, AuditEvent } from "../utils/authUtils"

type Metrics = {
  totalLogins: number
  activeUsers: number
  totalUsers: number
  removedUsers: number
  totalSessions: number
}

type AppUser = {
  username: string
  role: "user" | "admin"
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    background: "#111827",
    color: "#fff",
    fontFamily: "system-ui, -apple-system, sans-serif",
    position: "relative" as const,
    overflow: "auto",
    padding: "20px 0 40px"
  },
  centerContent: {
    maxWidth: "1100px",
    margin: "0 auto"
  },
  header: {
    background: "#1f2937",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: { fontSize: "1.7rem", color: "#38bdf8" },
  nav: { display: "flex", gap: "12px" },
  navButton: { background: "#2563eb", color: "white", border: "none", borderRadius: "6px", padding: "10px 12px", cursor: "pointer" },
  content: { padding: "24px" },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "20px" },
  card: { background: "#111827", border: "1px solid #374151", borderRadius: "10px", padding: "14px" },
  label: { color: "#9ca3af", fontSize: "0.85rem", marginBottom: "6px" },
  value: { fontSize: "1.5rem", fontWeight: "700", color: "#f8fafc" },
  table: { width: "100%", borderCollapse: "collapse" as const, marginTop: "10px", fontSize: "0.95rem" },
  th: { borderBottom: "1px solid #374151", padding: "10px", textAlign: "left" as const, color: "#cbd5e1" },
  td: { borderBottom: "1px solid #374151", padding: "10px", color: "#f8fafc" },
  danger: { background: "#ef4444", color: "white", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer" }
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState<Metrics>(getMetrics())
  const [users, setUsers] = useState<AppUser[]>(getUsers().map(u => ({ username: u.username, role: u.role })))
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(getAuditLogs())
  const [config, setConfig] = useState<AppConfig>(getConfig())

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(getMetrics())
      setUsers(getUsers().map(u => ({ username: u.username, role: u.role })))
      setAuditLogs(getAuditLogs())
      setConfig(getConfig())
    }, 800)

    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    logoutCurrentSession()
    navigate("/login")
  }

  const handleConfigToggle = () => {
    const next = { ...config, allowSignup: !config.allowSignup }
    saveConfig(next)
    setConfig(next)
    addAuditLog({ type: "config_update", user: "admin", details: `Config changed: allowSignup to ${next.allowSignup}` })
  }

  const handleRemove = (username: string) => {
    if (!window.confirm(`Remove user ${username}?`)) return
    removeUser(username)
    setUsers(getUsers().map(u => ({ username: u.username, role: u.role })))
    setMetrics(getMetrics())
  }

  return (
    <div>
      <AdminNavbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Admin Portal</div>
            <div style={{ color: "#d1d5db" }}>Real-time user metrics and access control</div>
          </div>
          <div style={styles.nav}>
            <button style={styles.navButton} onClick={() => navigate("/dashboard")}>User View</button>
            <button style={styles.navButton} onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div style={styles.centerContent}>
          <div style={styles.content}>
            <div style={styles.cards}>
          <div style={styles.card}><div style={styles.label}>Total Users</div><div style={styles.value}>{metrics.totalUsers}</div></div>
          <div style={styles.card}><div style={styles.label}>Active Users</div><div style={styles.value}>{metrics.activeUsers}</div></div>
          <div style={styles.card}><div style={styles.label}>Total Logins</div><div style={styles.value}>{metrics.totalLogins}</div></div>
          <div style={styles.card}><div style={styles.label}>Removed Users</div><div style={styles.value}>{metrics.removedUsers}</div></div>
          <div style={styles.card}><div style={styles.label}>Sessions Opened</div><div style={styles.value}>{metrics.totalSessions}</div></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px", marginTop: "20px" }}>
          <div style={styles.card}>
            <h2 style={{ margin: 0, color: "#e2e8f0" }}>User Management</h2>
            <p style={{ color: "#9ca3af", margin: "8px 0 12px" }}>Remove users and inspect details.</p>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Username</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.username}>
                    <td style={styles.td}>{user.username}</td>
                    <td style={styles.td}>{user.role}</td>
                    <td style={styles.td}>
                      {user.role === "admin" ? (
                        <span style={{ color: "#9ca3af" }}>Cannot remove admin</span>
                      ) : (
                        <button style={styles.danger} onClick={() => handleRemove(user.username)}>Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.card}>
            <h2 style={{ margin: 0, color: "#e2e8f0" }}>Admin Config</h2>
            <p style={{ color: "#9ca3af", margin: "8px 0 12px" }}>Control signup and limits.</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#e2e8f0" }}>Allow signup</span>
              <button style={{ ...styles.navButton, background: config.allowSignup ? "#10b981" : "#6b7280" }} onClick={handleConfigToggle}>{config.allowSignup ? "ON" : "OFF"}</button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#e2e8f0" }}>Max users</span>
              <span style={{ color: "#f8fafc" }}>{config.maxUsers}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#e2e8f0" }}>Current users</span>
              <span style={{ color: "#f8fafc" }}>{metrics.totalUsers}</span>
            </div>
            <div style={{ marginTop: "10px", fontSize: "0.9rem", color: "#9ca3af" }}>
              Signup is currently <strong>{config.allowSignup ? "enabled" : "disabled"}</strong>.
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "20px" }}>
          <div style={styles.card}>
            <h2 style={{ margin: 0, color: "#e2e8f0" }}>Session Activity Feed</h2>
            <div style={{ marginTop: "10px", maxHeight: "220px", overflowY: "auto", background: "#111827", border: "1px solid #374151", borderRadius: "8px", padding: "10px" }}>
              {auditLogs.filter((log) => log.type === "login" || log.type === "logout").slice(0, 10).map((log) => (
                <div key={log.id} style={{ marginBottom: "8px", borderBottom: "1px solid #1f2937", paddingBottom: "6px" }}>
                  <div style={{ color: "#60a5fa", fontWeight: 600 }}>{log.user}</div>
                  <div style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>{new Date(log.timestamp).toLocaleString()}</div>
                  <div style={{ color: "#d1d5db", fontSize: "0.9rem" }}>{log.details}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={{ margin: 0, color: "#e2e8f0" }}>Audit Logs</h2>
            <div style={{ marginTop: "10px", maxHeight: "220px", overflowY: "auto", background: "#111827", border: "1px solid #374151", borderRadius: "8px", padding: "10px" }}>
              {auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} style={{ marginBottom: "8px", borderBottom: "1px solid #1f2937", paddingBottom: "6px" }}>
                  <div style={{ color: "#f8fafc", fontSize: "0.9rem" }}><strong>{log.type.toUpperCase()}</strong> - {log.user}</div>
                  <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>{new Date(log.timestamp).toLocaleString()}</div>
                  <div style={{ color: "#d1d5db", fontSize: "0.85rem" }}>{log.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard