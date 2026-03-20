import AdminNavbar from "../components/AdminNavbar"
import { getMetrics } from "../utils/authUtils"

function AdminPerformance(){
  const metrics = getMetrics()
  const dayData = [
    { day: "Mon", value: metrics.totalLogins - 3 },
    { day: "Tue", value: metrics.totalLogins - 1 },
    { day: "Wed", value: metrics.totalLogins + 2 },
    { day: "Thu", value: metrics.totalLogins + 5 },
    { day: "Fri", value: metrics.totalLogins + 3 }
  ]

  return (
    <div>
      <AdminNavbar />
      <div style={{ minHeight: "100vh", padding: "30px", background: "#0b1120", color: "#e2e8f0", display: "flex", justifyContent: "center" as const }}>
        <div style={{ width: "100%", maxWidth: "1000px" }}>
          <h1 style={{ color: "#38bdf8" }}>Site Performance</h1>
          <div style={{ marginTop: "16px", background: "#111827", borderRadius: "10px", padding: "16px", border: "1px solid #334155" }}>
            <div style={{ marginBottom: "14px" }}><strong>Active Users Today:</strong> {metrics.activeUsers}</div>
            <div style={{ marginBottom: "14px" }}><strong>Most Active Day:</strong> Friday</div>
            <div style={{ marginBottom: "14px" }}><strong>Performance Health:</strong> Good</div>
          </div>

          <div style={{ background: "#111827", borderRadius: "10px", border: "1px solid #334155", padding: "16px", marginTop: "16px" }}>
          <h3 style={{ marginBottom: "12px", color: "#cbd5e1" }}>Daily Logins (sample)</h3>
          {dayData.map((entry) => (
            <div key={entry.day} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ width: "50px", color: "#f8fafc" }}>{entry.day}</div>
              <div style={{ flex: 1, marginRight: "10px", background: "#1f2937", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, entry.value * 4)}%`, background: "#22c55e", height: "12px" }} />
              </div>
              <div style={{ width: "50px", color: "#cbd5e1" }}>{entry.value}</div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPerformance
