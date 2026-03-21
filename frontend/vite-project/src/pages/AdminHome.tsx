import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"
import AdminSidebar from "../components/AdminSidebar"
import AdminPageLayout from "../components/AdminPageLayout"
import { adminTheme } from "../adminTheme"

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`

const ActionBtn = styled.button`
  background: transparent;
  border: 2px solid ${adminTheme.primary};
  color: ${adminTheme.primary};
  font-family: ${adminTheme.fontMono};
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 1.4rem 1.5rem;
  cursor: pointer;
  transition: all 0.25s;
  transform: skewX(-6deg);
  position: relative;

  & > span {
    display: inline-block;
    transform: skewX(6deg);
  }

  &:hover {
    background: ${adminTheme.primary};
    color: ${adminTheme.bg};
    box-shadow: 0 0 30px rgba(124, 58, 237, 0.35);
  }
`

function AdminHome() {
  const navigate = useNavigate()
  useEffect(() => {
    const role = localStorage.getItem("role")
    if (role !== "admin") {
      navigate("/login")
    }
  }, [navigate])

  const actions = [
    ["Dashboard", "/admin/dashboard"],
    ["Config", "/admin/config"],
    ["Audit Logs", "/admin/audit"],
    ["Sessions", "/admin/sessions"],
    ["Performance", "/admin/performance"],
  ] as const

  return (
    <>
      <AdminSidebar />
      <AdminPageLayout
        title="Welcome back boss"
        description="Full control over the intrusion detection system. Monitor users, configure settings, review audit logs, and manage system performance from this secure command interface."
      >
        <ActionsGrid>
          {actions.map(([label, path]) => (
            <ActionBtn key={label} onClick={() => navigate(path)}>
              <span>{label}</span>
            </ActionBtn>
          ))}
        </ActionsGrid>
      </AdminPageLayout>
    </>
  )
}

export default AdminHome
