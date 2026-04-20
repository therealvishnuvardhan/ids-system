import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUserUploadHistory, type CsvResultRecord } from "../utils/authUtils"
import UserPageLayout from "../components/UserPageLayout"
import styled, { keyframes } from "styled-components"
import { cyberTheme } from "../theme"
import { PageTitle, Card, CyberButton, Table, Th, Td } from "../components/UserPageStyles"

// ─── Animations ───────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ─── Styled components ────────────────────────────────────────────────

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`

const HeaderRight = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
`

const ExportBtn = styled(CyberButton)`
  padding: 0.55rem 1.1rem;
  font-size: 0.8rem;
  border-color: ${cyberTheme.success};
  color: ${cyberTheme.success};
  &:hover:not(:disabled) {
    background: ${cyberTheme.success};
    color: #000;
  }
`

const SectionTitle = styled.h3`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 0.78rem;
  color: ${cyberTheme.primary};
  text-transform: uppercase;
  letter-spacing: 0.16em;
  margin: 0 0 1.25rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid ${cyberTheme.border};
`

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
  gap: 1.1rem;
  margin-bottom: 2rem;
`

const KpiCard = styled.div<{ $accent?: string }>`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid ${p => p.$accent ? `${p.$accent}44` : cyberTheme.border};
  padding: 1.1rem 1.25rem;
  animation: ${fadeIn} 0.45s ease;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: ${p => p.$accent || cyberTheme.primary};
    opacity: 0.7;
  }
`

const KpiLabel = styled.div`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.68rem;
  color: ${cyberTheme.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 0.45rem;
`

const KpiValue = styled.div<{ $color?: string }>`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 1.65rem;
  font-weight: 700;
  color: ${p => p.$color || cyberTheme.primary};
  line-height: 1;
`

const KpiSub = styled.div`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.68rem;
  color: ${cyberTheme.textMuted};
  margin-top: 0.3rem;
`

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  @media (max-width: 780px) { grid-template-columns: 1fr; }
`

const ChartPanel = styled(Card)`
  padding: 1.25rem 1.5rem;
  margin-bottom: 0;
  animation: ${fadeIn} 0.5s ease;
`

// Horizontal bar
const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
`

const BarLabel = styled.span<{ $color?: string }>`
  width: 88px;
  font-family: ${cyberTheme.fontMono};
  font-size: 0.78rem;
  color: ${p => p.$color || cyberTheme.textMuted};
  flex-shrink: 0;
`

const BarTrack = styled.div`
  flex: 1;
  height: 18px;
  background: rgba(255,255,255,0.05);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`

const BarFill = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${p => Math.max(p.$pct, 2)}%;
  background: ${p => p.$color};
  border-radius: 3px;
  transition: width 0.6s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 6px;
`

const BarCount = styled.span`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(0,0,0,0.85);
  white-space: nowrap;
`

const PctLabel = styled.span`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.72rem;
  color: ${cyberTheme.textMuted};
  width: 38px;
  text-align: right;
  flex-shrink: 0;
`

// Upload history table
const HistTable = styled(Table)`
  font-size: 0.82rem;
`

const StyledTh = styled(Th)` padding: 0.8rem 1rem; font-size: 0.7rem; `
const StyledTd = styled(Td)` padding: 0.8rem 1rem; vertical-align: middle; `

const AttackRatePill = styled.span<{ $pct: number }>`
  display: inline-block;
  padding: 0.2rem 0.55rem;
  font-family: ${cyberTheme.fontMono};
  font-size: 0.72rem;
  font-weight: 700;
  background: ${p => p.$pct > 50 ? `${cyberTheme.danger}22` : p.$pct > 20 ? `${cyberTheme.warning}22` : `${cyberTheme.success}22`};
  color: ${p => p.$pct > 50 ? cyberTheme.danger : p.$pct > 20 ? cyberTheme.warning : cyberTheme.success};
`

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${cyberTheme.textMuted};
  font-family: ${cyberTheme.fontMono};
  animation: ${fadeIn} 0.5s ease;
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`

const Chip = styled.span<{ $color: string }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: ${p => p.$color};
  margin-right: 5px;
  vertical-align: middle;
`

// ─── Data helpers ─────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  DoS:     cyberTheme.danger,
  Probe:   cyberTheme.warning,
  R2L:     "#a855f7",
  U2R:     "#38bdf8",
  Normal:  cyberTheme.success,
  Unknown: cyberTheme.textMuted,
}

