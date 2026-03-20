import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { logoutCurrentSession } from "../utils/authUtils"
import styled from "styled-components"
import { cyberTheme } from "../theme"
import CyberStatusModal from "./CyberStatusModal"

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
  transition: color 0.2s, border-color 0.2s;
  &:hover {
    color: ${cyberTheme.primary};
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
  &:hover {
    background: ${cyberTheme.danger};
    color: #000;
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
  }
`

function UserNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showShutdown, setShowShutdown] = useState(false)

  const handleLogout = () => {
    setShowShutdown(true)
  }

  const onShutdownComplete = () => {
    setShowShutdown(false)
    logoutCurrentSession()
    navigate("/login")
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <>
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
        <LogoutBtn onClick={handleLogout}>Logout</LogoutBtn>
      </NavLinks>
    </Nav>
    </>
  )
}

export default UserNavbar
