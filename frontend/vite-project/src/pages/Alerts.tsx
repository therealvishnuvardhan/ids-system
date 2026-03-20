import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import UserPageLayout from "../components/UserPageLayout"
import styled from "styled-components"
import { cyberTheme } from "../theme"
import { PageTitle, Card, CyberButton, CyberButtonDanger, Table, Th, Td } from "../components/UserPageStyles"

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.25rem;
`

const AlertBadge = styled.span`
  background: ${cyberTheme.danger};
  color: #000;
  padding: 0.5rem 1rem;
  font-family: ${cyberTheme.fontMono};
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
`

const StatCard = styled.div`
  background: rgba(0, 242, 234, 0.05);
  border: 1px solid ${cyberTheme.border};
  padding: 1.25rem;
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

const Filters = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`

const FilterBtn = styled.button<{ $active?: boolean }>`
  padding: 0.6rem 1.25rem;
  background: ${p => p.$active ? cyberTheme.primary : "transparent"};
  border: 2px solid ${p => p.$active ? cyberTheme.primary : cyberTheme.border};
  color: ${p => p.$active ? cyberTheme.bg : cyberTheme.textMuted};
  font-family: ${cyberTheme.fontMono};
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: ${cyberTheme.primary};
    color: ${cyberTheme.primary};
  }
`

const RiskBadge = styled.span<{ $color: string }>`
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: ${p => p.$color}20;
  color: ${p => p.$color};
`

const Dot = styled.span<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${p => p.$color};
`

const ActionCell = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const ViewBtn = styled(CyberButton)`
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  border-color: ${cyberTheme.primary};
  color: ${cyberTheme.primary};
  &:hover:not(:disabled) {
    background: ${cyberTheme.primary};
    color: ${cyberTheme.bg};
  }
`

const ResolveBtn = styled(CyberButton)`
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  border-color: ${cyberTheme.success};
  color: ${cyberTheme.success};
  &:hover:not(:disabled) {
    background: ${cyberTheme.success};
    color: ${cyberTheme.bg};
  }
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: ${cyberTheme.textMuted};
  font-family: ${cyberTheme.fontMono};
`

const TableCard = styled(Card)`
  padding: 1.5rem;
`

const StyledTh = styled(Th)`
  padding: 1rem 1.25rem;
`

const StyledTd = styled(Td)`
  padding: 1rem 1.25rem;
  vertical-align: middle;
`

function Alerts() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("all")
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    const mockAlerts = [
      { id: 1, attack: "neptune", category: "DoS", risk: "High", timestamp: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString(), source_ip: "192.168.1.105", destination_ip: "192.168.1.1", protocol: "TCP", port: 80, status: "active", confidence: 98 },
      { id: 2, attack: "satan", category: "Probe", risk: "Medium", timestamp: new Date(Date.now() - 300000).toLocaleTimeString(), date: new Date().toLocaleDateString(), source_ip: "10.0.0.23", destination_ip: "192.168.1.100", protocol: "UDP", port: 53, status: "active", confidence: 76 },
      { id: 3, attack: "ipsweep", category: "Probe", risk: "Low", timestamp: new Date(Date.now() - 600000).toLocaleTimeString(), date: new Date().toLocaleDateString(), source_ip: "172.16.0.45", destination_ip: "192.168.1.50", protocol: "ICMP", port: 0, status: "resolved", confidence: 45 },
      { id: 4, attack: "guess_passwd", category: "Unauthorized Access", risk: "High", timestamp: new Date(Date.now() - 900000).toLocaleTimeString(), date: new Date().toLocaleDateString(), source_ip: "192.168.1.200", destination_ip: "192.168.1.10", protocol: "SSH", port: 22, status: "active", confidence: 95 },
      { id: 5, attack: "smurf", category: "DoS", risk: "Medium", timestamp: new Date(Date.now() - 1200000).toLocaleTimeString(), date: new Date().toLocaleDateString(), source_ip: "10.0.0.67", destination_ip: "192.168.1.1", protocol: "ICMP", port: 0, status: "investigating", confidence: 82 },
    ]
    setAlerts(mockAlerts)
  }, [])

  const getFilteredAlerts = () => {
    if (filter === "all") return alerts
    return alerts.filter(a => a.risk.toLowerCase() === filter)
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high": return cyberTheme.danger
      case "medium": return cyberTheme.warning
      case "low": return cyberTheme.success
      default: return cyberTheme.textMuted
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return cyberTheme.danger
      case "investigating": return cyberTheme.warning
      case "resolved": return cyberTheme.success
      default: return cyberTheme.textMuted
    }
  }

  const filteredAlerts = getFilteredAlerts()
  const highRiskCount = alerts.filter(a => a.risk === "High").length
  const mediumRiskCount = alerts.filter(a => a.risk === "Medium").length
  const lowRiskCount = alerts.filter(a => a.risk === "Low").length
  const activeCount = alerts.filter(a => a.status === "active").length

  return (
    <UserPageLayout>
      <Header>
        <PageTitle>Security Alerts</PageTitle>
        {activeCount > 0 && (
          <AlertBadge>{activeCount} Active Alert{activeCount > 1 ? "s" : ""}</AlertBadge>
        )}
      </Header>

      <StatsGrid>
        <StatCard>
          <StatLabel>Total Alerts</StatLabel>
          <StatValue>{alerts.length}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>High Risk</StatLabel>
          <StatValue $color={cyberTheme.danger}>{highRiskCount}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Medium Risk</StatLabel>
          <StatValue $color={cyberTheme.warning}>{mediumRiskCount}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Low Risk</StatLabel>
          <StatValue $color={cyberTheme.success}>{lowRiskCount}</StatValue>
        </StatCard>
      </StatsGrid>

      <Filters>
        <FilterBtn $active={filter === "all"} onClick={() => setFilter("all")}>All</FilterBtn>
        <FilterBtn $active={filter === "high"} onClick={() => setFilter("high")}>High</FilterBtn>
        <FilterBtn $active={filter === "medium"} onClick={() => setFilter("medium")}>Medium</FilterBtn>
        <FilterBtn $active={filter === "low"} onClick={() => setFilter("low")}>Low</FilterBtn>
      </Filters>

      {filteredAlerts.length > 0 ? (
        <TableCard>
          <div style={{ overflowX: "auto" }}>
            <Table>
              <thead>
                <tr>
                  <StyledTh>Time</StyledTh>
                  <StyledTh>Attack</StyledTh>
                  <StyledTh>Category</StyledTh>
                  <StyledTh>Risk</StyledTh>
                  <StyledTh>Source IP</StyledTh>
                  <StyledTh>Destination</StyledTh>
                  <StyledTh>Protocol</StyledTh>
                  <StyledTh>Status</StyledTh>
                  <StyledTh>Actions</StyledTh>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <StyledTd>
                      <div>{alert.date}</div>
                      <div style={{ fontSize: "0.8rem", color: cyberTheme.textMuted }}>{alert.timestamp}</div>
                    </StyledTd>
                    <StyledTd>
                      <strong>{alert.attack}</strong>
                      <div style={{ fontSize: "0.8rem", color: cyberTheme.textMuted }}>{alert.confidence}% confidence</div>
                    </StyledTd>
                    <StyledTd>{alert.category}</StyledTd>
                    <StyledTd>
                      <RiskBadge $color={getRiskColor(alert.risk)}>
                        <Dot $color={getRiskColor(alert.risk)} />
                        {alert.risk}
                      </RiskBadge>
                    </StyledTd>
                    <StyledTd>{alert.source_ip}</StyledTd>
                    <StyledTd>
                      <div>{alert.destination_ip}</div>
                      <div style={{ fontSize: "0.8rem", color: cyberTheme.textMuted }}>Port: {alert.port}</div>
                    </StyledTd>
                    <StyledTd>{alert.protocol}</StyledTd>
                    <StyledTd>
                      <RiskBadge $color={getStatusColor(alert.status)}>{alert.status}</RiskBadge>
                    </StyledTd>
                    <StyledTd>
                      <ActionCell>
                        <ViewBtn>View</ViewBtn>
                        {alert.status !== "resolved" && <ResolveBtn>Resolve</ResolveBtn>}
                      </ActionCell>
                    </StyledTd>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </TableCard>
      ) : (
        <Card>
          <EmptyState>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>🛡</div>
            <h3 style={{ color: cyberTheme.primary, marginBottom: "0.5rem" }}>No Alerts Found</h3>
            {filter === "all" ? "No security alerts have been generated yet." : `No ${filter} risk alerts found.`}
          </EmptyState>
        </Card>
      )}

      <ButtonGroup>
        <CyberButtonDanger onClick={() => navigate("/dashboard")}>Back to Dashboard</CyberButtonDanger>
        <CyberButton onClick={() => navigate("/upload")}>Analyze New File</CyberButton>
      </ButtonGroup>
    </UserPageLayout>
  )
}

export default Alerts
