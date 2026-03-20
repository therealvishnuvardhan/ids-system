import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUserUploadHistory } from "../utils/authUtils"
import type { CsvResultRecord } from "../utils/authUtils"
import UserPageLayout from "../components/UserPageLayout"
import { PageTitle, PageSubtitle, Card, CyberButton, Table, Th, Td } from "../components/UserPageStyles"
import styled from "styled-components"
import { cyberTheme } from "../theme"

const TableWrapper = styled.div`
  overflow-x: auto;
  border: 1px solid ${cyberTheme.border};
`

const ViewBtn = styled(CyberButton)`
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
`

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${cyberTheme.textMuted};
  font-family: ${cyberTheme.fontMono};
`

function History() {
  const username = localStorage.getItem("username") || "guest"
  const navigate = useNavigate()
  const [history, setHistory] = useState<CsvResultRecord[]>([])

  useEffect(() => {
    setHistory(getUserUploadHistory(username))
  }, [username])

  return (
    <UserPageLayout>
      <div style={{ marginBottom: "1.5rem" }}>
        <PageTitle>Upload History</PageTitle>
        <PageSubtitle>Past CSV uploads and analysis results for {username}</PageSubtitle>
      </div>

      {history.length === 0 ? (
        <Card>
          <EmptyState>No upload history yet. Upload a CSV to get started.</EmptyState>
        </Card>
      ) : (
        <Card>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Uploaded At</Th>
                  <Th>File</Th>
                  <Th>Records</Th>
                  <Th>Attacks</Th>
                  <Th>Avg Confidence</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <Td>{new Date(entry.timestamp).toLocaleString()}</Td>
                    <Td>{entry.fileName}</Td>
                    <Td>{entry.summaries.totalRecords}</Td>
                    <Td>{entry.summaries.attacksDetected}</Td>
                    <Td>{entry.summaries.avgConfidence.toFixed(1)}%</Td>
                    <Td>
                      <ViewBtn onClick={() => navigate("/results", { state: { data: entry.data } })}>
                        View
                      </ViewBtn>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </Card>
      )}
    </UserPageLayout>
  )
}

export default History
