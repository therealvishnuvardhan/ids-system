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

// ── extra styled components ──────────────────────────────────
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`

const MetricsCard = styled.div<{ $accent: string }>`
  border: 1px solid ${p => p.$accent}55;
  background: rgba(0,0,0,0.45);
  padding: 1.25rem 1.5rem;
  backdrop-filter: blur(6px);
`

const MetricsCardTitle = styled.div<{ $accent: string }>`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 0.78rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${p => p.$accent};
  margin-bottom: 1rem;
  border-bottom: 1px solid ${p => p.$accent}44;
  padding-bottom: 0.5rem;
`

const MetricsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: ${cyberTheme.fontMono};
  font-size: 0.82rem;
`

const MTh = styled.th<{ $accent: string }>`
  padding: 0.4rem 0.75rem;
  text-align: left;
  color: ${p => p.$accent};
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  border-bottom: 1px solid ${p => p.$accent}33;
`

const MTd = styled.td`
  padding: 0.4rem 0.75rem;
  color: ${cyberTheme.text};
  border-bottom: 1px solid ${cyberTheme.border}55;
`

const ValueBar = styled.div<{ $pct: number; $accent: string }>`
  height: 10px;
  width: 100%;
  background: rgba(255,255,255,0.06);
  border-radius: 5px;
  overflow: hidden;
  position: relative;
  &::after {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${p => Math.max(p.$pct, 3)}%;
    background: linear-gradient(90deg, ${p => p.$accent}bb, ${p => p.$accent});
    border-radius: 5px;
    box-shadow: 0 0 8px ${p => p.$accent}99;
    transition: width 0.6s ease;
  }
`

const CmWrapper = styled.div`
  margin-bottom: 1.5rem;
  border: 1px solid ${cyberTheme.border};
  background: rgba(0,0,0,0.45);
  padding: 1.25rem 1.5rem;
`

const CmGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  grid-template-rows: auto 1fr 1fr;
  gap: 6px;
  max-width: 480px;
  margin: 0 auto;
`

const CmHeaderCell = styled.div<{ $color?: string }>`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.7rem;
  color: ${p => p.$color || cyberTheme.textMuted};
  text-align: center;
  padding: 4px 6px;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  justify-content: center;
`

const CmCell = styled.div<{ $intensity: number; $color: string }>`
  background: ${p => p.$color}${p => Math.round(p.$intensity * 200 + 20).toString(16).padStart(2,'0')};
  border: 1px solid ${p => p.$color}44;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  font-family: ${cyberTheme.fontMono};
  transition: transform 0.15s;
  &:hover { transform: scale(1.03); }
`

const CmValue = styled.div`
  font-size: 1.4rem;
  font-weight: 800;
  color: ${cyberTheme.text};
  font-family: ${cyberTheme.fontDisplay};
`

const CmLabel = styled.div`
  font-size: 0.65rem;
  color: ${cyberTheme.textMuted};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 4px;
`

// ── multiclass CM styled components ─────────────────────────────
const MultiCmWrapper = styled.div`
  margin-bottom: 1.5rem;
  border: 1px solid ${cyberTheme.border};
  background: rgba(0,0,0,0.45);
  padding: 1.25rem 1.5rem;
  overflow-x: auto;
`

const MultiCmGrid = styled.div<{ $cols: number }>`
  display: grid;
  grid-template-columns: auto repeat(${p => p.$cols}, 1fr);
  gap: 5px;
  min-width: ${p => p.$cols * 90 + 80}px;
  margin: 0 auto;
`

const MultiCmHeaderCell = styled.div<{ $color?: string }>`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.68rem;
  color: ${p => p.$color || cyberTheme.textMuted};
  text-align: center;
  padding: 4px 6px;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  text-transform: uppercase;
`

const MultiCmCell = styled.div<{ $intensity: number; $isDiag: boolean }>`
  background: ${p => p.$isDiag
    ? `rgba(0, 242, 234, ${0.08 + p.$intensity * 0.55})`
    : `rgba(239, 68, 68, ${0.05 + p.$intensity * 0.45})`};
  border: 1px solid ${p => p.$isDiag ? '#00f2ea33' : '#ef444433'};
  border-radius: 5px;
  padding: 0.55rem 0.35rem;
  text-align: center;
  font-family: ${cyberTheme.fontMono};
  transition: transform 0.15s;
  &:hover { transform: scale(1.05); }
`

const MultiCmValue = styled.div<{ $isDiag: boolean }>`
  font-size: 1.05rem;
  font-weight: 800;
  color: ${p => p.$isDiag ? cyberTheme.primary : '#ef4444'};
  font-family: ${cyberTheme.fontDisplay};
`

// ── component ─────────────────────────────────────────────────
function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state?.data
  const results = data?.predictions || []

  const beforeValidationData = data?.graph_before_validation || []
  const afterValidationData  = data?.graph_after_validation  || []
  const modelComparisonData  = data?.graph_svm_vs_rf         || []
  const metrics              = data?.metrics                 || {}
  const cm: number[][]       = data?.confusion_matrix        || [[0,0],[0,0]]
  const cmMulti: number[][]  = data?.confusion_matrix_multi  || []
  const cmMultiLabels: string[] = data?.cm_multi_labels || ["dos","normal","probe","r2l","u2r"]

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

  const attackCount   = results.filter((r: any) => r.status === "Attack Detected").length
  const normalCount   = results.length - attackCount
  const avgConfidence = (results.reduce((acc: number, r: any) => acc + r.confidence_percentage, 0) / results.length).toFixed(1)

  const getRiskColor = (level: string) => {
    if (level === "High")   return cyberTheme.danger
    if (level === "Medium") return cyberTheme.warning
    return cyberTheme.success
  }

  // Model metrics — value format and bar width (0–100 scale)
  const fmt = (v: number | undefined) =>
    v !== undefined ? `${(v * 100).toFixed(2)}%` : "—"
  const scaledBar = (v: number) => Math.max(2, Math.min(100, v))

  const metricColors = {
    Accuracy:   "#00f2ea",   // primary cyan
    "F1-Score": "#a855f7",   // secondary purple
    Precision:  "#10b981",   // emerald green
    Recall:     "#38bdf8",   // neon sky-blue
  } as Record<string, string>

  const svmRows = [
    { label: "Accuracy",  value: metrics.svm_accuracy,  pct: scaledBar((metrics.svm_accuracy  || 0) * 100) },
    { label: "F1-Score",  value: metrics.svm_f1,         pct: scaledBar((metrics.svm_f1         || 0) * 100) },
    { label: "Precision", value: metrics.svm_precision,  pct: scaledBar((metrics.svm_precision  || 0) * 100) },
    { label: "Recall",    value: metrics.svm_recall,     pct: scaledBar((metrics.svm_recall     || 0) * 100) },
  ]

  const xgbRows = [
    { label: "Accuracy",  value: metrics.xgb_accuracy ?? metrics.rf_accuracy,            pct: scaledBar(((metrics.xgb_accuracy ?? metrics.rf_accuracy) || 0) * 100) },
    { label: "F1-Score",  value: metrics.xgb_f1 ?? metrics.rf_f1,                        pct: scaledBar(((metrics.xgb_f1 ?? metrics.rf_f1)             || 0) * 100) },
    { label: "Precision", value: metrics.xgb_precision ?? metrics.rf_precision,           pct: scaledBar(((metrics.xgb_precision ?? metrics.rf_precision) || 0) * 100) },
    { label: "Recall",    value: metrics.xgb_recall ?? metrics.rf_recall,                 pct: scaledBar(((metrics.xgb_recall ?? metrics.rf_recall)      || 0) * 100) },
  ]

  // Confusion matrix values
  const [[tn, fp], [fn, tp]] = cm.length >= 2 ? cm : [[0,0],[0,0]]
  const total    = tn + fp + fn + tp
  const maxVal   = Math.max(tn, fp, fn, tp) || 1

  return (
    <UserPageLayout>
      <Card>
        <PageTitle style={{ textAlign: "center", marginBottom: "1.5rem" }}>Analysis Results</PageTitle>

        {/* ── Summary ── */}
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

        {/* ── Model Metrics Tables ── */}
        <MetricsGrid>
          {/* SVM */}
          <MetricsCard $accent={cyberTheme.primary}>
            <MetricsCardTitle $accent={cyberTheme.primary}>
              Model 1 — SVM&nbsp;&nbsp;|&nbsp;&nbsp;Binary Classifier
            </MetricsCardTitle>
            <MetricsTable>
              <thead>
                <tr>
                  <MTh $accent={cyberTheme.primary}>Metric</MTh>
                  <MTh $accent={cyberTheme.primary}>Value</MTh>
                  <MTh $accent={cyberTheme.primary} style={{ width: "40%" }}>Bar</MTh>
                </tr>
              </thead>
              <tbody>
                {svmRows.map(row => (
                  <tr key={row.label}>
                    <MTd style={{ color: metricColors[row.label] }}>{row.label}</MTd>
                    <MTd style={{ color: metricColors[row.label], fontWeight: 700 }}>{fmt(row.value)}</MTd>
                    <MTd>
                      <ValueBar $pct={row.pct} $accent={metricColors[row.label]} />
                    </MTd>
                  </tr>
                ))}
              </tbody>
            </MetricsTable>
            <div style={{ marginTop: "0.75rem", fontSize: "0.68rem", color: cyberTheme.textMuted, fontFamily: cyberTheme.fontMono }}>
              Task: Normal vs Attack (Binary)
            </div>
          </MetricsCard>

          {/* XGBoost */}
          <MetricsCard $accent={cyberTheme.primary}>
            <MetricsCardTitle $accent={cyberTheme.primary}>
              Model 2 — XGBoost&nbsp;&nbsp;|&nbsp;&nbsp;5-Class Categorizer
            </MetricsCardTitle>
            <MetricsTable>
              <thead>
                <tr>
                  <MTh $accent={cyberTheme.primary}>Metric</MTh>
                  <MTh $accent={cyberTheme.primary}>Value</MTh>
                  <MTh $accent={cyberTheme.primary} style={{ width: "40%" }}>Bar</MTh>
                </tr>
              </thead>
              <tbody>
                {xgbRows.map(row => (
                  <tr key={row.label}>
                    <MTd style={{ color: metricColors[row.label] }}>{row.label}</MTd>
                    <MTd style={{ color: metricColors[row.label], fontWeight: 700 }}>{fmt(row.value)}</MTd>
                    <MTd>
                      <ValueBar $pct={row.pct} $accent={metricColors[row.label]} />
                    </MTd>
                  </tr>
                ))}
              </tbody>
            </MetricsTable>
            <div style={{ marginTop: "0.75rem", fontSize: "0.68rem", color: cyberTheme.textMuted, fontFamily: cyberTheme.fontMono }}>
              Task: DoS / Probe / R2L / U2R / Normal
            </div>
          </MetricsCard>
        </MetricsGrid>

        {/* ── Confusion Matrix ── */}
        <CmWrapper>
          <ChartTitle style={{ marginBottom: "0.5rem" }}>
            Confusion Matrix — SVM Binary (Unseen KDDTest+ Data)
          </ChartTitle>
          <p style={{ textAlign:"center", fontSize:"0.72rem", color: cyberTheme.textMuted, fontFamily: cyberTheme.fontMono, marginBottom:"1.25rem" }}>
            Evaluated on {total.toLocaleString()} samples &nbsp;|&nbsp; Full KDDTest+ (complete unseen set — 22,544 samples)
          </p>
          <CmGrid>
            {/* top-left corner */}
            <CmHeaderCell />
            {/* column headers */}
            <CmHeaderCell $color={cyberTheme.success}>Pred: Normal</CmHeaderCell>
            <CmHeaderCell $color={cyberTheme.danger}>Pred: Attack</CmHeaderCell>

            {/* row 1: Actual Normal */}
            <CmHeaderCell $color={cyberTheme.success} style={{ flexDirection:"column", gap:2 }}>
              <span>Actual</span><span>Normal</span>
            </CmHeaderCell>
            <CmCell $intensity={tn / maxVal} $color={cyberTheme.success}>
              <CmValue>{tn.toLocaleString()}</CmValue>
              <CmLabel>True Negative</CmLabel>
            </CmCell>
            <CmCell $intensity={fp / maxVal} $color={cyberTheme.warning}>
              <CmValue>{fp.toLocaleString()}</CmValue>
              <CmLabel>False Positive</CmLabel>
            </CmCell>

            {/* row 2: Actual Attack */}
            <CmHeaderCell $color={cyberTheme.danger} style={{ flexDirection:"column", gap:2 }}>
              <span>Actual</span><span>Attack</span>
            </CmHeaderCell>
            <CmCell $intensity={fn / maxVal} $color={cyberTheme.warning}>
              <CmValue>{fn.toLocaleString()}</CmValue>
              <CmLabel>False Negative</CmLabel>
            </CmCell>
            <CmCell $intensity={tp / maxVal} $color={cyberTheme.danger}>
              <CmValue>{tp.toLocaleString()}</CmValue>
              <CmLabel>True Positive</CmLabel>
            </CmCell>
          </CmGrid>
        </CmWrapper>

        {/* ── XGBoost Multiclass Confusion Matrix ── */}
        {cmMulti.length > 0 && (() => {
          const n = cmMultiLabels.length
          const flatMax = Math.max(...cmMulti.flat()) || 1
          const labelColors: Record<string,string> = {
            dos:    cyberTheme.danger,
            normal: cyberTheme.success,
            probe:  cyberTheme.warning,
            r2l:    "#a855f7",
            u2r:    "#38bdf8",
          }
          return (
            <MultiCmWrapper>
              <ChartTitle style={{ marginBottom: "0.5rem" }}>
                Confusion Matrix — XGBoost 5-Class (Unseen KDDTest+ Data)
              </ChartTitle>
              <p style={{ textAlign:"center", fontSize:"0.72rem", color: cyberTheme.textMuted, fontFamily: cyberTheme.fontMono, marginBottom:"1.25rem" }}>
                Rows = Actual class &nbsp;|&nbsp; Columns = Predicted class &nbsp;|&nbsp; Diagonal = Correct predictions
              </p>
              <MultiCmGrid $cols={n}>
                {/* top-left corner */}
                <MultiCmHeaderCell />
                {/* column headers */}
                {cmMultiLabels.map((lbl, ci) => (
                  <MultiCmHeaderCell key={`ch-${ci}`} $color={labelColors[lbl] || cyberTheme.primary}>
                    {lbl.toUpperCase()}
                  </MultiCmHeaderCell>
                ))}

                {/* rows */}
                {cmMulti.map((row, ri) => (
                  <>
                    <MultiCmHeaderCell key={`rh-${ri}`} $color={labelColors[cmMultiLabels[ri]] || cyberTheme.primary}>
                      {cmMultiLabels[ri]?.toUpperCase()}
                    </MultiCmHeaderCell>
                    {row.map((val, ci) => (
                      <MultiCmCell key={`cell-${ri}-${ci}`} $intensity={val / flatMax} $isDiag={ri === ci}>
                        <MultiCmValue $isDiag={ri === ci}>{val.toLocaleString()}</MultiCmValue>
                      </MultiCmCell>
                    ))}
                  </>
                ))}
              </MultiCmGrid>
              <div style={{ display:"flex", gap:"1.5rem", justifyContent:"center", marginTop:"1rem", flexWrap:"wrap" }}>
                {cmMultiLabels.map(lbl => (
                  <div key={lbl} style={{ display:"flex", alignItems:"center", gap:6, fontFamily: cyberTheme.fontMono, fontSize:"0.7rem", color: cyberTheme.textMuted }}>
                    <span style={{ width:10, height:10, borderRadius:2, background: labelColors[lbl] || cyberTheme.primary, display:"inline-block" }} />
                    {lbl.toUpperCase()}
                  </div>
                ))}
              </div>
            </MultiCmWrapper>
          )
        })()}

        {/* ── Charts ── */}
        <ChartGrid>
          <ChartContainer>
            <ChartTitle>Traffic Before Validation (Protocols)</ChartTitle>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={beforeValidationData}
                  cx="50%" cy="50%" outerRadius={90}
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
                <XAxis dataKey="name" stroke={cyberTheme.textMuted} tick={{ fontSize: 11 }} />
                <YAxis stroke={cyberTheme.textMuted} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Traffic Count">
                  {afterValidationData.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{ fill: cyberTheme.text, fontFamily: cyberTheme.fontMono, fontSize: 11, fontWeight: 700 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer style={{ gridColumn: "1 / -1" }}>
            <ChartTitle>Model Comparison: SVM vs XGBoost</ChartTitle>
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
                    style={{ fill: cyberTheme.text, fontFamily: cyberTheme.fontMono, fontWeight: 800 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartGrid>

        {/* ── Predictions Table ── */}
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

