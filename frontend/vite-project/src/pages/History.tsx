import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUserUploadHistory, deleteUploadHistory } from "../utils/authUtils"
import type { CsvResultRecord } from "../utils/authUtils"
import UserPageLayout from "../components/UserPageLayout"
import { PageTitle, PageSubtitle, Card, CyberButton, CyberButtonDanger, Table, Th, Td } from "../components/UserPageStyles"
import styled from "styled-components"
import { cyberTheme } from "../theme"

const TableWrapper = styled.div`
  overflow-x: auto;
  border: 1px solid ${cyberTheme.border};
`

const ActionGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`

const ViewBtn = styled(CyberButton)`
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
`

const DeleteBtn = styled(CyberButton)`
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalCard = styled(Card)`
  max-width: 400px;
  width: 90%;
  margin: 0;
  animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 0 30px rgba(0, 242, 234, 0.2);

  @keyframes modalPop {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
`

const ModalHeader = styled.h3`
  font-family: ${cyberTheme.fontDisplay};
  color: ${cyberTheme.primary};
  margin-top: 0;
  margin-bottom: 1rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`

const ModalText = styled.p`
  font-family: ${cyberTheme.fontMono};
  color: ${cyberTheme.text};
  margin-bottom: 2rem;
  line-height: 1.5;
  font-size: 0.95rem;
`

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    setHistory(getUserUploadHistory(username))
  }, [username])

  const handleDeleteRequest = (id: string) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteUploadHistory(deleteConfirmId)
      setHistory(getUserUploadHistory(username))
      setDeleteConfirmId(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

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
                      <ActionGroup>
                        <ViewBtn onClick={() => navigate("/results", { state: { data: entry.data } })}>
                          View
                        </ViewBtn>
                        <DeleteBtn onClick={() => handleDeleteRequest(entry.id)}>
                          Delete
                        </DeleteBtn>
                      </ActionGroup>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </Card>
      )}

      {deleteConfirmId && (
        <ModalOverlay onClick={cancelDelete}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <ModalHeader>Confirm Deletion</ModalHeader>
            <ModalText>
              Are you sure you want to delete this upload history? This action cannot be undone.
            </ModalText>
            <ModalActions>
              <CyberButton onClick={cancelDelete}>Cancel</CyberButton>
              <CyberButtonDanger onClick={confirmDelete}>Yes, Delete</CyberButtonDanger>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </UserPageLayout>
  )
}

export default History
