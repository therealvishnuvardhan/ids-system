import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getUserUploadHistory } from "../utils/authUtils"
import UserPageLayout from "../components/UserPageLayout"
import styled from "styled-components"
import { cyberTheme } from "../theme"
import { PageTitle, Card, CyberButton, CyberButtonDanger, Table, Th, Td } from "../components/UserPageStyles"

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`

const DateRange = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const DateInput = styled.input`
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid ${cyberTheme.border};
  color: ${cyberTheme.text};
  font-family: ${cyberTheme.fontMono};
  font-size: 0.85rem;
  &:focus {
    outline: none;
    border-color: ${cyberTheme.primary};
  }
`

const ExportBtn = styled(CyberButton)`
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const StatCard = styled.div`
  background: rgba(0, 242, 234, 0.05);
  border: 1px solid ${cyberTheme.border};
  padding: 1rem;
`

const StatLabel = styled.div`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.7rem;
  color: ${cyberTheme.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.25rem;
`

const StatValue = styled.div<{ $color?: string }>`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${p => p.$color || cyberTheme.primary};
`

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`

const ChartCard = styled(Card)`
  margin-bottom: 0;
`

const ChartTitle = styled.h3`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 0.9rem;
  color: ${cyberTheme.primary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${cyberTheme.border};
`

const BarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`

const BarLabel = styled.span`
  width: 100px;
  color: ${cyberTheme.textMuted};
  font-family: ${cyberTheme.fontMono};
  font-size: 0.85rem;
`

const BarContainer = styled.div`
  flex: 1;
  height: 20px;
  background: rgba(0, 242, 234, 0.1);
  border-radius: 4px;
  overflow: hidden;
`

const BarFill = styled.div<{ $width: number; $color?: string }>`
  height: 100%;
  width: ${p => p.$width}%;
  background: ${p => p.$color || cyberTheme.primary};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.5rem;
  color: #000;
  font-size: 0.75rem;
  font-weight: 700;
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
`

function formatDateForInput(iso: string) {
  return iso.slice(0, 10)
}

function Reports() {
  const navigate = useNavigate()
  const [reportData, setReportData] = useState<any>(null)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  useEffect(() => {
    const username = localStorage.getItem("username") || "guest"
    const history = getUserUploadHistory(username)

    if (history.length > 0) {
      const dates = history.map((h) => new Date(h.timestamp).getTime())
      const minDate = formatDateForInput(new Date(Math.min(...dates)).toISOString())
      const maxDate = formatDateForInput(new Date(Math.max(...dates)).toISOString())
      setFromDate(minDate)
      setToDate(maxDate)

      const latest = history[0]
      const totalAnalyses = latest.summaries.totalRecords
      const threatsDetected = latest.summaries.attacksDetected
      setReportData({
        totalAnalyses,
        threatsDetected,
        falsePositives: Math.round(totalAnalyses * 0.08),
        avgConfidence: latest.summaries.avgConfidence,
        detectionRate: totalAnalyses > 0 ? `${((threatsDetected / totalAnalyses) * 100).toFixed(1)}%` : "0%",
        topAttacks: [
          { name: "Real-time CSV", count: threatsDetected, percentage: totalAnalyses > 0 ? Math.round((threatsDetected / totalAnalyses) * 100) : 0 },
          { name: "Normal", count: latest.summaries.normalTraffic, percentage: totalAnalyses > 0 ? Math.round((latest.summaries.normalTraffic / totalAnalyses) * 100) : 0 }
        ],
        riskDistribution: [
          { level: "Attack", count: threatsDetected, color: cyberTheme.danger },
          { level: "Normal", count: latest.summaries.normalTraffic, color: cyberTheme.success }
        ],
        attackCategories: [
          { category: "Attacks", count: threatsDetected, percentage: totalAnalyses > 0 ? Math.round((threatsDetected / totalAnalyses) * 100) : 0 },
          { category: "Normal", count: latest.summaries.normalTraffic, percentage: totalAnalyses > 0 ? Math.round((latest.summaries.normalTraffic / totalAnalyses) * 100) : 0 }
        ]
      })
      return
    }

    const today = formatDateForInput(new Date().toISOString())
    setFromDate(today)
    setToDate(today)

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
        { level: "High", count: 42, color: cyberTheme.danger },
        { level: "Medium", count: 31, color: cyberTheme.warning },
        { level: "Low", count: 16, color: cyberTheme.success }
      ],
      attackCategories: [
        { category: "DoS", count: 48, percentage: 54 },
        { category: "Probe", count: 23, percentage: 26 },
        { category: "R2L", count: 12, percentage: 13 },
        { category: "U2R", count: 6, percentage: 7 }
      ]
    })
  }, [])

  const handleExport = () => {
    alert("Exporting report as PDF...")
  }

  if (!reportData) {
    return (
      <UserPageLayout>
        <Card>
          <div style={{ textAlign: "center", padding: "3rem", color: cyberTheme.textMuted }}>
            Loading reports...
          </div>
        </Card>
      </UserPageLayout>
    )
  }

  return (
    <UserPageLayout>
      <Header>
        <PageTitle>Analytics Reports</PageTitle>
        <DateRange>
          <DateInput type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <span style={{ color: cyberTheme.textMuted }}>to</span>
          <DateInput type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <ExportBtn onClick={handleExport}>Export Report</ExportBtn>
        </DateRange>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatLabel>Total Analyses</StatLabel>
          <StatValue>{reportData.totalAnalyses}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Threats Detected</StatLabel>
          <StatValue $color={cyberTheme.danger}>{reportData.threatsDetected}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Detection Rate</StatLabel>
          <StatValue>{reportData.detectionRate}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Avg Confidence</StatLabel>
          <StatValue>{reportData.avgConfidence}%</StatValue>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Top Attack Types</ChartTitle>
          {reportData.topAttacks.map((attack: any, i: number) => (
            <BarItem key={i}>
              <BarLabel>{attack.name}</BarLabel>
              <BarContainer>
                <BarFill $width={attack.percentage} $color={i === 0 ? cyberTheme.danger : i === 1 ? cyberTheme.warning : cyberTheme.primary}>
                  {attack.count}
                </BarFill>
              </BarContainer>
            </BarItem>
          ))}
        </ChartCard>

        <ChartCard>
          <ChartTitle>Risk Distribution</ChartTitle>
          {reportData.riskDistribution?.map((item: any, i: number) => {
            const total = reportData.riskDistribution.reduce((a: number, b: any) => a + b.count, 0)
            const pct = total > 0 ? (item.count / total) * 100 : 0
            return (
              <BarItem key={i}>
                <BarLabel>{item.level}</BarLabel>
                <BarContainer>
                  <BarFill $width={pct} $color={item.color}>
                    {item.count}
                  </BarFill>
                </BarContainer>
              </BarItem>
            )
          })}
        </ChartCard>

        <ChartCard>
          <ChartTitle>Attack Categories</ChartTitle>
          {reportData.attackCategories?.map((cat: any, i: number) => (
            <BarItem key={i}>
              <BarLabel>{cat.category}</BarLabel>
              <BarContainer>
                <BarFill $width={cat.percentage} $color={i === 0 ? cyberTheme.danger : i === 1 ? cyberTheme.warning : cyberTheme.primary}>
                  {cat.count}
                </BarFill>
              </BarContainer>
            </BarItem>
          ))}
        </ChartCard>
      </ChartsGrid>

      <Card>
        <ChartTitle>Attack Details</ChartTitle>
        <div style={{ overflowX: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th>Attack Type</Th>
                <Th>Category</Th>
                <Th>Count</Th>
                <Th>Percentage</Th>
              </tr>
            </thead>
            <tbody>
              {reportData.topAttacks.map((attack: any, i: number) => (
                <tr key={i}>
                  <Td>{attack.name}</Td>
                  <Td>{attack.name === "neptune" ? "DoS" : attack.name === "satan" ? "Probe" : attack.name === "ipsweep" ? "Probe" : attack.name === "guess_passwd" ? "R2L" : "DoS"}</Td>
                  <Td>{attack.count}</Td>
                  <Td>{attack.percentage}%</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      <ButtonGroup>
        <CyberButtonDanger onClick={() => navigate("/dashboard")}>Back to Dashboard</CyberButtonDanger>
        <CyberButton onClick={() => navigate("/alerts")}>View Alerts</CyberButton>
      </ButtonGroup>
    </UserPageLayout>
  )
}

export default Reports
