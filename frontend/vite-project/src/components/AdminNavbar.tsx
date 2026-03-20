import { Link, useNavigate } from "react-router-dom"
import { logoutCurrentSession } from "../utils/authUtils"

const styles = {
  nav: { background: "#111827", color: "white", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" as const },
  link: { color: "#d1d5db", marginRight: "12px", textDecoration: "none", fontWeight: 600 },
  brand: { color: "#38bdf8", fontWeight: 700, marginRight: "16px", fontSize: "1.05rem" },
  button: { background: "#ef4444", color: "white", border: "none", borderRadius: "6px", padding: "8px 12px", cursor: "pointer" }
}

function AdminNavbar(){
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutCurrentSession()
    navigate("/login")
  }

  return (
    <nav style={styles.nav}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={styles.brand}>Admin Portal</span>
        <Link style={styles.link} to="/admin">Home</Link>
        <Link style={styles.link} to="/admin/dashboard">Dashboard</Link>
        <Link style={styles.link} to="/admin/config">Config</Link>
        <Link style={styles.link} to="/admin/audit">Audit</Link>
        <Link style={styles.link} to="/admin/sessions">Sessions</Link>
        <Link style={styles.link} to="/admin/performance">Performance</Link>
      </div>
      <button style={styles.button} onClick={handleLogout}>Logout</button>
    </nav>
  )
}

export default AdminNavbar
