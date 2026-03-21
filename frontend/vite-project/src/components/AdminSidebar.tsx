import { Link, useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import styled from "styled-components"
import { logoutCurrentSession } from "../utils/authUtils"
import { adminTheme } from "../adminTheme"

const Sidebar = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  z-index: 100;
  background: rgba(15, 8, 24, 0.97);
  border-right: 1px solid ${adminTheme.border};
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(12px);
`

const Brand = styled.div`
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid ${adminTheme.border};
  font-family: ${adminTheme.fontDisplay};
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.15em;
  color: ${adminTheme.primary};
  text-transform: uppercase;
`

const NavLinks = styled.nav`
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: block;
  padding: 0.85rem 1.25rem;
  margin: 0 0.75rem;
  color: ${(p) => (p.$active ? adminTheme.primary : adminTheme.textMuted)};
  text-decoration: none;
  font-family: ${adminTheme.fontMono};
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all 0.2s;
  border-left: 2px solid ${(p) => (p.$active ? adminTheme.primary : "transparent")};
  background: ${(p) => (p.$active ? `rgba(124, 58, 237, 0.12)` : "transparent")};

  &:hover {
    color: ${adminTheme.primary};
    background: rgba(124, 58, 237, 0.08);
  }
`

const ShutDownBtn = styled.button`
  margin: 1rem 1rem 1.5rem;
  padding: 0.9rem 1.25rem;
  background: transparent;
  border: 1px solid ${adminTheme.danger};
  color: ${adminTheme.danger};
  font-family: ${adminTheme.fontMono};
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    background: ${adminTheme.danger};
    color: #fff;
    box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
  }
`

const ShutdownOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: ${adminTheme.primary};
  font-family: ${adminTheme.fontDisplay};
  font-size: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10000;
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

const ConfirmCard = styled.div`
  --primary: ${adminTheme.primary};
  --secondary: ${adminTheme.secondary};
  --bg: ${adminTheme.bg};
  --border: ${adminTheme.border};
  --glow: rgba(124, 58, 237, 0.2);
  --textGlow: rgba(167, 139, 250, 0.4);
  --danger: ${adminTheme.danger};
  font-family: ${adminTheme.fontDisplay};
  background: var(--bg);
  border: 1px solid var(--border);
  box-shadow: 0 0 30px var(--glow), inset 0 0 15px rgba(0, 0, 0, 0.5);
  padding: 2rem 2.5rem;
  min-width: 380px;
  text-align: center;
  animation: cardIn 0.3s ease;
  @keyframes cardIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`

const ConfirmText = styled.div`
  position: relative;
  color: var(--primary);
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  text-shadow: 0 0 15px var(--textGlow);
  margin-bottom: 2rem;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`

const ConfirmButton = styled.button<{ $variant: 'yes' | 'no' }>`
  background: ${p => p.$variant === 'yes' ? 'var(--danger)' : 'transparent'};
  border: 2px solid ${p => p.$variant === 'yes' ? 'var(--danger)' : 'var(--primary)'};
  color: ${p => p.$variant === 'yes' ? '#000' : 'var(--primary)'};
  font-family: ${adminTheme.fontMono};
  font-size: 0.9rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.2s;
  min-width: 100px;

  &:hover {
    ${p => p.$variant === 'yes' 
      ? 'box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);'
      : `background: var(--primary); color: ${adminTheme.bg}; box-shadow: 0 0 20px rgba(167, 139, 250, 0.3);`
    }
  }
`

const links = [
  { to: "/admin", label: "Home" },
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/config", label: "Config" },
  { to: "/admin/audit", label: "Audit" },
  { to: "/admin/sessions", label: "Sessions" },
  { to: "/admin/performance", label: "Performance" },
] as const

function CyberConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  console.log("Rendering Admin Sidebar CyberConfirmModal");
  return (
    <Overlay onClick={onCancel}>
      <ConfirmCard onClick={(e) => e.stopPropagation()}>
        <ConfirmText>ARE YOU SURE YOU WANT TO SHUT DOWN THE SYSTEM?</ConfirmText>
        <ButtonContainer>
          <ConfirmButton $variant="yes" onClick={onConfirm}>
            YES
          </ConfirmButton>
          <ConfirmButton $variant="no" onClick={onCancel}>
            NO
          </ConfirmButton>
        </ButtonContainer>
      </ConfirmCard>
    </Overlay>
  )
}

function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isShuttingDown, setIsShuttingDown] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleShutDown = () => {
    console.log("Admin sidebar shutdown clicked");
    setShowConfirm(true)
  }

  const onConfirmShutdown = () => {
    console.log("Admin sidebar shutdown confirmed");
    setShowConfirm(false)
    setIsShuttingDown(true)
    setTimeout(() => {
      logoutCurrentSession()
      navigate("/login")
    }, 3000) // 3 seconds delay
  }

  const onCancelShutdown = () => {
    console.log("Admin sidebar shutdown cancelled");
    setShowConfirm(false)
  }

  return (
    <>
      {showConfirm && (
        <CyberConfirmModal
          onConfirm={onConfirmShutdown}
          onCancel={onCancelShutdown}
        />
      )}
      <Sidebar>
        <Brand>Admin Portal</Brand>
        <NavLinks>
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} $active={location.pathname === to}>
              {label}
            </NavLink>
          ))}
        </NavLinks>
        <ShutDownBtn onClick={handleShutDown}>Shut down</ShutDownBtn>
      </Sidebar>
      {isShuttingDown && <ShutdownOverlay>System shutting down...</ShutdownOverlay>}
    </>
  )
}

export default AdminSidebar
