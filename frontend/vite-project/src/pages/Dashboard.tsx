import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Pattern from "../components/Pattern"
import styled from "styled-components"
import { cyberTheme } from "../theme"

const PageWrapper = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  overflow-x: hidden;
`

const HeroSection = styled.section`
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem 1.5rem 3rem;
  text-align: center;
`

const HeroTitle = styled.h1`
  font-family: ${cyberTheme.fontDisplay};
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  color: #a8f0ec;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin: 0 0 1.5rem;
`

const GlitchText = styled.span`
  position: relative;
  display: inline-block;

  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &::before {
    color: ${cyberTheme.secondary};
    animation: hero-glitch 2.5s infinite;
    clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
    transform: translate(-3px, -2px);
  }

  &::after {
    color: ${cyberTheme.primary};
    animation: hero-glitch 2.5s infinite reverse;
    clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
    transform: translate(3px, 2px);
  }

  &::before {
    animation-delay: 0.1s;
  }

  @keyframes hero-glitch {
    0%, 88%, 100% { opacity: 0; transform: translate(0); }
    89% { opacity: 0.9; transform: translate(-4px, 2px); }
    91% { opacity: 0; transform: translate(3px, -3px); }
    93% { opacity: 0.85; transform: translate(2px, 3px); }
    95% { opacity: 0; transform: translate(-2px, -2px); }
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after {
      animation: none;
      opacity: 0;
    }
  }
`

const HeroDesc = styled.p`
  font-family: ${cyberTheme.fontMono};
  font-size: clamp(1rem, 2vw, 1.35rem);
  line-height: 1.8;
  color: #8dd5d1;
  max-width: 700px;
  margin: 0;
  letter-spacing: 0.05em;
`

const ContentSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
`

const WelcomeCard = styled.div`
  background: ${cyberTheme.bgCard};
  border: 1px solid ${cyberTheme.border};
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 0 20px rgba(0, 242, 234, 0.08);
`

const WelcomeTitle = styled.h2`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 1.2rem;
  font-weight: 700;
  color: ${cyberTheme.primary};
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

const WelcomeSub = styled.p`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.9rem;
  color: ${cyberTheme.textMuted};
  margin: 0;
`

const SectionTitle = styled.h3`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 1rem;
  font-weight: 700;
  color: ${cyberTheme.primary};
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin: 0 0 1.25rem;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`

const StatCard = styled.div`
  background: ${cyberTheme.bgCard};
  border: 1px solid ${cyberTheme.border};
  padding: 1.25rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:hover {
    border-color: rgba(0, 242, 234, 0.4);
    box-shadow: 0 0 15px rgba(0, 242, 234, 0.1);
  }
`

const StatLabel = styled.div`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.75rem;
  color: ${cyberTheme.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
`

const StatValue = styled.div`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 1.75rem;
  font-weight: 700;
  color: ${cyberTheme.primary};
`

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
`

const ActionBtn = styled.button`
  background: transparent;
  border: 2px solid ${cyberTheme.primary};
  color: ${cyberTheme.primary};
  font-family: ${cyberTheme.fontMono};
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding: 1.25rem 1rem;
  cursor: pointer;
  transition: all 0.25s;
  &:hover {
    background: ${cyberTheme.primary};
    color: ${cyberTheme.bg};
    box-shadow: 0 0 25px rgba(0, 242, 234, 0.3);
  }
`

function Dashboard() {
  const [username, setUsername] = useState("")
  const [role, setRole] = useState("user")
  const [currentTime, setCurrentTime] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    const user = localStorage.getItem("username")
    const userRole = localStorage.getItem("role") || "user"
    const isLoggedIn = localStorage.getItem("isLoggedIn")

    if (!isLoggedIn) {
      navigate("/login")
      return
    }

    if (userRole === "admin") {
      navigate("/admin")
      return
    }

    setUsername(user || "User")
    setRole(userRole)

    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [navigate])

  const stats = [
    { label: "Files Analyzed", value: "24" },
    { label: "Threats Detected", value: "156" },
    { label: "Accuracy Rate", value: "94%" },
    { label: "Active Alerts", value: "3" }
  ]

  const actions = [
    { name: "Upload CSV", path: "/upload" },
    { name: "History", path: "/history" },
    { name: "View Alerts", path: "/alerts" },
    { name: "Reports", path: "/reports" },
    { name: "Results", path: "/results" }
  ]

  return (
    <>
      <Pattern />
      <PageWrapper>
        <HeroSection>
          <HeroTitle>
            <GlitchText data-text="Intrusion Detection System">Intrusion Detection System</GlitchText>
          </HeroTitle>
          <HeroDesc>
            Real-time network anomaly analysis. Detect threats, neutralize breaches.
            Your perimeter, secured.
          </HeroDesc>
        </HeroSection>

        <ContentSection>
          <WelcomeCard>
            <WelcomeTitle>Welcome back, {role === "admin" ? "Admin" : username}</WelcomeTitle>
            <WelcomeSub>
              User Dashboard • System Status: Active • {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </WelcomeSub>
          </WelcomeCard>

          <SectionTitle>Quick Stats</SectionTitle>
          <StatsGrid>
            {stats.map((stat, i) => (
              <StatCard key={i}>
                <StatLabel>{stat.label}</StatLabel>
                <StatValue>{stat.value}</StatValue>
              </StatCard>
            ))}
          </StatsGrid>

          <SectionTitle>Quick Actions</SectionTitle>
          <ActionsGrid>
            {actions.map((action, i) => (
              <ActionBtn key={i} onClick={() => navigate(action.path)}>
                {action.name}
              </ActionBtn>
            ))}
          </ActionsGrid>
        </ContentSection>
      </PageWrapper>
    </>
  )
}

export default Dashboard
