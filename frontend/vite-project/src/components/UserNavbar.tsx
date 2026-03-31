import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { logoutCurrentSession } from "../utils/authUtils"
import styled from "styled-components"
import { cyberTheme } from "../theme"
import CyberStatusModal from "./CyberStatusModal"

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
  --primary: #00f2ea;
  --secondary: #a855f7;
  --bg: #0d0d0d;
  --border: rgba(0, 242, 234, 0.3);
  --glow: rgba(0, 242, 234, 0.2);
  --textGlow: rgba(0, 242, 234, 0.4);
  --danger: #ef4444;
  font-family: "Orbitron", "Fira Code", Consolas, monospace;
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
  font-family: "Fira Code", Consolas, monospace;
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
      : 'background: var(--primary); color: #000; box-shadow: 0 0 20px rgba(0, 242, 234, 0.3);'
    }
  }
`

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(5, 5, 5, 0.95);
  border-bottom: 1px solid ${cyberTheme.border};
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  backdrop-filter: blur(8px);
`

const Brand = styled.div`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 1rem;
  font-weight: 700;
  color: ${cyberTheme.primary};
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  flex-shrink: 0;
  &:hover {
    text-shadow: 0 0 15px rgba(0, 242, 234, 0.5);
  }
`

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1 1 auto;
  min-width: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
`

const NavBtn = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  color: ${p => p.$active ? cyberTheme.primary : cyberTheme.textMuted};
  font-family: ${cyberTheme.fontMono};
  font-size: 0.8rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 2px solid ${p => p.$active ? cyberTheme.primary : "transparent"};
  transition: all 0.3s ease;
  outline: none;

  &:focus, &:focus-visible {
    outline: none !important;
  }

  &:hover {
    color: ${cyberTheme.primary};
    text-shadow: 0 0 8px rgba(0, 242, 234, 0.6);
    border-bottom: 2px solid ${p => p.$active ? cyberTheme.primary : 'rgba(0, 242, 234, 0.5)'};
  }
`

const LogoutBtn = styled.button`
  background: transparent;
  border: 2px solid ${cyberTheme.danger};
  color: ${cyberTheme.danger};
  font-family: ${cyberTheme.fontMono};
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-left: 0.5rem;
  flex-shrink: 0;
  transition: all 0.2s;
  outline: none;
  
  &:focus, &:focus-visible {
    outline: none !important;
  }
  
  &:hover {
    background: ${cyberTheme.danger};
    color: #000;
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
  }
`

function CyberConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  console.log("Rendering CyberConfirmModal");
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

function UserNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showShutdown, setShowShutdown] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = () => {
    console.log("Logout clicked");
    setShowConfirm(true);
  }

  const onConfirmShutdown = () => {
    setShowConfirm(false)
    setShowShutdown(true)
  }

  const onCancelShutdown = () => {
    setShowConfirm(false)
  }

  const onShutdownComplete = () => {
    setShowShutdown(false)
    logoutCurrentSession()
    navigate("/login")
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {showConfirm && (
        <CyberConfirmModal
          onConfirm={onConfirmShutdown}
          onCancel={onCancelShutdown}
        />
      )}
      {showShutdown && (
        <CyberStatusModal
          message="System Shutting Down"
          onClose={onShutdownComplete}
          duration={1500}
        />
      )}
    <Nav>
      <Brand onClick={() => navigate("/dashboard")}>IDS DASHBOARD</Brand>
      <NavLinks>
        <NavBtn $active={isActive("/dashboard")} onClick={() => navigate("/dashboard")}>Dashboard</NavBtn>
        <NavBtn $active={isActive("/upload")} onClick={() => navigate("/upload")}>Upload</NavBtn>
        <NavBtn $active={isActive("/history")} onClick={() => navigate("/history")}>History</NavBtn>
        <NavBtn $active={isActive("/results")} onClick={() => navigate("/results")}>Results</NavBtn>
        <NavBtn $active={isActive("/alerts")} onClick={() => navigate("/alerts")}>Alerts</NavBtn>
        <NavBtn $active={isActive("/reports")} onClick={() => navigate("/reports")}>Reports</NavBtn>
        <LogoutBtn onClick={handleLogout}>Shut Down</LogoutBtn>
      </NavLinks>
    </Nav>
    </>
  )
}

export default UserNavbar
