import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import AdminPageLayout from "../components/AdminPageLayout"
import { AdminCard, AdminButton } from "../components/AdminPageStyles"
import { getConfig, saveConfig, addAuditLog } from "../utils/authUtils"
import { adminTheme } from "../adminTheme"

function AdminConfig() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(getConfig())

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") {
      navigate("/login")
    }
    setConfig(getConfig())
  }, [navigate])

  const toggleSignup = () => {
    const next = { ...config, allowSignup: !config.allowSignup }
    saveConfig(next)
    addAuditLog({
      type: "config_update",
      user: "admin",
      details: `allowSignup set to ${next.allowSignup}`,
    })
    setConfig(next)
  }

  const toggleLogin = () => {
    const next = { ...config, allowLogin: !config.allowLogin }
    saveConfig(next)
    addAuditLog({
      type: "config_update",
      user: "admin",
      details: `allowLogin set to ${next.allowLogin}`,
    })
    setConfig(next)
  }

  return (
    <>
      <AdminSidebar />
      <AdminPageLayout
        title="Admin Control Panel"
        description="Configure system settings and preferences."
      >
        <AdminCard>
          <h2 style={{ margin: "0 0 12px", color: adminTheme.primary, fontFamily: adminTheme.fontDisplay }}>
            Allow Signup
          </h2>
          <div style={{ marginBottom: "12px", color: adminTheme.text }}>
            <strong>Status:</strong> {config.allowSignup ? "Enabled" : "Disabled"}
          </div>
          <AdminButton onClick={toggleSignup}>Toggle Signup</AdminButton>
        </AdminCard>

        <AdminCard>
          <h2 style={{ margin: "0 0 12px", color: adminTheme.primary, fontFamily: adminTheme.fontDisplay }}>
            Allow Login
          </h2>
          <div style={{ marginBottom: "12px", color: adminTheme.text }}>
            <strong>Status:</strong> {config.allowLogin ? "Enabled" : "Disabled"}
          </div>
          <AdminButton onClick={toggleLogin}>Toggle Login</AdminButton>
        </AdminCard>

        <AdminCard>
          <h2 style={{ margin: "0 0 12px", color: adminTheme.primary, fontFamily: adminTheme.fontDisplay }}>
            Max Users
          </h2>
          <div style={{ color: adminTheme.text, marginBottom: "8px" }}>
            <strong>Limit:</strong> {config.maxUsers}
          </div>
          <p style={{ margin: 0, color: adminTheme.textMuted, fontSize: "0.9rem" }}>
            This controls user registrations from the signup page.
          </p>
        </AdminCard>
      </AdminPageLayout>
    </>
  )
}

export default AdminConfig
