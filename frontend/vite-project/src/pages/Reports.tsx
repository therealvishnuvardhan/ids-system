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
  dateRange: {
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },
  dateInput: {
    padding: "8px 12px",
    background: "#2d2d2d",
    border: "1px solid #374151",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "0.9rem"
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
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "20px",
    marginBottom: "30px"
  },
  chartCard: {
    background: "#2d2d2d",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #374151"
  },
  chartTitle: {
    fontSize: "1.2rem",
    color: "#60a5fa",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #374151"
  },
  barChart: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "15px"
  },
  barItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  barLabel: {
    width: "100px",
    color: "#9ca3af",
    fontSize: "0.9rem"
  },
  barContainer: {
    flex: 1,
    height: "24px",
    background: "#374151",
    borderRadius: "12px",
    overflow: "hidden"
  },
  barFill: {
    height: "100%",
    background: "#3b82f6",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: "10px",
    color: "white",
    fontSize: "0.8rem",
    fontWeight: "bold" as const
  },
  pieChart: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "30px",
    flexWrap: "wrap" as const
  },
  pieSegment: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  pieColor: {
    width: "12px",
    height: "12px",
    borderRadius: "3px"
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
  trendUp: {
    color: "#10b981",
    fontWeight: "bold" as const
  },
  trendDown: {
    color: "#ef4444",
    fontWeight: "bold" as const
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
  exportButton: {
    padding: "8px 16px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem"
  }
}

function Reports() {
  const navigate = useNavigate()
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    // Simulate fetching report data
    setReportData({
      totalAnalyses: 156,
      threatsDetected: 89,
            falsePositives: 12,
      avgConfidence: 94.5,
      detectionRate: "97.2%",
      topAttacks: [
        { name: "neptune", count: 45, percentage: 51 },
        { name: "satan", count: 23, percentage: 26 },
        { name: "ipsweep", count: 12, percentage: 13 },
        { name: "guess_passwd", count: 6, percentage: 7 },
        { name: "smurf", count: 3, percentage: 3 }
      ],
      riskDistribution: [
        { level: "High", count: 42, color: "#ef4444" },
        { level: "Medium", count: 31, color: "#f59e0b" },
        { level: "Low", count: 16, color: "#10b981" }
      ],
      recentActivity: [
        { date: "2024-01-15", attacks: 12, normal: 45 },
        { date: "2024-01-14", attacks: 8, normal: 52 },
        { date: "2024-01-13", attacks: 15, normal: 38 },
        { date: "2024-01-12", attacks: 7, normal: 49 },
        { date: "2024-01-11", attacks: 11, normal: 44 }
      ],
      attackCategories: [
        { category: "DoS", count: 48, percentage: 54 },
        { category: "Probe", count: 23, percentage: 26 },
        { category: "R2L", count: 12, percentage: 13 },
        { category: "U2R", count: 6, percentage: 7 }
      ]
    })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    navigate("/login")
  }

  const handleExport = () => {
    alert("Exporting report as PDF...")
  }

  if (!reportData) {
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
            <span style={styles.activeNavLink}>Reports</span>
            <span style={styles.navLink} onClick={handleLogout}>Logout</span>
          </div>
        </div>
        <div style={styles.contentWrapper}>
          <div style={styles.content}>
            <div style={{ textAlign: "center", padding: "60px" }}>
              <p style={{ color: "#9ca3af" }}>Loading reports...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          <span style={styles.activeNavLink}>Reports</span>
          <span style={styles.navLink} onClick={handleLogout}>Logout</span>
        </div>
      </div>

      {/* Centered Content */}
      <div style={styles.contentWrapper}>
        <div style={styles.content}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>Analytics Reports</h1>
            <div style={styles.dateRange}>
              <input 
                type="date" 
                style={styles.dateInput} 
                defaultValue="2024-01-01"
              />
              <span style={{ color: "#9ca3af" }}>to</span>
              <input 
                type="date" 
                style={styles.dateInput} 
                defaultValue="2024-01-31"
              />
              <button style={styles.exportButton} onClick={handleExport}>
                📊 Export Report
              </button>
            </div>
          </div>

          {/* Key Statistics */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Analyses</div>
              <div style={styles.statValue}>{reportData.totalAnalyses}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Threats Detected</div>
              <div style={{ ...styles.statValue, color: "#ef4444" }}>{reportData.threatsDetected}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Detection Rate</div>
              <div style={styles.statValue}>{reportData.detectionRate}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Avg Confidence</div>
              <div style={styles.statValue}>{reportData.avgConfidence}%</div>
            </div>
          </div>

          {/* Charts */}
          <div style={styles.chartsGrid}>
            {/* Attack Distribution */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Top Attack Types</h3>
              <div style={styles.barChart}>
                {reportData.topAttacks.map((attack: any, index: number) => (
                  <div key={index} style={styles.barItem}>
                    <span style={styles.barLabel}>{attack.name}</span>
                    <div style={styles.barContainer}>
                      <div style={{
                        ...styles.barFill,
                        width: `${attack.percentage}%`,
                        background: index === 0 ? "#ef4444" : 
                                   index === 1 ? "#f59e0b" : "#3b82f6"
                      }}>
                        {attack.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Distribution */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Risk Level Distribution</h3>
              <div style={styles.pieChart}>
                <div style={{ width: "150px", height: "150px", position: "relative" }}>
                  <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                    {reportData.riskDistribution.map((item: any, index: number) => {
                      const total = reportData.riskDistribution.reduce((acc: number, curr: any) => acc + curr.count, 0)
                      const percentage = (item.count / total) * 100
                      const offset = reportData.riskDistribution
                        .slice(0, index)
                        .reduce((acc: number, curr: any) => acc + (curr.count / total) * 100, 0)
                      
                      return (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="20"
                          strokeDasharray={`${percentage} ${100 - percentage}`}
                          strokeDashoffset={-offset}
                        />
                      )
                    })}
                  </svg>
                </div>
                <div>
                  {reportData.riskDistribution.map((item: any, index: number) => (
                    <div key={index} style={styles.pieSegment}>
                      <div style={{ ...styles.pieColor, background: item.color }}></div>
                      <span style={{ color: "#9ca3af" }}>{item.level}:</span>
                      <span style={{ color: "white", fontWeight: "bold" }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Attack Categories */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Attack Categories</h3>
              <div style={styles.barChart}>
                {reportData.attackCategories.map((category: any, index: number) => (
                  <div key={index} style={styles.barItem}>
                    <span style={styles.barLabel}>{category.category}</span>
                    <div style={styles.barContainer}>
                      <div style={{
                        ...styles.barFill,
                        width: `${category.percentage}%`,
                        background: index === 0 ? "#ef4444" : 
                                   index === 1 ? "#f59e0b" : 
                                   index === 2 ? "#3b82f6" : "#10b981"
                      }}>
                        {category.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Recent Activity (Last 5 Days)</h3>
              <div style={styles.barChart}>
                {reportData.recentActivity.map((day: any, index: number) => (
                  <div key={index} style={styles.barItem}>
                    <span style={styles.barLabel}>{day.date}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "2px", height: "24px" }}>
                        <div style={{
                          width: `${(day.attacks / (day.attacks + day.normal)) * 100}%`,
                          background: "#ef4444",
                          height: "100%",
                          borderRadius: "12px 0 0 12px"
                        }}></div>
                        <div style={{
                          width: `${(day.normal / (day.attacks + day.normal)) * 100}%`,
                          background: "#10b981",
                          height: "100%",
                          borderRadius: "0 12px 12px 0"
                        }}></div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "0.8rem" }}>
                        <span style={{ color: "#ef4444" }}>{day.attacks} attacks</span>
                        <span style={{ color: "#10b981" }}>{day.normal} normal</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Attack Table */}
          <div style={{ marginTop: "30px" }}>
            <h3 style={{ ...styles.chartTitle, marginBottom: "15px" }}>Attack Details</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Attack Type</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Count</th>
                    <th style={styles.th}>Percentage</th>
                    <th style={styles.th}>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topAttacks.map((attack: any, index: number) => (
                    <tr key={index}>
                      <td style={styles.td}>{attack.name}</td>
                      <td style={styles.td}>
                        {attack.name === "neptune" ? "DoS" :
                         attack.name === "satan" ? "Probe" :
                         attack.name === "ipsweep" ? "Probe" :
                         attack.name === "guess_passwd" ? "R2L" : "DoS"}
                      </td>
                      <td style={styles.td}>{attack.count}</td>
                      <td style={styles.td}>{attack.percentage}%</td>
                      <td style={styles.td}>
                        <span style={index < 2 ? styles.trendUp : styles.trendDown}>
                          {index < 2 ? "↑" : "↓"} 
                          {index === 0 ? " 12%" : index === 1 ? " 5%" : " -3%"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.buttonContainer}>
            <button 
              style={styles.secondaryButton}
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
            <button 
              style={styles.button}
              onClick={() => navigate("/alerts")}
            >
              View Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports