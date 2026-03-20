import AdminNavbar from "../components/AdminNavbar"
import { getAuditLogs } from "../utils/authUtils"

function AdminAudit(){
  const logs = getAuditLogs().slice(0, 50)

  return (
    <div>
      <AdminNavbar />
      <div style={{ minHeight: "100vh", padding: "30px", background: "#0b1120", color: "#e2e8f0", display: "flex", justifyContent: "center" as const }}>
        <div style={{ width: "100%", maxWidth: "1000px" }}>
          <h1 style={{ color: "#38bdf8" }}>Audit Logs</h1>
          <div style={{ marginTop: "12px", background: "#111827", borderRadius: "10px", padding: "16px", border: "1px solid #334155", maxHeight: "70vh", overflowY: "auto" }}>
            {logs.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No logs yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ marginBottom: "12px", borderBottom: "1px solid #1f2937", paddingBottom: "8px" }}>
                  <div style={{ color: "#f8fafc" }}><strong>{log.type.toUpperCase()}</strong> - {log.user}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{new Date(log.timestamp).toLocaleString()}</div>
                  <div style={{ color: "#cbd5e1", marginTop: "4px" }}>{log.details}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAudit
