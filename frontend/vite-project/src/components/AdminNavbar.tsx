import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import styled from "styled-components"
import { logoutCurrentSession } from "../utils/authUtils"
import { adminTheme } from "../adminTheme"
import CyberStatusModal from "./CyberStatusModal"

const Nav = styled.nav`
  position: relative;
  z-index: 10;
  background: rgba(5, 5, 8, 0.95);
  border-bottom: 1px solid ${adminTheme.border};
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  backdrop-filter: blur(8px);
`

const Brand = styled.span`
  color: ${adminTheme.primary};
  font-family: ${adminTheme.fontDisplay};
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.1em;
  margin-right: 24px;
`

const Links = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const NavLink = styled(Link)`
  color: ${adminTheme.textMuted};
  text-decoration: none;
  font-family: ${adminTheme.fontMono};
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s;
  &:hover {
    color: ${adminTheme.primary};
    background: rgba(249, 115, 22, 0.1);
  }
`

const LogoutBtn = styled.button`
  background: ${adminTheme.accent};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-family: ${adminTheme.fontMono};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #dc2626;
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
  }
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

function CyberConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  console.log("Rendering Admin CyberConfirmModal");
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

function AdminNavbar() {
  const navigate = useNavigate()
  const [showShutdown, setShowShutdown] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogout = () => {
    console.log("Admin logout clicked");
    setShowConfirm(true)
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
          variant="admin"
        />
      )}
    <Nav>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Brand>Admin Portal</Brand>
        <Links>
          <NavLink to="/admin">Home</NavLink>
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/config">Config</NavLink>
          <NavLink to="/admin/audit">Audit</NavLink>
          <NavLink to="/admin/sessions">Sessions</NavLink>
        </Links>
      </div>
      <LogoutBtn onClick={handleLogout}>Shut Down</LogoutBtn>
    </Nav>
    </>
  )
}

export default AdminNavbar
