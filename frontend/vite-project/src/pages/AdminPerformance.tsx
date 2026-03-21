import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import AdminPageLayout from "../components/AdminPageLayout"
import { AdminCard } from "../components/AdminPageStyles"
import { getMetrics } from "../utils/authUtils"
import { adminTheme } from "../adminTheme"
import styled from "styled-components"

const BarRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 12px;
`

const BarLabel = styled.div`
  width: 50px;
  color: ${adminTheme.text};
  font-family: ${adminTheme.fontMono};
`

const BarTrack = styled.div`
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  overflow: hidden;
  height: 14px;
  border: 1px solid rgba(124, 58, 237, 0.3);
`

const BarFill = styled.div<{ width: number }>`
  width: ${(p) => p.width}%;
  background: linear-gradient(90deg, #00d4aa, #00f5d4);
  height: 100%;
  border-radius: 6px;
  box-shadow: 0 0 8px rgba(0, 212, 170, 0.4);
`

const BarValue = styled.div`
  width: 50px;
  color: ${adminTheme.primary};
  font-family: ${adminTheme.fontMono};
`

function AdminPerformance() {
  const navigate = useNavigate()
  const metrics = getMetrics()
  const dayData = [
    { day: "Mon", value: metrics.totalLogins - 3 },
    { day: "Tue", value: metrics.totalLogins - 1 },
    { day: "Wed", value: metrics.totalLogins + 2 },
    { day: "Thu", value: metrics.totalLogins + 5 },
    { day: "Fri", value: metrics.totalLogins + 3 },
  ]

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") {
      navigate("/login")
    }
  }, [navigate])

  return (
    <>
      <AdminSidebar />
      <AdminPageLayout
        title="Admin Control Panel"
        description="View system performance metrics and statistics."
      >
        <AdminCard>
          <h2 style={{ margin: "0 0 16px", color: adminTheme.primary, fontFamily: adminTheme.fontDisplay }}>
            Site Performance
          </h2>
          <div style={{ marginBottom: "14px", color: adminTheme.text }}>
            <strong>Active Users Today:</strong>{" "}
            <span style={{ color: adminTheme.primary }}>{metrics.activeUsers}</span>
          </div>
          <div style={{ marginBottom: "14px", color: adminTheme.text }}>
            <strong>Most Active Day:</strong>{" "}
            <span style={{ color: adminTheme.primary }}>Friday</span>
          </div>
          <div style={{ marginBottom: "14px", color: adminTheme.text }}>
            <strong>Performance Health:</strong>{" "}
            <span style={{ color: adminTheme.success }}>Good</span>
          </div>
        </AdminCard>

        <AdminCard>
          <h3 style={{ margin: "0 0 16px", color: adminTheme.primary, fontFamily: adminTheme.fontDisplay }}>
            Daily Logins (sample)
          </h3>
          {dayData.map((entry) => (
            <BarRow key={entry.day}>
              <BarLabel>{entry.day}</BarLabel>
              <BarTrack>
                <BarFill width={Math.min(100, entry.value * 4)} />
              </BarTrack>
              <BarValue>{entry.value}</BarValue>
            </BarRow>
          ))}
        </AdminCard>
      </AdminPageLayout>
    </>
  )
}

export default AdminPerformance
