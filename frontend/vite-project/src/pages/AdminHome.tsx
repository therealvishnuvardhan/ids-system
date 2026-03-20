import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminNavbar from "../components/AdminNavbar"

function AdminHome(){
  const navigate = useNavigate()
  useEffect(() => {
    const role = localStorage.getItem("role")
    if (role !== "admin") {
      navigate("/login")
    }
  }, [navigate])

  return (
    <div>
      <AdminNavbar />
      <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", padding: "40px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.3rem", marginBottom: "8px", color: "#38bdf8" }}>Welcome, Admin</h1>
          <p style={{ fontSize: "1rem", color: "#cbd5e1" }}>From here, you can monitor system health, manage users, and access all admin tools.</p>
          <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
            {[
              ["Dashboard", "/admin/dashboard"],
              ["Config", "/admin/config"],
              ["Audit Logs", "/admin/audit"],
              ["Sessions", "/admin/sessions"],
              ["Performance", "/admin/performance"]
            ].map(([label, path]) => (
              <button key={label as string} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0", cursor: "pointer" }} onClick={() => navigate(path as string)}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHome
