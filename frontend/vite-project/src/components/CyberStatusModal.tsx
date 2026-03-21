import { useEffect } from "react"
import styled from "styled-components"

type CyberStatusModalProps = {
  message: string
  onClose: () => void
  duration?: number
  variant?: "admin" | "danger"
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`

const Card = styled.div<{ $variant?: "admin" | "danger" }>`
  --primary: ${(p) => (p.$variant === "admin" ? "#a78bfa" : p.$variant === "danger" ? "#ef4444" : "#00f2ea")};
  --secondary: ${(p) => (p.$variant === "admin" ? "#7c3aed" : p.$variant === "danger" ? "#f59e0b" : "#a855f7")};
  --bg: ${(p) => (p.$variant === "admin" ? "#0a0612" : p.$variant === "danger" ? "#1f0411" : "#0d0d0d")};
  --border: ${(p) => (p.$variant === "admin" ? "rgba(124, 58, 237, 0.4)" : p.$variant === "danger" ? "rgba(239, 68, 68, 0.5)" : "rgba(0, 242, 234, 0.3)")};
  --glow: ${(p) => (p.$variant === "admin" ? "rgba(124, 58, 237, 0.25)" : p.$variant === "danger" ? "rgba(239, 68, 68, 0.3)" : "rgba(0, 242, 234, 0.2)")};
  --textGlow: ${(p) => (p.$variant === "admin" ? "rgba(167, 139, 250, 0.5)" : p.$variant === "danger" ? "rgba(239, 68, 68, 0.55)" : "rgba(0, 242, 234, 0.4)")};
  font-family: "Orbitron", "Fira Code", Consolas, monospace;
  background: var(--bg);
  border: 1px solid var(--border);
  box-shadow: 0 0 30px var(--glow), inset 0 0 15px rgba(0, 0, 0, 0.5);
  padding: 2rem 2.5rem;
  min-width: 320px;
  text-align: center;
  animation: cardIn 0.3s ease;
  @keyframes cardIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`

const StatusText = styled.div`
  position: relative;
  color: var(--primary);
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  text-shadow: 0 0 15px var(--textGlow);
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
    color: var(--secondary);
    animation: status-glitch 2s infinite;
    clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%);
    transform: translate(-2px, -1px);
  }

  &::after {
    color: var(--primary);
    animation: status-glitch 2s infinite reverse;
    clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
    transform: translate(2px, 1px);
  }

  &::before {
    animation-delay: 0.05s;
  }

  @keyframes status-glitch {
    0%, 90%, 100% { opacity: 0; transform: translate(0); }
    92% { opacity: 0.9; transform: translate(-3px, 1px); }
    94% { opacity: 0; transform: translate(2px, -2px); }
    96% { opacity: 0.85; transform: translate(-1px, 2px); }
    98% { opacity: 0; transform: translate(1px, -1px); }
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after {
      animation: none;
      opacity: 0;
    }
  }
`

function CyberStatusModal({ message, onClose, duration = 1800, variant }: CyberStatusModalProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return (
    <Overlay onClick={onClose}>
      <Card $variant={variant} onClick={(e) => e.stopPropagation()}>
        <StatusText>
          <GlitchText data-text={message}>{message}</GlitchText>
        </StatusText>
      </Card>
    </Overlay>
  )
}

export default CyberStatusModal
