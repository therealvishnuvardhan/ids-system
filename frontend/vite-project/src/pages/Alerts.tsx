import { useState } from "react"
import { useNavigate } from "react-router-dom"
import UserPageLayout from "../components/UserPageLayout"
import styled, { keyframes } from "styled-components"
import { cyberTheme } from "../theme"
import { PageTitle, Card, CyberButton, Table, Th, Td } from "../components/UserPageStyles"
import { getUserUploadHistory, type CsvResultRecord } from "../utils/authUtils"

// ─── Animations ──────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
`

// ─── Styled Components ────────────────────────────────────────────────

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.25rem;
`

const LiveBadge = styled.span`
  background: ${cyberTheme.danger};
  color: #000;
  padding: 0.45rem 0.9rem;
  font-family: ${cyberTheme.fontMono};
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`

const PulseDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #000;
  display: inline-block;
  animation: ${pulse} 1s ease-in-out infinite;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
`

const StatCard = styled.div<{ $accent?: string }>`
  background: rgba(0, 242, 234, 0.04);
  border: 1px solid ${p => p.$accent ? `${p.$accent}44` : cyberTheme.border};
  padding: 1.25rem;
  animation: ${fadeIn} 0.4s ease;
`

const StatLabel = styled.div`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.7rem;
  color: ${cyberTheme.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
`

const StatValue = styled.div<{ $color?: string }>`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${p => p.$color || cyberTheme.primary};
`

const SectionLabel = styled.div`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${cyberTheme.primary};
  margin-bottom: 1rem;
  border-bottom: 1px solid ${cyberTheme.border};
  padding-bottom: 0.6rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const SourceTag = styled.span`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.7rem;
  color: ${cyberTheme.textMuted};
  background: rgba(0,242,234,0.06);
  border: 1px solid ${cyberTheme.border};
  padding: 0.15rem 0.5rem;
`

const Filters = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`

const FilterBtn = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1.1rem;
  background: ${p => p.$active ? cyberTheme.primary : "transparent"};
  border: 2px solid ${p => p.$active ? cyberTheme.primary : cyberTheme.border};
  color: ${p => p.$active ? cyberTheme.bg : cyberTheme.textMuted};
  font-family: ${cyberTheme.fontMono};
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${cyberTheme.primary}; color: ${cyberTheme.primary}; }
`

const RiskBadge = styled.span<{ $color: string }>`
  padding: 0.28rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: ${p => p.$color}20;
  color: ${p => p.$color};
`

const Dot = styled.span<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${p => p.$color};
  flex-shrink: 0;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${cyberTheme.textMuted};
  font-family: ${cyberTheme.fontMono};
  animation: ${fadeIn} 0.5s ease;
`

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.35;
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, ${cyberTheme.border}, transparent);
  margin: 2.5rem 0;
`

const HistorySection = styled.div`
  animation: ${fadeIn} 0.5s ease;
`

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 1rem 1.25rem;
  border: 1px solid ${cyberTheme.border};
  background: rgba(0,0,0,0.35);
  margin-bottom: 2px;
  transition: background 0.2s;
  &:hover { background: rgba(0, 242, 234, 0.04); }
`

const HistoryTitle = styled.div`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.82rem;
  color: ${cyberTheme.textMuted};
`

const HistoryMeta = styled.div`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.7rem;
  color: ${cyberTheme.textMuted};
  opacity: 0.65;
`

const ExpandIcon = styled.span<{ $open: boolean }>`
  color: ${cyberTheme.primary};
  font-size: 0.9rem;
  transform: ${p => p.$open ? "rotate(90deg)" : "rotate(0deg)"};
  transition: transform 0.2s;
  display: inline-block;
`

const StyledTh = styled(Th)` padding: 0.85rem 1rem; font-size: 0.72rem; `
const StyledTd = styled(Td)` padding: 0.85rem 1rem; vertical-align: middle; `

// ─── Helpers ──────────────────────────────────────────────────────────

type Alert = {
  id: number
  attack_type: string
  attack_category: string
  risk_level: string
  confidence: number
  status: string
}

function buildAlerts(record: CsvResultRecord): Alert[] {
  const predictions: any[] = record.data?.predictions || []
  return predictions
    .filter(p => p.status === "Attack Detected")
    .map((p, i) => ({
      id: i + 1,
      attack_type: p.attack_type || "unknown",
      attack_category: p.attack_category || "Unknown",
      risk_level: p.risk_level || "Low",
      confidence: p.confidence_percentage ?? 0,
      status: "active",
    }))
}

function getRiskColor(risk: string) {
  switch (risk.toLowerCase()) {
    case "high":   return cyberTheme.danger
    case "medium": return cyberTheme.warning
    case "low":    return cyberTheme.success
    default:       return cyberTheme.textMuted
  }
}

function formatTs(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString()}  ${d.toLocaleTimeString()}`
}

