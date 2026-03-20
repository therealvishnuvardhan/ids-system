import styled from "styled-components"
import { cyberTheme } from "../theme"

export const PageTitle = styled.h1`
  font-family: ${cyberTheme.fontDisplay};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${cyberTheme.primary};
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin: 0 0 0.5rem;
`

export const PageSubtitle = styled.p`
  font-family: ${cyberTheme.fontMono};
  font-size: 0.9rem;
  color: ${cyberTheme.textMuted};
  margin: 0;
`

export const Card = styled.div`
  background: ${cyberTheme.bgCard};
  border: 1px solid ${cyberTheme.border};
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 20px rgba(0, 242, 234, 0.08);
`

export const CyberButton = styled.button`
  background: transparent;
  border: 2px solid ${cyberTheme.primary};
  color: ${cyberTheme.primary};
  font-family: ${cyberTheme.fontMono};
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: all 0.25s;
  &:hover:not(:disabled) {
    background: ${cyberTheme.primary};
    color: ${cyberTheme.bg};
    box-shadow: 0 0 20px rgba(0, 242, 234, 0.3);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const CyberButtonDanger = styled(CyberButton)`
  border-color: ${cyberTheme.danger};
  color: ${cyberTheme.danger};
  &:hover:not(:disabled) {
    background: ${cyberTheme.danger};
    color: #000;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
  }
`

export const CyberInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${cyberTheme.border};
  padding: 0.75rem 0;
  font-size: 0.95rem;
  color: ${cyberTheme.text};
  font-family: ${cyberTheme.fontMono};
  outline: none;
  transition: border-color 0.3s;
  &:focus {
    border-color: ${cyberTheme.primary};
  }
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: ${cyberTheme.fontMono};
`

export const Th = styled.th`
  background: rgba(0, 242, 234, 0.08);
  padding: 0.75rem 1rem;
  text-align: left;
  color: ${cyberTheme.primary};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom: 1px solid ${cyberTheme.border};
`

export const Td = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${cyberTheme.border};
  color: ${cyberTheme.text};
  font-size: 0.9rem;
`