const RISK_COLORS: Record<string, string> = {
  High:   cyberTheme.danger,
  Medium: cyberTheme.warning,
  Low:    cyberTheme.success,
}

function buildAggregate(history: CsvResultRecord[]) {
  let totalRecords   = 0
  let totalAttacks   = 0
  let totalNormal    = 0
  let confSum        = 0
  let confCount      = 0
  const catCounts: Record<string, number> = {}
  const riskCounts: Record<string, number> = { High: 0, Medium: 0, Low: 0 }
  const attackTypeCounts: Record<string, number> = {}

  for (const record of history) {
    totalRecords += record.summaries.totalRecords
    totalAttacks += record.summaries.attacksDetected
    totalNormal  += record.summaries.normalTraffic

    const preds: any[] = record.data?.predictions || []
    for (const p of preds) {
      // confidence
      if (p.confidence_percentage != null) {
        confSum += p.confidence_percentage
        confCount++
      }
      // category counts
      if (p.status === "Attack Detected") {
        const cat = p.attack_category || "Unknown"
        catCounts[cat] = (catCounts[cat] || 0) + 1
        const risk = p.risk_level || "Low"
        riskCounts[risk] = (riskCounts[risk] || 0) + 1
        const type = p.attack_type || "unknown"
        attackTypeCounts[type] = (attackTypeCounts[type] || 0) + 1
      }
    }
  }

  const avgConf = confCount > 0 ? confSum / confCount : 0
  const detectionRate = totalRecords > 0 ? (totalAttacks / totalRecords) * 100 : 0

  // sort top attack types
  const topTypes = Object.entries(attackTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count, pct: totalAttacks > 0 ? Math.round((count / totalAttacks) * 100) : 0 }))

  const categoryRows = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => ({ cat, count, pct: totalAttacks > 0 ? Math.round((count / totalAttacks) * 100) : 0 }))

  return { totalRecords, totalAttacks, totalNormal, avgConf, detectionRate, riskCounts, topTypes, categoryRows }
}

