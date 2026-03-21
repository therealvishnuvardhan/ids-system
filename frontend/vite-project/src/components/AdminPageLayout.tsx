import type { ReactNode } from "react"
import styled, { createGlobalStyle } from "styled-components"
import Circuit from "./Circuit"
import { adminTheme } from "../adminTheme"

const SIDEBAR_WIDTH = 240

const AdminGlitchStyles = createGlobalStyle`
  @keyframes admin-glitch-main {
    0%, 88%, 100% { opacity: 0; transform: translate(0); }
    89% { opacity: 0.9; transform: translate(-4px, 2px); }
    91% { opacity: 0; transform: translate(3px, -3px); }
    93% { opacity: 0.85; transform: translate(2px, 3px); }
    95% { opacity: 0; transform: translate(-2px, -2px); }
  }
  @keyframes admin-glitch-alt {
    0%, 85%, 100% { opacity: 0; transform: translate(0); }
    86% { opacity: 0.95; transform: translate(4px, -2px); }
    88% { opacity: 0; transform: translate(-3px, 3px); }
    90% { opacity: 0.9; transform: translate(-2px, -3px); }
    92% { opacity: 0; transform: translate(2px, 2px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .admin-glitch span::before,
    .admin-glitch span::after {
      animation: none !important;
      opacity: 0 !important;
    }
  }
`

const CircuitWrapper = styled.div`
  position: fixed;
  inset: 0;
  left: ${SIDEBAR_WIDTH}px;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at 50% 0%,
      rgba(124, 58, 237, 0.08) 0%,
      transparent 50%
    );
    pointer-events: none;
  }
`

const CircuitInner = styled.div`
  position: absolute;
  inset: 0;
  min-width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(1.8) rotate(-3deg);
`

const PageWrapper = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  overflow-x: hidden;
  margin-left: ${SIDEBAR_WIDTH}px;
`

const HeroSection = styled.section`
  min-height: 36vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem 1.5rem 2rem;
  text-align: center;
`

const WelcomeTitle = styled.h1`
  font-family: ${adminTheme.fontDisplay};
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: ${adminTheme.primary};
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 0 0 1.25rem;
`

const Description = styled.p`
  font-family: ${adminTheme.fontMono};
  font-size: clamp(0.9rem, 1.8vw, 1.1rem);
  line-height: 1.8;
  color: ${adminTheme.textMuted};
  max-width: 580px;
  margin: 0;
  letter-spacing: 0.04em;
`

const GlitchSpan = styled.span`
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
    color: ${adminTheme.secondary};
    animation: admin-glitch-main 2.8s infinite;
    clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
    transform: translate(-3px, -2px);
  }

  &::after {
    color: ${adminTheme.accent};
    animation: admin-glitch-alt 3s infinite;
    clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
    transform: translate(3px, 2px);
  }
`

const ContentSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
`

type AdminPageLayoutProps = {
  children: ReactNode
  title?: string
  description?: string
  showHero?: boolean
}

function AdminPageLayout({ children, title, description, showHero = true }: AdminPageLayoutProps) {
  return (
    <>
      <AdminGlitchStyles />
      <CircuitWrapper>
        <CircuitInner>
          <Circuit width={50} height={30} size={18} />
        </CircuitInner>
      </CircuitWrapper>
      <PageWrapper>
        {showHero && (
          <HeroSection>
            <WelcomeTitle>
              <GlitchSpan className="admin-glitch" data-text={title || "Admin Control Panel"}>
                {title || "Admin Control Panel"}
              </GlitchSpan>
            </WelcomeTitle>
            <Description>
              {description || "Manage your intrusion detection system from this secure interface."}
            </Description>
          </HeroSection>
        )}
        <ContentSection>{children}</ContentSection>
      </PageWrapper>
    </>
  )
}

export default AdminPageLayout
