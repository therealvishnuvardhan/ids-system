import { useLocation, Link, useNavigate } from "react-router-dom"

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
  card: {
    background: "#2d2d2d",
    padding: "30px",
    borderRadius: "12px",
    border: "1px solid #374151"
  },
  title: {
    fontSize: "2rem",
    color: "#60a5fa",
    marginBottom: "30px",
    textAlign: "center" as const
  },
  summary: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap" as const,
    justifyContent: "center"
  },
  summaryItem: {
    background: "#374151",
    padding: "20px",
    borderRadius: "8px",
    flex: "1",
    minWidth: "200px",
    maxWidth: "250px"
  },
  summaryLabel: {
    color: "#9ca3af",
    fontSize: "0.9rem",
    marginBottom: "10px",
    textAlign: "center" as const
  },
  summaryValue: {
    fontSize: "2rem",
    fontWeight: "bold" as const,
    color: "#60a5fa",
    textAlign: "center" as const
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginTop: "20px"
  },
  th: {
    background: "#374151",
    padding: "12px",
    textAlign: "left" as const,
    color: "#60a5fa",
    borderBottom: "2px solid #4b5563"
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #374151",
    color: "#d1d5db"
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.9rem",
    fontWeight: "bold" as const,
    display: "inline-block"
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
  }
}

function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const results = location.state?.predictions || []

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    navigate("/login")
  }

  if (results.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.navbar}>
          <div style={styles.navBrand} onClick={() => navigate("/dashboard")}>
            IDS DASHBOARD
          </div>
          <div style={styles.navLinks}>
            <span style={styles.navLink} onClick={() => navigate("/dashboard")}>Dashboard</span>
            <span style={styles.navLink} onClick={() => navigate("/upload")}>Upload</span>
            <span style={styles.navLink} onClick={() => navigate("/alerts")}>Alerts</span>
            <span style={styles.navLink} onClick={() => navigate("/reports")}>Reports</span>
            <span style={styles.navLink} onClick={handleLogout}>Logout</span>
          </div>
        </div>
        <div style={styles.contentWrapper}>
          <div style={styles.content}>
            <div style={styles.card}>
              <h1 style={styles.title}>No Results</h1>
              <p style={{ color: "#9ca3af", marginBottom: "20px", textAlign: "center" }}>
                No analysis results found. Please upload a file first.
              </p>
              <div style={styles.buttonContainer}>
                <Link to="/upload" style={styles.button}>
                  Go to Upload
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const attackCount = results.filter((r: any) => r.status === "Attack Detected").length
  const normalCount = results.length - attackCount
  const avgConfidence = (results.reduce((acc: number, r: any) => acc + r.confidence_percentage, 0) / results.length).toFixed(1)

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
          <span style={styles.navLink} onClick={() => navigate("/alerts")}>Alerts</span>
          <span style={styles.navLink} onClick={() => navigate("/reports")}>Reports</span>
          <span style={styles.navLink} onClick={handleLogout}>Logout</span>
        </div>
      </div>

      {/* Centered Content */}
      <div style={styles.contentWrapper}>
        <div style={styles.content}>
          <div style={styles.card}>
            <h1 style={styles.title}>Analysis Results</h1>

            {/* Summary Stats */}
            <div style={styles.summary}>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Total Records</div>
                <div style={styles.summaryValue}>{results.length}</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Attacks Detected</div>
                <div style={{ ...styles.summaryValue, color: "#ef4444" }}>{attackCount}</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Normal Traffic</div>
                <div style={{ ...styles.summaryValue, color: "#10b981" }}>{normalCount}</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Avg Confidence</div>
                <div style={styles.summaryValue}>{avgConfidence}%</div>
              </div>
            </div>

            {/* Results Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Attack Type</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Risk Level</th>
                    <th style={styles.th}>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row: any, index: number) => (
                    <tr key={index}>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: row.status === "Attack Detected" ? "#ef444420" : "#10b98120",
                          color: row.status === "Attack Detected" ? "#ef4444" : "#10b981"
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={styles.td}>{row.attack_type}</td>
                      <td style={styles.td}>{row.attack_category}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: row.risk_level === "High" ? "#ef444420" : 
                                     row.risk_level === "Medium" ? "#f59e0b20" : "#10b98120",
                          color: row.risk_level === "High" ? "#ef4444" : 
                                row.risk_level === "Medium" ? "#f59e0b" : "#10b981"
                        }}>
                          {row.risk_level}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span>{row.confidence_percentage}%</span>
                          <div style={{
                            width: "100px",
                            height: "6px",
                            background: "#374151",
                            borderRadius: "3px",
                            overflow: "hidden"
                          }}>
                            <div style={{
                              width: `${row.confidence_percentage}%`,
                              height: "100%",
                              background: "#3b82f6",
                              borderRadius: "3px"
                            }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div style={styles.buttonContainer}>
              <Link to="/upload" style={styles.button}>
                Analyze Another File
              </Link>
              <button 
                style={styles.secondaryButton}
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results