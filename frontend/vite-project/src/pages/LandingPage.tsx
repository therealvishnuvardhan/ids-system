import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled, { keyframes, css } from "styled-components"
import CyberStatusModal from "../components/CyberStatusModal"

/* ─── Green palette ──────────────────────────────────────────── */
const G = {
  main:    "rgb(46, 213, 115)",
  mainRgb: "46, 213, 115",
  bg:      "rgba(46, 213, 116, 0.36)",
  pattern: "rgba(46, 213, 116, 0.073)",
  dim:     "rgba(46, 213, 115, 0.55)",
  glow:    "rgba(46, 213, 115, 0.35)",
}

/* ─── Keyframes ──────────────────────────────────────────────── */

const flicker = keyframes`
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    opacity: 1;
    text-shadow: 0 0 30px ${G.main}, 0 0 60px ${G.dim}, 0 0 100px ${G.glow};
  }
  20%, 24%, 55% { opacity: 0.4; text-shadow: none; }
`

const glitchTop = keyframes`
  0%   { clip-path: inset(0 0 95% 0); transform: translate(-4px, 0); }
  20%  { clip-path: inset(30% 0 50% 0); transform: translate(4px, 0); }
  40%  { clip-path: inset(60% 0 15% 0); transform: translate(-2px, 0); }
  60%  { clip-path: inset(10% 0 80% 0); transform: translate(3px, 0); }
  80%  { clip-path: inset(75% 0 5% 0);  transform: translate(-1px, 0); }
  100% { clip-path: inset(0 0 95% 0);   transform: translate(0, 0); }
`

const glitchBot = keyframes`
  0%   { clip-path: inset(80% 0 0 0); transform: translate(4px, 0); }
  20%  { clip-path: inset(50% 0 30% 0); transform: translate(-4px, 0); }
  40%  { clip-path: inset(20% 0 60% 0); transform: translate(2px, 0); }
  60%  { clip-path: inset(85% 0 0 0);   transform: translate(-3px, 0); }
  80%  { clip-path: inset(10% 0 70% 0); transform: translate(1px, 0); }
  100% { clip-path: inset(80% 0 0 0);   transform: translate(0, 0); }
`

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
`

const scanline = keyframes`
  0%   { top: -5%; }
  100% { top: 105%; }
`

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(${G.mainRgb}, 0.5); }
  50%       { box-shadow: 0 0 0 10px rgba(${G.mainRgb}, 0); }
`

/* ─── Layout ─────────────────────────────────────────────────── */

const Wrapper = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
`

const Scanline = styled.div`
  position: absolute;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(transparent, rgba(${G.mainRgb}, 0.18), transparent);
  animation: ${scanline} 6s linear infinite;
  pointer-events: none;
  z-index: 10;
`

const Vignette = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%);
  pointer-events: none;
  z-index: 1;
`

const Content = styled.div`
  position: relative;
  z-index: 5;
  text-align: center;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
`

/* ─── Title block ────────────────────────────────────────────── */

const BrandLabel = styled.div`
  font-family: "Fira Code", monospace;
  font-size: 0.72rem;
  color: ${G.dim};
  letter-spacing: 0.45em;
  text-transform: uppercase;
  opacity: 0;
  animation: ${fadeUp} 0.5s ease forwards 0.3s;
`

const GlitchTitle = styled.h1`
  position: relative;
  font-family: "Dela Gothic One", "Noto Serif JP", sans-serif;
  font-size: clamp(1.6rem, 5vw, 3.8rem);
  font-weight: 900;
  color: ${G.main};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.1;
  margin: 0.6rem 0 0.1rem;
  opacity: 0;
  animation: ${fadeUp} 0.7s ease forwards 0.55s, ${flicker} 10s infinite 4s;

  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
  }
  &::before {
    color: #ff4d6d;
    animation: ${glitchTop} 4s infinite linear;
    opacity: 0.65;
  }
  &::after {
    color: ${G.main};
    animation: ${glitchBot} 4s infinite linear 0.6s;
    opacity: 0.65;
  }
`

const SubTitle = styled.div`
  font-family: "Orbitron", sans-serif;
  font-size: clamp(0.65rem, 2vw, 0.95rem);
  font-weight: 600;
  color: rgba(${G.mainRgb}, 0.5);
  letter-spacing: 0.28em;
  text-transform: uppercase;
  opacity: 0;
  animation: ${fadeUp} 0.6s ease forwards 0.75s;
  margin-bottom: 0.5rem;
`

const Divider = styled.div`
  width: 200px;
  height: 1px;
  background: linear-gradient(90deg, transparent, ${G.main}, transparent);
  margin: 1rem auto;
  opacity: 0;
  animation: ${fadeUp} 0.5s ease forwards 0.95s;
`

/* ─── Quote ──────────────────────────────────────────────────── */

const QuoteBlock = styled.div`
  opacity: 0;
  animation: ${fadeUp} 0.7s ease forwards 1.1s;
  max-width: 480px;
  text-align: center;
`

const Quote = styled.p`
  font-family: "Fira Code", monospace;
  font-size: clamp(0.75rem, 1.8vw, 0.9rem);
  color: rgba(229, 229, 229, 0.65);
  font-style: italic;
  line-height: 1.75;
  margin: 0 0 0.4rem;
  &::before { content: '"'; color: ${G.main}; }
  &::after  { content: '"'; color: ${G.main}; }
`

const QuoteCaption = styled.div`
  font-family: "Fira Code", monospace;
  font-size: 0.68rem;
  color: rgba(${G.mainRgb}, 0.45);
  letter-spacing: 0.15em;
  text-transform: uppercase;
`

/* ─── Special green grid button ─────────────────────────────── */

const EnterBtn = styled.button`
  --main-color: rgb(46, 213, 115);
  --main-bg-color: rgba(46, 213, 116, 0.36);
  --pattern-color: rgba(46, 213, 116, 0.073);

  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.4rem;
  font-family: "Orbitron", sans-serif;
  font-weight: 700;
  font-size: clamp(0.75rem, 2vw, 1rem);
  color: var(--main-color);
  padding: 1rem 3rem;

  background:
    radial-gradient(circle, var(--main-bg-color) 0%, rgba(0,0,0,0) 95%),
    linear-gradient(var(--pattern-color) 1px, transparent 1px),
    linear-gradient(to right, var(--pattern-color) 1px, transparent 1px);
  background-size: cover, 15px 15px, 15px 15px;
  background-position: center center, center center, center center;

  border-image: radial-gradient(circle, var(--main-color) 0%, rgba(0,0,0,0) 100%) 1;
  border-width: 1px 0 1px 0;
  border-style: solid;

  transition: background-size 0.2s ease-in-out, filter 0.2s;
  animation: ${pulse} 2.5s ease-in-out infinite 2s;

  &:hover {
    background-size: cover, 10px 10px, 10px 10px;
    filter: brightness(1.15) drop-shadow(0 0 14px rgb(46, 213, 115));
  }
  &:active { filter: hue-rotate(250deg); }
`

const AboutBtn = styled.button`
  font-family: "Orbitron", sans-serif;
  font-size: clamp(0.65rem, 1.8vw, 0.82rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${G.dim};
  background: transparent;
  border: 1px solid rgba(${G.mainRgb}, 0.35);
  padding: 0.75rem 2rem;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;

  &:hover {
    color: ${G.main};
    border-color: ${G.main};
    background: rgba(${G.mainRgb}, 0.07);
    filter: drop-shadow(0 0 8px rgba(${G.mainRgb}, 0.4));
  }
`

const ButtonRow = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1.75rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  opacity: 0;
  animation: ${fadeUp} 0.7s ease forwards 1.4s;
`

/* ─── Bottom status ──────────────────────────────────────────── */

const StatusBar = styled.div`
  position: absolute;
  bottom: 1.75rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: "Fira Code", monospace;
  font-size: 0.62rem;
  color: rgba(${G.mainRgb}, 0.45);
  letter-spacing: 0.15em;
  white-space: nowrap;
  opacity: 0;
  animation: ${fadeUp} 0.5s ease forwards 1.8s;
`

const StatusDot = styled.span<{ $active?: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${p => p.$active ? G.main : G.dim};
  box-shadow: 0 0 6px ${p => p.$active ? G.main : G.dim};
  animation: ${p => p.$active ? css`${pulse} 1.5s infinite` : "none"};
  flex-shrink: 0;
`

const VersionBadge = styled.div`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 5;
  font-family: "Fira Code", monospace;
  font-size: 0.58rem;
  color: rgba(${G.mainRgb}, 0.35);
  letter-spacing: 0.2em;
  border: 1px solid rgba(${G.mainRgb}, 0.15);
  padding: 0.28rem 0.65rem;
`

/* ─── Component ──────────────────────────────────────────────── */

export default function LandingPage() {
  const navigate = useNavigate()
  const [_status] = useState("ONLINE")
  const [statusModal, setStatusModal] = useState<string | null>(null)

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn")) navigate("/dashboard")
  }, [navigate])

  const handleEnter = () => {
    setStatusModal("ENTERING AUTHENTICATION PANEL...")
    setTimeout(() => {
      navigate("/login")
    }, 1800)
  }

  return (
    <Wrapper>
      {statusModal && (
        <CyberStatusModal
          message={statusModal}
          onClose={() => setStatusModal(null)}
          duration={1800}
        />
      )}
      <Scanline />
      <Vignette />
      <VersionBadge>SYS v2.4.1 &nbsp;|&nbsp; NSL-KDD</VersionBadge>

      <Content>
        <BrandLabel>⬡ &nbsp; NETGUARD IDS &nbsp; ⬡</BrandLabel>

        <GlitchTitle data-text="INTRUSION DETECTION SYSTEM">
          INTRUSION DETECTION SYSTEM
        </GlitchTitle>

        <SubTitle>AI-Powered Network Threat Intelligence</SubTitle>

        <Divider />

        <QuoteBlock>
          <Quote>
            The quieter you become, the more you are able to hear.
          </Quote>
          <QuoteCaption>— Network Security Axiom</QuoteCaption>
        </QuoteBlock>

        <ButtonRow>
          <EnterBtn onClick={handleEnter}>
            ▶ &nbsp; Enter System
          </EnterBtn>
          <AboutBtn onClick={() => navigate("/about")}>
            ⬡ &nbsp; About
          </AboutBtn>
        </ButtonRow>
      </Content>

      <StatusBar>
        <StatusDot $active />
        SYSTEM: {_status}
        &nbsp;|&nbsp;
        <StatusDot />
        MODELS LOADED
        &nbsp;|&nbsp;
        <StatusDot />
        NSL-KDD READY
      </StatusBar>
    </Wrapper>
  )
}
