import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import AdminPageLayout from "../components/AdminPageLayout"
import { AdminCard } from "../components/AdminPageStyles"
import { getAuditLogs } from "../utils/authUtils"
import { adminTheme } from "../adminTheme"
import styled from "styled-components"

const LogContainer = styled.div`
  max-height: 70vh;
  overflow-y: auto;
`

const LogEntry = styled.div`
  margin-bottom: 1rem;
  border-bottom: 1px solid ${adminTheme.border};
  padding-bottom: 0.75rem;
`

function AdminAudit() {
  const navigate = useNavigate()
  const logs = getAuditLogs().slice(0, 50)

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") {
      navigate("/login")
    }
  }, [navigate])

  return (
    <>
      <AdminSidebar />
      <AdminPageLayout
        title="Admin Control Panel"
        description="Review system audit logs and activities."
      >
        <AdminCard>
          <h2 style={{ margin: "0 0 16px", color: adminTheme.primary, fontFamily: adminTheme.fontDisplay }}>
            Audit Logs
          </h2>
          <LogContainer>
            {logs.length === 0 ? (
              <p style={{ color: adminTheme.textMuted }}>No logs yet.</p>
            ) : (
              logs.map((log) => (
                <LogEntry key={log.id}>
                  <div style={{ color: adminTheme.text, fontWeight: 600 }}>
                    <strong>{log.type.toUpperCase()}</strong> - {log.user}
                  </div>
                  <div style={{ color: adminTheme.textMuted, fontSize: "0.85rem" }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                  <div style={{ color: adminTheme.text, marginTop: "4px", fontSize: "0.9rem" }}>
                    {log.details}
                  </div>
                </LogEntry>
              ))
            )}
          </LogContainer>
        </AdminCard>
      </AdminPageLayout>
    </>
  )
}

export default AdminAudit
