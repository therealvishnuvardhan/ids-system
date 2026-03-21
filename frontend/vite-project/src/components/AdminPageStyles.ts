import styled from "styled-components"
import { adminTheme } from "../adminTheme"

export const AdminCard = styled.div`
  background: ${adminTheme.bgCard};
  border: 1px solid ${adminTheme.border};
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 25px rgba(124, 58, 237, 0.08);
`

export const AdminSectionTitle = styled.h3`
  font-family: ${adminTheme.fontDisplay};
  font-size: 1rem;
  font-weight: 700;
  color: ${adminTheme.primary};
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin: 0 0 1.25rem;
`

export const AdminLabel = styled.div`
  font-family: ${adminTheme.fontMono};
  font-size: 0.75rem;
  color: ${adminTheme.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
`

export const AdminValue = styled.div`
  font-family: ${adminTheme.fontDisplay};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${adminTheme.primary};
`

export const AdminButton = styled.button`
  background: transparent;
  border: 2px solid ${adminTheme.primary};
  color: ${adminTheme.primary};
  font-family: ${adminTheme.fontMono};
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.25s;
  &:hover {
    background: ${adminTheme.primary};
    color: ${adminTheme.bg};
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.35);
  }
`

export const AdminButtonDanger = styled(AdminButton)`
  border-color: ${adminTheme.danger};
  color: ${adminTheme.danger};
  &:hover {
    background: ${adminTheme.danger};
    color: #fff;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
  }
`

export const AdminTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: ${adminTheme.fontMono};
`

export const AdminTh = styled.th`
  background: rgba(124, 58, 237, 0.1);
  padding: 0.75rem 1rem;
  text-align: left;
  color: ${adminTheme.primary};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom: 1px solid ${adminTheme.border};
`

export const AdminTd = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${adminTheme.border};
  color: ${adminTheme.text};
  font-size: 0.9rem;
`
