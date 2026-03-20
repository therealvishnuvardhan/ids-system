import { useState, useEffect } from "react"
import AdminNavbar from "../components/AdminNavbar"
import { getConfig, saveConfig, addAuditLog } from "../utils/authUtils"

function AdminConfig(){
  const [config, setConfig] = useState(getConfig())

  useEffect(() => {
    setConfig(getConfig())
  }, [])

  const toggleSignup = () => {
    const next = { ...config, allowSignup: !config.allowSignup }
    saveConfig(next)
    addAuditLog({ type: "config_update", user: "admin", details: `allowSignup set to ${next.allowSignup}` })
    setConfig(next)
  }

  return (
    <div>
      <AdminNavbar />
      <div style={{ minHeight: "100vh", padding: "30px", background: "#0b1120", color: "#e2e8f0", display: "flex", justifyContent: "center" as const }}>
        <div style={{ width: "100%", maxWidth: "1000px" }}>
          <h1 style={{ color: "#38bdf8" }}>Admin Config</h1>
          <div style={{ marginTop: "16px", background: "#111827", borderRadius: "10px", padding: "20px", border: "1px solid #334155" }}>
            <div style={{ marginBottom: "10px" }}><strong>Allow Signup:</strong> {config.allowSignup ? "Enabled" : "Disabled"}</div>
            <button style={{ background: "#2563eb", color: "white", border: "none", borderRadius: "6px", padding: "10px 14px", cursor: "pointer" }} onClick={toggleSignup}>Toggle Signup</button>
          </div>
          <div style={{ marginTop: "20px", background: "#111827", borderRadius: "10px", padding: "20px", border: "1px solid #334155" }}>
            <div><strong>Max Users:</strong> {config.maxUsers}</div>
            <p style={{ marginTop: "8px", color: "#94a3b8" }}>This controls user registrations from signup page.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminConfig
