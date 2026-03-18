import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"

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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap" as const,
    gap: "15px"
  },
  title: {
    fontSize: "2rem",
    color: "#60a5fa"
  },
  alertBadge: {
    background: "#ef4444",
    color: "white",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "bold" as const
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
    fontWeight: "bold" as const
  },
  filters: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap" as const
  },
  filterButton: {
    padding: "8px 16px",
    background: "#2d2d2d",
    border: "1px solid #374151",
    borderRadius: "6px",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "0.9rem"
  },
  activeFilter: {
    padding: "8px 16px",
    background: "#3b82f6",
    border: "1px solid #3b82f6",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    fontSize: "0.9rem"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginTop: "20px",
    background: "#2d2d2d",
    borderRadius: "10px",
    overflow: "hidden"
  },
  th: {
    background: "#374151",
    padding: "15px",
    textAlign: "left" as const,
    color: "#60a5fa",
    borderBottom: "2px solid #4b5563"
  },
  td: {
    padding: "15px",
    borderBottom: "1px solid #374151",
    color: "#d1d5db"
  },
  riskBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "bold" as const,
    display: "inline-block"
  },
  severityDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    display: "inline-block",
    marginRight: "8px"
  },
  actionButton: {
    padding: "6px 12px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.85rem",
    cursor: "pointer",
    marginRight: "8px"
  },
  viewButton: {
    padding: "6px 12px",
    background: "#4b5563",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "0.85rem",
    cursor: "pointer"
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center" as const,
    marginTop: "30px",
    gap: "15px"
  },
  button: {
    display: "inline-block",
    padding: "12px 24px",
    background: "#3b82f6",
    color: "white",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "bold" as const,
    border: "none",
    cursor: "pointer"
  },
  secondaryButton: {
    display: "inline-block",
    padding: "12px 24px",
    background: "#4b5563",
    color: "white",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "bold" as const,
    border: "none",
    cursor: "pointer"
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "60px 20px",
    background: "#2d2d2d",
    borderRadius: "10px",
    border: "1px solid #374151"
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "20px",
    opacity: 0.5
  }
}