// ─── Sub-component: alert table ────────────────────────────────────────

function AlertTable({ alerts, filter }: { alerts: Alert[]; filter: string }) {
  const filtered = filter === "all" ? alerts : alerts.filter(a => a.risk_level.toLowerCase() === filter)

  if (filtered.length === 0) {
    return (
      <EmptyState style={{ padding: "2rem" }}>
        <div style={{ color: cyberTheme.success, marginBottom: "0.5rem" }}>✔ No {filter !== "all" ? filter + " risk" : ""} alerts in this upload.</div>
      </EmptyState>
    )
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <Table>
        <thead>
          <tr>
            <StyledTh>#</StyledTh>
            <StyledTh>Attack Type</StyledTh>
            <StyledTh>Category</StyledTh>
            <StyledTh>Risk Level</StyledTh>
            <StyledTh>Confidence</StyledTh>
          </tr>
        </thead>
        <tbody>
          {filtered.map(alert => (
            <tr key={alert.id}>
              <StyledTd style={{ color: cyberTheme.textMuted, fontSize: "0.78rem" }}>{alert.id}</StyledTd>
              <StyledTd>
                <strong style={{ color: cyberTheme.text }}>{alert.attack_type}</strong>
              </StyledTd>
              <StyledTd>{alert.attack_category}</StyledTd>
              <StyledTd>
                <RiskBadge $color={getRiskColor(alert.risk_level)}>
                  <Dot $color={getRiskColor(alert.risk_level)} />
                  {alert.risk_level}
                </RiskBadge>
              </StyledTd>
              <StyledTd>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontFamily: cyberTheme.fontMono, fontSize: "0.82rem" }}>{alert.confidence.toFixed(1)}%</span>
                  <div style={{ width: 56, height: 5, background: "rgba(0,242,234,0.12)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${alert.confidence}%`, height: "100%", background: getRiskColor(alert.risk_level), borderRadius: 3 }} />
                  </div>
                </div>
              </StyledTd>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

// ─── History Item (collapsible) ────────────────────────────────────────

function HistoryItem({ record }: { record: CsvResultRecord }) {
  const [open, setOpen] = useState(false)
  const alerts = buildAlerts(record)
  const highCount = alerts.filter(a => a.risk_level === "High").length
  const preds = record.data?.predictions?.length || 0

  return (
    <HistorySection>
      <HistoryHeader onClick={() => setOpen(o => !o)}>
        <div>
          <HistoryTitle>📁 {record.fileName}</HistoryTitle>
          <HistoryMeta>{formatTs(record.timestamp)} &nbsp;|&nbsp; {preds} records &nbsp;|&nbsp; {alerts.length} attacks {highCount > 0 && `(${highCount} High)`}</HistoryMeta>
        </div>
        <ExpandIcon $open={open}>▶</ExpandIcon>
      </HistoryHeader>

      {open && (
        <Card style={{ marginBottom: 0, borderTop: "none" }}>
          {alerts.length === 0 ? (
            <EmptyState style={{ padding: "1.5rem" }}>
              <span style={{ color: cyberTheme.success }}>✔ No attacks detected in this upload.</span>
            </EmptyState>
          ) : (
            <AlertTable alerts={alerts} filter="all" />
          )}
        </Card>
      )}
    </HistorySection>
  )
}

// ─── Main Component ────────────────────────────────────────────────────

function Alerts() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("all")

  const username = localStorage.getItem("username") || ""
  const history = getUserUploadHistory(username)  // most recent first

  const latest = history[0] ?? null
  const previous = history.slice(1)

  const currentAlerts = latest ? buildAlerts(latest) : []

  const highCount   = currentAlerts.filter(a => a.risk_level === "High").length
  const mediumCount = currentAlerts.filter(a => a.risk_level === "Medium").length
  const lowCount    = currentAlerts.filter(a => a.risk_level === "Low").length
  const totalRows   = latest?.data?.predictions?.length || 0

  return (
    <UserPageLayout>
      {/* ── Header ── */}
      <Header>
        <PageTitle>Security Alerts</PageTitle>
        {latest && currentAlerts.length > 0 && (
          <LiveBadge><PulseDot /> {currentAlerts.length} Attack{currentAlerts.length > 1 ? "s" : ""} Detected</LiveBadge>
        )}
      </Header>

      {/* ── No uploads at all ── */}
      {!latest && (
        <Card>
          <EmptyState>
            <EmptyIcon>🛡️</EmptyIcon>
            <h3 style={{ color: cyberTheme.primary, marginBottom: "0.75rem" }}>No Data Yet</h3>
            <p style={{ marginBottom: "1.5rem" }}>Upload a CSV file to start seeing real-time security alerts.</p>
            <CyberButton onClick={() => navigate("/upload")}>↑ Upload CSV</CyberButton>
          </EmptyState>
        </Card>
      )}

      {/* ── Current CSV Results ── */}
      {latest && (
        <>
          {/* Stats */}
          <StatsGrid>
            <StatCard>
              <StatLabel>Total Records</StatLabel>
              <StatValue>{totalRows}</StatValue>
            </StatCard>
            <StatCard $accent={cyberTheme.danger}>
              <StatLabel>Attacks Found</StatLabel>
              <StatValue $color={cyberTheme.danger}>{currentAlerts.length}</StatValue>
            </StatCard>
            <StatCard $accent={cyberTheme.danger}>
              <StatLabel>High Risk</StatLabel>
              <StatValue $color={cyberTheme.danger}>{highCount}</StatValue>
            </StatCard>
            <StatCard $accent={cyberTheme.warning}>
              <StatLabel>Medium Risk</StatLabel>
              <StatValue $color={cyberTheme.warning}>{mediumCount}</StatValue>
            </StatCard>
            <StatCard $accent={cyberTheme.success}>
              <StatLabel>Low Risk</StatLabel>
              <StatValue $color={cyberTheme.success}>{lowCount}</StatValue>
            </StatCard>
          </StatsGrid>

          {/* Current CSV label */}
          <SectionLabel>
            <span>Current CSV — Attacks Only</span>
            <SourceTag>📁 {latest.fileName}</SourceTag>
          </SectionLabel>

          {/* Filters */}
          <Filters>
            <FilterBtn $active={filter === "all"}    onClick={() => setFilter("all")}>All</FilterBtn>
            <FilterBtn $active={filter === "high"}   onClick={() => setFilter("high")}>High</FilterBtn>
            <FilterBtn $active={filter === "medium"} onClick={() => setFilter("medium")}>Medium</FilterBtn>
            <FilterBtn $active={filter === "low"}    onClick={() => setFilter("low")}>Low</FilterBtn>
          </Filters>

          {/* Table or clean state */}
          {currentAlerts.length === 0 ? (
            <Card>
              <EmptyState>
                <EmptyIcon>✅</EmptyIcon>
                <h3 style={{ color: cyberTheme.success, marginBottom: "0.5rem" }}>All Clear</h3>
                No attacks detected in <strong style={{ color: cyberTheme.primary }}>{latest.fileName}</strong>.
              </EmptyState>
            </Card>
          ) : (
            <Card style={{ padding: "1.25rem" }}>
              <AlertTable alerts={currentAlerts} filter={filter} />
            </Card>
          )}
        </>
      )}

      {/* ── Previous CSVs ── */}
      {previous.length > 0 && (
        <>
          <Divider />
          <SectionLabel style={{ marginBottom: "1.25rem" }}>
            Previous Uploads ({previous.length})
          </SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {previous.map(record => (
              <HistoryItem key={record.id} record={record} />
            ))}
          </div>
        </>
      )}

      {/* ── Footer buttons ── */}
      <ButtonGroup>
        <CyberButton onClick={() => navigate("/upload")}>↑ Upload New CSV</CyberButton>
        <CyberButton onClick={() => navigate("/dashboard")}>← Dashboard</CyberButton>
      </ButtonGroup>
    </UserPageLayout>
  )
}

export default Alerts
