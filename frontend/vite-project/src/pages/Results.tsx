import { useLocation, useNavigate } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from "recharts"
import UserPageLayout from "../components/UserPageLayout"
import styled from "styled-components"
import { cyberTheme } from "../theme"
import { PageTitle, Card, CyberButton, Table, Th, Td } from "../components/UserPageStyles"

const CHART_COLORS = [cyberTheme.primary, cyberTheme.secondary, cyberTheme.success, cyberTheme.warning, cyberTheme.danger, "#82ca9d"]

const SummaryGrid = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
`

const SummaryItem = styled.div`
  background: rgba(0, 242, 234, 0.05);
  border: 1px solid ${cyberTheme.border};
  padding: 1rem 1.5rem;
  flex: 1;
  min-width: 140px;
  max-width: 200px;
  text-align: center;
`

const SummaryLabel = styled.div`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.75rem;
  color: ${cyberTheme.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.25rem;
`

const SummaryValue = styled.div<{ $color?: string }>`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${p => p.$color || cyberTheme.primary};
`

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const ChartContainer = styled.div`
  background: rgba(13, 13, 13, 0.9);
  border: 1px solid ${cyberTheme.border};
  padding: 1.25rem;
  height: 350px;
`

const ChartTitle = styled.h3`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 0.85rem;
  color: ${cyberTheme.primary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 1rem;
  text-align: center;
`

const StatusBadge = styled.span<{ $attack?: boolean }>`
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
  background: ${p => p.$attack ? `${cyberTheme.danger}20` : `${cyberTheme.success}20`};
  color: ${p => p.$attack ? cyberTheme.danger : cyberTheme.success};
`

const RiskBadge = styled.span<{ $color: string }>`
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
  background: ${p => p.$color}20;
  color: ${p => p.$color};
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${cyberTheme.textMuted};
  font-family: ${cyberTheme.fontMono};
`

const tooltipStyle = {
  backgroundColor: cyberTheme.bg,
  border: `1px solid ${cyberTheme.border}`,
  color: cyberTheme.text,
  fontFamily: cyberTheme.fontMono,
}

const ModelComparisonTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null

  // Prefer the bar series entry (dataKey="accuracy")
  const accuracyEntry =
    payload.find((p: any) => p?.dataKey === "accuracy" && p?.value !== undefined) ??
    payload.find((p: any) => p?.value !== undefined) ??
    payload[0]

  const rawValue =
    accuracyEntry?.value ??
    accuracyEntry?.payload?.accuracy ??
    payload.find((p: any) => p?.payload?.accuracy !== undefined)?.payload?.accuracy ??
    0

  // If value already includes '%' (string), strip it before Number conversion.
  const cleaned =
    typeof rawValue === "string" ? rawValue.replace("%", "").trim() : rawValue

  const n = Number(cleaned)
  const formatted = Number.isFinite(n) ? `${n.toFixed(2)}%` : `${rawValue}%`
  const color =
    accuracyEntry?.color ??
    accuracyEntry?.payload?.color ??
    CHART_COLORS.find((c: string) => c) ??
    cyberTheme.primary

  return (
    <div
      style={{
        backgroundColor: "rgba(10, 10, 10, 0.92)",
        border: `1px solid ${cyberTheme.border}`,
        color: cyberTheme.text,
        fontFamily: cyberTheme.fontMono,
        padding: "10px 12px",
        borderRadius: 8,
        boxShadow: "0 0 35px rgba(0, 242, 234, 0.25)",
        zIndex: 99999,
        pointerEvents: "none",
        minWidth: 170,
      }}
    >
      <div
        style={{
          color: cyberTheme.textMuted,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontSize: "0.8rem",
          marginBottom: 6,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 10,
              height: 10,
              background: color,
              borderRadius: 2,
              boxShadow: `0 0 16px ${color}`,
              display: "inline-block",
            }}
          />
          <span style={{ color: cyberTheme.textMuted, fontWeight: 700 }}>Accuracy</span>
        </div>
        <span
          style={{
            color: cyberTheme.text,
            fontWeight: 900,
            fontSize: "1.15rem",
            textShadow: "0 0 18px rgba(0, 242, 234, 0.55)",
            whiteSpace: "nowrap",
          }}
        >
          {formatted}
        </span>
      </div>
    </div>
  )
}

function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state?.data
  const results = data?.predictions || []

  const beforeValidationData = data?.graph_before_validation || []
  const afterValidationData = data?.graph_after_validation || []
  const modelComparisonData = data?.graph_svm_vs_rf || []

  if (results.length === 0) {
    return (
      <UserPageLayout>
        <Card>
          <EmptyState>
            <PageTitle>No Results</PageTitle>
            <p style={{ margin: "1rem 0" }}>No analysis results found. Please go back to dashboard for actions.</p>
            <CyberButton onClick={() => navigate("/upload")}>Upload New File</CyberButton>
          </EmptyState>
        </Card>
      </UserPageLayout>
    )
  }

  const attackCount = results.filter((r: any) => r.status === "Attack Detected").length
  const normalCount = results.length - attackCount
  const avgConfidence = (results.reduce((acc: number, r: any) => acc + r.confidence_percentage, 0) / results.length).toFixed(1)

  const getRiskColor = (level: string) => {
    if (level === "High") return cyberTheme.danger
    if (level === "Medium") return cyberTheme.warning
    return cyberTheme.success
  }

  return (
    <UserPageLayout>
      <Card>
        <PageTitle style={{ textAlign: "center", marginBottom: "1.5rem" }}>Analysis Results</PageTitle>

        <SummaryGrid>
          <SummaryItem>
            <SummaryLabel>Total Records</SummaryLabel>
            <SummaryValue>{results.length}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Attacks Detected</SummaryLabel>
            <SummaryValue $color={cyberTheme.danger}>{attackCount}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Normal Traffic</SummaryLabel>
            <SummaryValue $color={cyberTheme.success}>{normalCount}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Avg Confidence</SummaryLabel>
            <SummaryValue>{avgConfidence}%</SummaryValue>
          </SummaryItem>
        </SummaryGrid>

        <ChartGrid>
          <ChartContainer>
            <ChartTitle>Traffic Before Validation (Protocols)</ChartTitle>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={beforeValidationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {beforeValidationData.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer>
            <ChartTitle>Traffic After Validation (Categories)</ChartTitle>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={afterValidationData}>
                <CartesianGrid strokeDasharray="3 3" stroke={cyberTheme.border} />
                <XAxis dataKey="name" stroke={cyberTheme.textMuted} />
                <YAxis stroke={cyberTheme.textMuted} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="value" fill={cyberTheme.primary} name="Traffic Count" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer style={{ gridColumn: "1 / -1" }}>
            <ChartTitle>Model Comparison: SVM vs Random Forest vs XGBoost</ChartTitle>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={modelComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke={cyberTheme.border} />
                <XAxis dataKey="name" stroke={cyberTheme.textMuted} />
                <YAxis domain={[0, 100]} stroke={cyberTheme.textMuted} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip content={ModelComparisonTooltip} />
                <Legend />
                <Bar dataKey="accuracy" name="Accuracy %">
                  {modelComparisonData.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="accuracy"
                    position="top"
                    formatter={(v: any) => `${Number(v ?? 0).toFixed(2)}%`}
                    style={{
                      fill: cyberTheme.text,
                      fontFamily: cyberTheme.fontMono,
                      fontWeight: 800,
                      textShadow: "0 0 16px rgba(0, 242, 234, 0.55)",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartGrid>

        <div style={{ overflowX: "auto" }}>
          <Table>
            <thead>
              <tr>
                <Th>Status</Th>
                <Th>Attack Type</Th>
                <Th>Category</Th>
                <Th>Risk Level</Th>
                <Th>Confidence</Th>
              </tr>
            </thead>
            <tbody>
              {results.map((row: any, i: number) => (
                <tr key={i}>
                  <Td>
                    <StatusBadge $attack={row.status === "Attack Detected"}>{row.status}</StatusBadge>
                  </Td>
                  <Td>{row.attack_type}</Td>
                  <Td>{row.attack_category}</Td>
                  <Td>
                    <RiskBadge $color={getRiskColor(row.risk_level)}>{row.risk_level}</RiskBadge>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{row.confidence_percentage}%</span>
                      <div style={{ width: "80px", height: "6px", background: "rgba(0,242,234,0.2)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${row.confidence_percentage}%`, height: "100%", background: cyberTheme.primary, borderRadius: 3 }} />
                      </div>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <ButtonGroup>
          <CyberButton onClick={() => navigate("/dashboard")}>Back to Dashboard</CyberButton>
        </ButtonGroup>
      </Card>
    </UserPageLayout>
  )
}

export default Results