function exportCSV(history: CsvResultRecord[]) {
  const rows: string[] = [
    "Upload#,Filename,Date,Total Records,Attacks,Normal,Avg Confidence,Attack Rate%"
  ]
  history.forEach((r, i) => {
    const d = new Date(r.timestamp).toLocaleString()
    const rate = r.summaries.totalRecords > 0
      ? ((r.summaries.attacksDetected / r.summaries.totalRecords) * 100).toFixed(1)
      : "0"
    rows.push(`${i + 1},"${r.fileName}","${d}",${r.summaries.totalRecords},${r.summaries.attacksDetected},${r.summaries.normalTraffic},${r.summaries.avgConfidence.toFixed(1)},${rate}%`)
  })
  const blob = new Blob([rows.join("\n")], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `ids_report_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Component ────────────────────────────────────────────────────────

function Reports() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"overview"|"breakdown">("overview")

  const username = localStorage.getItem("username") || ""
  const history  = getUserUploadHistory(username)

  if (history.length === 0) {
    return (
      <UserPageLayout>
        <Header>
          <PageTitle>Analytics Reports</PageTitle>
        </Header>
        <Card>
          <EmptyState>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem", opacity: 0.3 }}>📊</div>
            <h3 style={{ color: cyberTheme.primary, marginBottom: "0.75rem" }}>No Report Data</h3>
            <p style={{ marginBottom: "1.5rem" }}>Upload and analyse a CSV file to generate reports.</p>
            <CyberButton onClick={() => navigate("/upload")}>↑ Upload CSV</CyberButton>
          </EmptyState>
        </Card>
      </UserPageLayout>
    )
  }

  const agg = buildAggregate(history)
  const tabs: { key: "overview"|"breakdown"; label: string }[] = [
    { key: "overview",  label: "Overview" },
    { key: "breakdown", label: "Attack Breakdown" },
  ]

  return (
    <UserPageLayout>
      {/* ── Header ── */}
      <Header>
        <div>
          <PageTitle>Analytics Reports</PageTitle>
          <div style={{ fontFamily: cyberTheme.fontMono, fontSize: "0.72rem", color: cyberTheme.textMuted, marginTop: "0.35rem" }}>
            {history.length} upload{history.length > 1 ? "s" : ""} analysed &nbsp;·&nbsp; last: {new Date(history[0].timestamp).toLocaleString()}
          </div>
        </div>
        <HeaderRight>
          <ExportBtn onClick={() => exportCSV(history)}>⤓ Export CSV</ExportBtn>
        </HeaderRight>
      </Header>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "1.75rem", borderBottom: `1px solid ${cyberTheme.border}`, paddingBottom: "0" }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "0.55rem 1.1rem",
              background: activeTab === t.key ? `${cyberTheme.primary}18` : "transparent",
              border: "none",
              borderBottom: activeTab === t.key ? `2px solid ${cyberTheme.primary}` : "2px solid transparent",
              color: activeTab === t.key ? cyberTheme.primary : cyberTheme.textMuted,
              fontFamily: cyberTheme.fontMono,
              fontSize: "0.78rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: "-1px",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ────────────── OVERVIEW ────────────── */}
      {activeTab === "overview" && (
        <>
          {/* KPI row */}
          <KpiGrid>
            <KpiCard>
              <KpiLabel>Total Records Analysed</KpiLabel>
              <KpiValue>{agg.totalRecords.toLocaleString()}</KpiValue>
              <KpiSub>across {history.length} upload{history.length > 1 ? "s" : ""}</KpiSub>
            </KpiCard>
            <KpiCard $accent={cyberTheme.danger}>
              <KpiLabel>Total Attacks Found</KpiLabel>
              <KpiValue $color={cyberTheme.danger}>{agg.totalAttacks.toLocaleString()}</KpiValue>
              <KpiSub>{agg.detectionRate.toFixed(1)}% of all traffic</KpiSub>
            </KpiCard>
            <KpiCard $accent={cyberTheme.success}>
              <KpiLabel>Normal Traffic</KpiLabel>
              <KpiValue $color={cyberTheme.success}>{agg.totalNormal.toLocaleString()}</KpiValue>
              <KpiSub>{agg.totalRecords > 0 ? (100 - agg.detectionRate).toFixed(1) : 0}% clean</KpiSub>
            </KpiCard>
            <KpiCard $accent={cyberTheme.primary}>
              <KpiLabel>Avg Confidence</KpiLabel>
              <KpiValue>{agg.avgConf.toFixed(1)}%</KpiValue>
              <KpiSub>model certainty</KpiSub>
            </KpiCard>
            <KpiCard $accent={cyberTheme.danger}>
              <KpiLabel>High Risk Alerts</KpiLabel>
              <KpiValue $color={cyberTheme.danger}>{agg.riskCounts.High.toLocaleString()}</KpiValue>
              <KpiSub>{agg.totalAttacks > 0 ? ((agg.riskCounts.High / agg.totalAttacks) * 100).toFixed(0) : 0}% of attacks</KpiSub>
            </KpiCard>
            <KpiCard $accent={cyberTheme.warning}>
              <KpiLabel>Medium Risk</KpiLabel>
              <KpiValue $color={cyberTheme.warning}>{agg.riskCounts.Medium.toLocaleString()}</KpiValue>
            </KpiCard>
            <KpiCard $accent={cyberTheme.success}>
              <KpiLabel>Low Risk</KpiLabel>
              <KpiValue $color={cyberTheme.success}>{agg.riskCounts.Low.toLocaleString()}</KpiValue>
            </KpiCard>
          </KpiGrid>

          <TwoCol>
            {/* Risk distribution */}
            <ChartPanel>
              <SectionTitle>Risk Level Distribution</SectionTitle>
              {Object.entries(agg.riskCounts).map(([level, count]) => {
                const pct = agg.totalAttacks > 0 ? (count / agg.totalAttacks) * 100 : 0
                return (
                  <BarRow key={level}>
                    <BarLabel $color={RISK_COLORS[level]}>
                      <Chip $color={RISK_COLORS[level]} />{level}
                    </BarLabel>
                    <BarTrack>
                      <BarFill $pct={pct} $color={RISK_COLORS[level]}>
                        {count > 0 && <BarCount>{count}</BarCount>}
                      </BarFill>
                    </BarTrack>
                    <PctLabel>{pct.toFixed(0)}%</PctLabel>
                  </BarRow>
                )
              })}

              {/* Normal vs Attack overall */}
              <div style={{ marginTop: "1.5rem", borderTop: `1px solid ${cyberTheme.border}`, paddingTop: "1rem" }}>
                <div style={{ fontFamily: cyberTheme.fontMono, fontSize: "0.68rem", color: cyberTheme.textMuted, marginBottom: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Overall Traffic Split</div>
                {[
                  { label: "Attack",  count: agg.totalAttacks, color: cyberTheme.danger },
                  { label: "Normal",  count: agg.totalNormal,  color: cyberTheme.success },
                ].map(item => {
                  const pct = agg.totalRecords > 0 ? (item.count / agg.totalRecords) * 100 : 0
                  return (
                    <BarRow key={item.label}>
                      <BarLabel $color={item.color}>
                        <Chip $color={item.color} />{item.label}
                      </BarLabel>
                      <BarTrack>
                        <BarFill $pct={pct} $color={item.color}>
                          {item.count > 0 && <BarCount>{item.count}</BarCount>}
                        </BarFill>
                      </BarTrack>
                      <PctLabel>{pct.toFixed(0)}%</PctLabel>
                    </BarRow>
                  )
                })}
              </div>
            </ChartPanel>

            {/* Attack categories */}
            <ChartPanel>
              <SectionTitle>Attack Category Breakdown</SectionTitle>
              {agg.categoryRows.length === 0 ? (
                <div style={{ color: cyberTheme.success, fontFamily: cyberTheme.fontMono, fontSize: "0.82rem", padding: "1rem 0" }}>
                  ✔ No attacks detected across all uploads.
                </div>
              ) : (
                agg.categoryRows.map(({ cat, count, pct }) => (
                  <BarRow key={cat}>
                    <BarLabel $color={CATEGORY_COLORS[cat] || cyberTheme.primary}>
                      <Chip $color={CATEGORY_COLORS[cat] || cyberTheme.primary} />{cat}
                    </BarLabel>
                    <BarTrack>
                      <BarFill $pct={pct} $color={CATEGORY_COLORS[cat] || cyberTheme.primary}>
                        {count > 0 && <BarCount>{count}</BarCount>}
                      </BarFill>
                    </BarTrack>
                    <PctLabel>{pct}%</PctLabel>
                  </BarRow>
                ))
              )}
            </ChartPanel>
          </TwoCol>
        </>
      )}


      {/* ────────────── ATTACK BREAKDOWN ────────────── */}
      {activeTab === "breakdown" && (
        <>
          <TwoCol>
            {/* Top attack types */}
            <ChartPanel>
              <SectionTitle>Top Attack Types</SectionTitle>
              {agg.topTypes.length === 0 ? (
                <div style={{ color: cyberTheme.success, fontFamily: cyberTheme.fontMono, fontSize: "0.82rem", padding: "1rem 0" }}>✔ No attacks detected.</div>
              ) : (
                agg.topTypes.map(({ name, count, pct }, i) => {
                  const color = i === 0 ? cyberTheme.danger : i === 1 ? cyberTheme.warning : i < 4 ? "#a855f7" : cyberTheme.primary
                  return (
                    <BarRow key={name}>
                      <BarLabel $color={color}>{name}</BarLabel>
                      <BarTrack>
                        <BarFill $pct={pct} $color={color}>
                          {count > 0 && <BarCount>{count}</BarCount>}
                        </BarFill>
                      </BarTrack>
                      <PctLabel>{pct}%</PctLabel>
                    </BarRow>
                  )
                })
              )}
            </ChartPanel>

            {/* Category summary cards */}
            <ChartPanel>
              <SectionTitle>Category Summary</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {agg.categoryRows.length === 0 ? (
                  <div style={{ gridColumn: "1/-1", color: cyberTheme.success, fontFamily: cyberTheme.fontMono, fontSize: "0.82rem" }}>✔ No attacks detected.</div>
                ) : (
                  agg.categoryRows.map(({ cat, count, pct }) => (
                    <div key={cat} style={{
                      border: `1px solid ${CATEGORY_COLORS[cat] || cyberTheme.border}44`,
                      background: `${CATEGORY_COLORS[cat] || cyberTheme.primary}0a`,
                      padding: "0.85rem",
                    }}>
                      <div style={{ fontFamily: cyberTheme.fontMono, fontSize: "0.7rem", color: CATEGORY_COLORS[cat] || cyberTheme.primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.35rem" }}>
                        {cat}
                      </div>
                      <div style={{ fontFamily: cyberTheme.fontDisplay, fontSize: "1.35rem", fontWeight: 700, color: CATEGORY_COLORS[cat] || cyberTheme.primary }}>
                        {count.toLocaleString()}
                      </div>
                      <div style={{ fontFamily: cyberTheme.fontMono, fontSize: "0.7rem", color: cyberTheme.textMuted, marginTop: "0.2rem" }}>
                        {pct}% of attacks
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ChartPanel>
          </TwoCol>

          {/* Detailed table */}
          {agg.topTypes.length > 0 && (
            <Card style={{ padding: "1.25rem" }}>
              <SectionTitle>Attack Type Details</SectionTitle>
              <div style={{ overflowX: "auto" }}>
                <HistTable>
                  <thead>
                    <tr>
                      <StyledTh>Rank</StyledTh>
                      <StyledTh>Attack Type</StyledTh>
                      <StyledTh>Count</StyledTh>
                      <StyledTh>% of Attacks</StyledTh>
                      <StyledTh>Severity</StyledTh>
                    </tr>
                  </thead>
                  <tbody>
                    {agg.topTypes.map(({ name, count, pct }, i) => {
                      const severity = i === 0 ? "Highest" : i < 3 ? "High" : i < 6 ? "Moderate" : "Low"
                      const sevColor = i === 0 ? cyberTheme.danger : i < 3 ? cyberTheme.warning : i < 6 ? "#a855f7" : cyberTheme.success
                      return (
                        <tr key={name}>
                          <StyledTd style={{ color: cyberTheme.textMuted, fontFamily: cyberTheme.fontMono }}>#{i + 1}</StyledTd>
                          <StyledTd style={{ color: cyberTheme.primary, fontFamily: cyberTheme.fontMono, fontWeight: 600 }}>{name}</StyledTd>
                          <StyledTd style={{ fontWeight: 700 }}>{count.toLocaleString()}</StyledTd>
                          <StyledTd>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", background: cyberTheme.primary, borderRadius: 3 }} />
                              </div>
                              <span style={{ fontFamily: cyberTheme.fontMono, fontSize: "0.78rem", width: 36 }}>{pct}%</span>
                            </div>
                          </StyledTd>
                          <StyledTd>
                            <span style={{ fontFamily: cyberTheme.fontMono, fontSize: "0.72rem", fontWeight: 700, color: sevColor, background: `${sevColor}18`, padding: "0.2rem 0.5rem" }}>
                              {severity}
                            </span>
                          </StyledTd>
                        </tr>
                      )
                    })}
                  </tbody>
                </HistTable>
              </div>
            </Card>
          )}
        </>
      )}

      <ButtonGroup>
        <CyberButton onClick={() => navigate("/alerts")}>⚠ View Alerts</CyberButton>
        <CyberButton onClick={() => navigate("/upload")}>↑ Upload New CSV</CyberButton>
        <CyberButton onClick={() => navigate("/dashboard")}>← Dashboard</CyberButton>
      </ButtonGroup>
    </UserPageLayout>
  )
}

export default Reports
