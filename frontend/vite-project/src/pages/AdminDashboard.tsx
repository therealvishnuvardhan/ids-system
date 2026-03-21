import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import AdminPageLayout from "../components/AdminPageLayout"
import {
  AdminCard,
  AdminLabel,
  AdminValue,
  AdminTable,
  AdminTh,
  AdminTd,
  AdminButton,
  AdminButtonDanger,
} from "../components/AdminPageStyles"
import {
  getMetrics,
  getUsers,
  removeUser,
  addAuditLog,
  getAuditLogs,
  getConfig,
  saveConfig,
} from "../utils/authUtils"
import type { AppConfig, AuditEvent } from "../utils/authUtils"
import styled from "styled-components"
import { adminTheme } from "../adminTheme"

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`

const StatCard = styled(AdminCard)`
  padding: 1.25rem;
  &:hover {
    border-color: rgba(124, 58, 237, 0.5);
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.15);
  }
`

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const Grid1 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`

const LogFeed = styled.div`
  max-height: 220px;
  overflow-y: auto;
  font-size: 0.9rem;
`

const LogEntry = styled.div`
  margin-bottom: 0.75rem;
  border-bottom: 1px solid rgba(124, 58, 237, 0.2);
  padding-bottom: 0.5rem;
  color: ${adminTheme.text};
`

function AdminDashboard() {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState<Metrics>(getMetrics())
  const [users, setUsers] = useState<AppUser[]>(
    getUsers().map((u) => ({ username: u.username, role: u.role }))
  )
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(getAuditLogs())
  const [config, setConfig] = useState<AppConfig>(getConfig())

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") {
      navigate("/login")
      return
    }
    const timer = setInterval(() => {
      setMetrics(getMetrics())
      setUsers(getUsers().map((u) => ({ username: u.username, role: u.role })))
      setAuditLogs(getAuditLogs())
      setConfig(getConfig())
    }, 800)
    return () => clearInterval(timer)
  }, [navigate])

  const handleConfigToggle = () => {
    const next = { ...config, allowSignup: !config.allowSignup }
    saveConfig(next)
    setConfig(next)
    addAuditLog({
      type: "config_update",
      user: "admin",
      details: `Config changed: allowSignup to ${next.allowSignup}`,
    })
  }

  const handleRemove = (username: string) => {
    if (!window.confirm(`Remove user ${username}?`)) return
    removeUser(username)
    setUsers(getUsers().map((u) => ({ username: u.username, role: u.role })))
    setMetrics(getMetrics())
  }

  return (
    <>
      <AdminSidebar />
      <AdminPageLayout
        title="Admin Control Panel"
        description="Monitor and manage your intrusion detection system."
      >
        <StatsGrid>
          <StatCard>
            <AdminLabel>Total Users</AdminLabel>
            <AdminValue>{metrics.totalUsers}</AdminValue>
          </StatCard>
          <StatCard>
            <AdminLabel>Active Users</AdminLabel>
            <AdminValue>{metrics.activeUsers}</AdminValue>
          </StatCard>
          <StatCard>
            <AdminLabel>Total Logins</AdminLabel>
            <AdminValue>{metrics.totalLogins}</AdminValue>
          </StatCard>
          <StatCard>
            <AdminLabel>Removed Users</AdminLabel>
            <AdminValue>{metrics.removedUsers}</AdminValue>
          </StatCard>
          <StatCard>
            <AdminLabel>Sessions Opened</AdminLabel>
            <AdminValue>{metrics.totalSessions}</AdminValue>
          </StatCard>
        </StatsGrid>

        <Grid2>
          <AdminCard>
            <h2 style={{ margin: 0, color: adminTheme.primary, fontFamily: adminTheme.fontDisplay }}>
              User Management
            </h2>
            <p style={{ color: adminTheme.textMuted, margin: "8px 0 12px", fontSize: "0.9rem" }}>
              Remove users and inspect details.
            </p>
            <AdminTable>
              <thead>
                <tr>
                  <AdminTh>Username</AdminTh>
                  <AdminTh>Role</AdminTh>
                  <AdminTh>Action</AdminTh>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.username}>
                    <AdminTd>{user.username}</AdminTd>
                    <AdminTd>{user.role}</AdminTd>
                    <AdminTd>
                      {user.role === "admin" ? (
                        <span style={{ color: adminTheme.textMuted }}>Cannot remove admin</span>
                      ) : (
                        <AdminButtonDanger onClick={() => handleRemove(user.username)}>
                          Remove
                        </AdminButtonDanger>
                      )}
                    </AdminTd>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </AdminCard>

          <AdminCard>
            <h2 style={{ margin: 0, color: adminTheme.primary, fontFamily: adminTheme.fontDisplay }}>
              Admin Config
            </h2>
            <p style={{ color: adminTheme.textMuted, margin: "8px 0 12px", fontSize: "0.9rem" }}>
              Control signup and limits.
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
              <span style={{ color: adminTheme.text }}>Allow signup</span>
              <AdminButton
                style={{
                  background: config.allowSignup ? adminTheme.success : adminTheme.textMuted,
                  borderColor: config.allowSignup ? adminTheme.success : adminTheme.textMuted,
                  color: "#000",
                }}
                onClick={handleConfigToggle}
              >
                {config.allowSignup ? "ON" : "OFF"}
              </AdminButton>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: adminTheme.text }}>Max users</span>
              <span style={{ color: adminTheme.primary }}>{config.maxUsers}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: adminTheme.text }}>Current users</span>
              <span style={{ color: adminTheme.primary }}>{metrics.totalUsers}</span>
            </div>
            <div style={{ marginTop: "12px", fontSize: "0.9rem", color: adminTheme.textMuted }}>
              Signup is currently <strong>{config.allowSignup ? "enabled" : "disabled"}</strong>.
            </div>
          </AdminCard>
        </Grid2>

        <Grid1>
          <AdminCard>
            <h2 style={{ margin: 0, color: adminTheme.primary, fontFamily: adminTheme.fontDisplay }}>
              Session Activity Feed
            </h2>
            <LogFeed>
              {auditLogs
                .filter((log) => log.type === "login" || log.type === "logout")
                .slice(0, 10)
                .map((log) => (
                  <LogEntry key={log.id}>
                    <div style={{ color: adminTheme.secondary, fontWeight: 600 }}>{log.user}</div>
                    <div style={{ color: adminTheme.textMuted, fontSize: "0.8rem" }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    <div style={{ color: adminTheme.text, fontSize: "0.85rem" }}>{log.details}</div>
                  </LogEntry>
                ))}
            </LogFeed>
          </AdminCard>

          <AdminCard>
            <h2 style={{ margin: 0, color: adminTheme.primary, fontFamily: adminTheme.fontDisplay }}>
              Audit Logs
            </h2>
            <LogFeed>
              {auditLogs.slice(0, 10).map((log) => (
                <LogEntry key={log.id}>
                  <div style={{ color: adminTheme.text }}>
                    <strong>{log.type.toUpperCase()}</strong> - {log.user}
                  </div>
                  <div style={{ color: adminTheme.textMuted, fontSize: "0.8rem" }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                  <div style={{ color: adminTheme.text, fontSize: "0.85rem" }}>{log.details}</div>
                </LogEntry>
              ))}
            </LogFeed>
          </AdminCard>
        </Grid1>
      </AdminPageLayout>
    </>
  )
}

export default AdminDashboard