function Alerts() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("all")
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    // Simulate fetching alerts
    const mockAlerts = [
      {
        id: 1,
        attack: "neptune",
        category: "DoS",
        risk: "High",
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        source_ip: "192.168.1.105",
        destination_ip: "192.168.1.1",
        protocol: "TCP",
        port: 80,
        status: "active",
        confidence: 98
      },
      {
        id: 2,
        attack: "satan",
        category: "Probe",
        risk: "Medium",
        timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        source_ip: "10.0.0.23",
        destination_ip: "192.168.1.100",
        protocol: "UDP",
        port: 53,
        status: "active",
        confidence: 76
      },
      {
        id: 3,
        attack: "ipsweep",
        category: "Probe",
        risk: "Low",
        timestamp: new Date(Date.now() - 600000).toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        source_ip: "172.16.0.45",
        destination_ip: "192.168.1.50",
        protocol: "ICMP",
        port: 0,
        status: "resolved",
        confidence: 45
      },
      {
        id: 4,
        attack: "guess_passwd",
        category: "Unauthorized Access",
        risk: "High",
        timestamp: new Date(Date.now() - 900000).toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        source_ip: "192.168.1.200",
        destination_ip: "192.168.1.10",
        protocol: "SSH",
        port: 22,
        status: "active",
        confidence: 95
      },
      {
        id: 5,
        attack: "smurf",
        category: "DoS",
        risk: "Medium",
        timestamp: new Date(Date.now() - 1200000).toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        source_ip: "10.0.0.67",
        destination_ip: "192.168.1.1",
        protocol: "ICMP",
        port: 0,
        status: "investigating",
        confidence: 82
      }
    ]
    setAlerts(mockAlerts)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    navigate("/login")
  }

  const getFilteredAlerts = () => {
    if (filter === "all") return alerts
    return alerts.filter(alert => alert.risk.toLowerCase() === filter.toLowerCase())
  }

  const getRiskColor = (risk: string) => {
    switch(risk.toLowerCase()) {
      case "high": return "#ef4444"
      case "medium": return "#f59e0b"
      case "low": return "#10b981"
      default: return "#6b7280"
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case "active": return "#ef4444"
      case "investigating": return "#f59e0b"
      case "resolved": return "#10b981"
      default: return "#6b7280"
    }
  }

  const filteredAlerts = getFilteredAlerts()
  const highRiskCount = alerts.filter(a => a.risk === "High").length
  const mediumRiskCount = alerts.filter(a => a.risk === "Medium").length
  const lowRiskCount = alerts.filter(a => a.risk === "Low").length
  const activeCount = alerts.filter(a => a.status === "active").length

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navBrand} onClick={() => navigate("/dashboard")}>
          IDS DASHBOARD
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLink} onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span style={styles.navLink} onClick={() => navigate("/upload")}>Upload</span>
          <span style={styles.activeNavLink}>Alerts</span>
          <span style={styles.navLink} onClick={() => navigate("/reports")}>Reports</span>
          <span style={styles.navLink} onClick={handleLogout}>Logout</span>
        </div>
      </div>

      {/* Centered Content */}
      <div style={styles.contentWrapper}>
        <div style={styles.content}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>Security Alerts</h1>
            {activeCount > 0 && (
              <span style={styles.alertBadge}>
                {activeCount} Active Alert{activeCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Alerts</div>
              <div style={{ ...styles.statValue, color: "#60a5fa" }}>{alerts.length}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>High Risk</div>
              <div style={{ ...styles.statValue, color: "#ef4444" }}>{highRiskCount}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Medium Risk</div>
              <div style={{ ...styles.statValue, color: "#f59e0b" }}>{mediumRiskCount}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Low Risk</div>
              <div style={{ ...styles.statValue, color: "#10b981" }}>{lowRiskCount}</div>
            </div>
          </div>

          {/* Filters */}
          <div style={styles.filters}>
            <button 
              style={filter === "all" ? styles.activeFilter : styles.filterButton}
              onClick={() => setFilter("all")}
            >
              All Alerts
            </button>
            <button 
              style={filter === "high" ? styles.activeFilter : styles.filterButton}
              onClick={() => setFilter("high")}
            >
              High Risk
            </button>
            <button 
              style={filter === "medium" ? styles.activeFilter : styles.filterButton}
              onClick={() => setFilter("medium")}
            >
              Medium Risk
            </button>
            <button 
              style={filter === "low" ? styles.activeFilter : styles.filterButton}
              onClick={() => setFilter("low")}
            >
              Low Risk
            </button>
          </div>

          {/* Alerts Table */}
          {filteredAlerts.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Attack</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Risk</th>
                    <th style={styles.th}>Source IP</th>
                    <th style={styles.th}>Destination</th>
                    <th style={styles.th}>Protocol</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert) => (
                    <tr key={alert.id}>
                      <td style={styles.td}>
                        <div>{alert.date}</div>
                        <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{alert.timestamp}</div>
                      </td>
                      <td style={styles.td}>
                        <strong>{alert.attack}</strong>
                        <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                          {alert.confidence}% confidence
                        </div>
                      </td>
                      <td style={styles.td}>{alert.category}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.riskBadge,
                          background: `${getRiskColor(alert.risk)}20`,
                          color: getRiskColor(alert.risk)
                        }}>
                          <span style={{
                            ...styles.severityDot,
                            background: getRiskColor(alert.risk)
                          }}></span>
                          {alert.risk}
                        </span>
                      </td>
                      <td style={styles.td}>{alert.source_ip}</td>
                      <td style={styles.td}>
                        <div>{alert.destination_ip}</div>
                        <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                          Port: {alert.port}
                        </div>
                      </td>
                      <td style={styles.td}>{alert.protocol}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.riskBadge,
                          background: `${getStatusColor(alert.status)}20`,
                          color: getStatusColor(alert.status)
                        }}>
                          {alert.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button style={styles.actionButton}>View</button>
                        <button style={styles.viewButton}>Resolve</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🛡️</div>
              <h3 style={{ color: "#60a5fa", marginBottom: "10px" }}>No Alerts Found</h3>
              <p style={{ color: "#9ca3af" }}>
                {filter === "all" 
                  ? "No security alerts have been generated yet." 
                  : `No ${filter} risk alerts found.`}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div style={styles.buttonContainer}>
            <button 
              style={styles.secondaryButton}
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
            <Link to="/upload" style={styles.button}>
              Analyze New File
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Alerts