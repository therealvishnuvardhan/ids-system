import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    background: "#1a1a1a",
    color: "#ffffff",
    fontFamily: "system-ui, -apple-system, sans-serif",
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "auto"
  },
  navbar: {
    background: "#2d2d2d",
    padding: "15px 30px",
    borderBottom: "1px solid #374151",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky" as const,
    top: 0,
    zIndex: 100
  },
  navBrand: {
    fontSize: "1.2rem",
    fontWeight: "bold" as const,
    color: "#60a5fa",
    cursor: "pointer"
  },
  navLinks: {
    display: "flex",
    gap: "20px"
  },
  navLink: {
    color: "#9ca3af",
    textDecoration: "none",
    cursor: "pointer",
    padding: "5px 10px"
  },
  activeNavLink: {
    color: "#60a5fa",
    textDecoration: "none",
    cursor: "pointer",
    padding: "5px 10px",
    borderBottom: "2px solid #60a5fa"
  },
  contentWrapper: {
    display: "flex",
    justifyContent: "center",
    padding: "20px"
  },
  content: {
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
    padding: "40px 20px"
  },
  welcomeCard: {
    background: "#2d2d2d",
    padding: "30px",
    borderRadius: "10px",
    marginBottom: "30px",
    border: "1px solid #374151"
  },
  title: {
    fontSize: "2rem",
    marginBottom: "10px",
    color: "#60a5fa"
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: "1.1rem"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px"
  },
  statCard: {
    background: "#2d2d2d",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #374151"
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: "0.9rem",
    marginBottom: "10px"
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold" as const,
    color: "#60a5fa"
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px"
  },
  actionButton: {
    background: "#2d2d2d",
    border: "1px solid #374151",
    padding: "20px",
    borderRadius: "8px",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold" as const,
    transition: "all 0.3s"
  }
}

function Dashboard() {
  const [username, setUsername] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    const user = localStorage.getItem("username")
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    
    if (!isLoggedIn) {
      navigate("/login")
      return
    }
    
    setUsername(user || "User")
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    navigate("/login")
  }

  const stats = [
    { label: "Files Analyzed", value: "24" },
    { label: "Threats Detected", value: "156" },
    { label: "Accuracy Rate", value: "94%" },
    { label: "Active Alerts", value: "3" }
  ]

  const actions = [
    { name: "Upload CSV", path: "/upload", color: "#3b82f6" },
    { name: "View Alerts", path: "/alerts", color: "#ef4444" },
    { name: "Reports", path: "/reports", color: "#10b981" },
    { name: "Results", path: "/results", color: "#8b5cf6" }
  ]

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navBrand} onClick={() => navigate("/dashboard")}>
          IDS DASHBOARD
        </div>
        <div style={styles.navLinks}>
          <span style={styles.activeNavLink}>Dashboard</span>
          <span style={styles.navLink} onClick={() => navigate("/upload")}>Upload</span>
          <span style={styles.navLink} onClick={() => navigate("/alerts")}>Alerts</span>
          <span style={styles.navLink} onClick={() => navigate("/reports")}>Reports</span>
          <span style={styles.navLink} onClick={handleLogout}>Logout</span>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div style={styles.contentWrapper}>
        <div style={styles.content}>
          <div style={styles.welcomeCard}>
            <h1 style={styles.title}>Welcome back, {username}!</h1>
            <p style={styles.subtitle}>
              System Status: Active • {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </p>
          </div>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} style={styles.statCard}>
                <div style={styles.statLabel}>{stat.label}</div>
                <div style={styles.statValue}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <h2 style={{ ...styles.title, fontSize: "1.5rem", marginBottom: "20px" }}>
            Quick Actions
          </h2>
          <div style={styles.actionsGrid}>
            {actions.map((action, index) => (
              <button
                key={index}
                style={{
                  ...styles.actionButton,
                  borderLeft: `4px solid ${action.color}`
                }}
                onClick={() => navigate(action.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#374151"
                  e.currentTarget.style.transform = "translateY(-2px)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#2d2d2d"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                {action.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard