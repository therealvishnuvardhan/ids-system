import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { addUploadHistory } from "../utils/authUtils"
import UserPageLayout from "../components/UserPageLayout"
import styled from "styled-components"
import { cyberTheme } from "../theme"
import { PageTitle, PageSubtitle, Card, CyberButton } from "../components/UserPageStyles"

const UploadArea = styled.div`
  border: 2px dashed ${cyberTheme.border};
  border-radius: 4px;
  padding: 3rem 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: border-color 0.3s, background 0.3s;
  &:hover {
    border-color: ${cyberTheme.primary};
    background: rgba(0, 242, 234, 0.05);
  }
`

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 0.75rem;
  opacity: 0.8;
`

const UploadHint = styled.p`
  font-family: ${cyberTheme.fontMono};
  color: ${cyberTheme.textMuted};
  margin: 0.25rem 0;
  font-size: 0.9rem;
`

const FileInfo = styled.div`
  background: rgba(0, 242, 234, 0.05);
  border: 1px solid ${cyberTheme.border};
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const FileName = styled.span`
  color: ${cyberTheme.primary};
  font-family: ${cyberTheme.fontMono};
  font-weight: 600;
`

const FileSize = styled.span`
  color: ${cyberTheme.textMuted};
  font-size: 0.85rem;
  margin-left: 0.5rem;
`

const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: ${cyberTheme.danger};
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0 0.5rem;
  &:hover { opacity: 0.8; }
`

const ErrorMsg = styled.div`
  color: ${cyberTheme.danger};
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  margin: 1rem 0;
  font-family: ${cyberTheme.fontMono};
  font-size: 0.9rem;
`

const FormatInfo = styled.div`
  color: ${cyberTheme.textMuted};
  font-size: 0.85rem;
  margin-top: 1.25rem;
  padding: 1rem;
  background: rgba(0, 242, 234, 0.05);
  border: 1px solid ${cyberTheme.border};
  font-family: ${cyberTheme.fontMono};
`

const SubmitBtn = styled(CyberButton)`
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.95rem;
`

function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile)
      setError(null)
    } else {
      setError("Please select a valid CSV file")
      setFile(null)
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.currentTarget.style.borderColor = cyberTheme.primary
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.currentTarget.style.borderColor = ""
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.currentTarget.style.borderColor = ""
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile)
      setError(null)
    } else {
      setError("Please drop a valid CSV file")
    }
  }

  async function handleSubmit() {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("http://127.0.0.1:8000/upload_csv", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      console.log("Upload response:", data)

      if (!response.ok || data.error) {
        throw new Error(data.error || "Upload failed")
      }

      const username = localStorage.getItem("username") || "guest"
      const predictions = data.predictions || []
      const totalRecords = predictions.length
      const attacksDetected = predictions.filter((p: any) => p.status === "Attack Detected").length
      const normalTraffic = totalRecords - attacksDetected
      const avgConfidence = totalRecords > 0
        ? predictions.reduce((sum: number, p: any) => sum + (p.confidence_percentage || 0), 0) / totalRecords
        : 0

      addUploadHistory({
        username,
        fileName: file.name,
        summaries: {
          totalRecords,
          attacksDetected,
          normalTraffic,
          avgConfidence: Number(avgConfidence.toFixed(2)),
        },
        data,
      })

      navigate("/results", { state: { data } })
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserPageLayout>
      <Card>
        <PageTitle>Upload Network CSV</PageTitle>
        <PageSubtitle>Select a CSV file to run intrusion detection analysis</PageSubtitle>

        <UploadArea
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <UploadIcon>📁</UploadIcon>
          <UploadHint>Drag & drop your CSV file here</UploadHint>
          <UploadHint>or click to browse</UploadHint>
        </UploadArea>

        {file && (
          <FileInfo>
            <div>
              <FileName>{file.name}</FileName>
              <FileSize>({(file.size / 1024).toFixed(2)} KB)</FileSize>
            </div>
            <RemoveBtn onClick={() => setFile(null)}>✕</RemoveBtn>
          </FileInfo>
        )}

        {error && <ErrorMsg>⚠ {error}</ErrorMsg>}

        <SubmitBtn onClick={handleSubmit} disabled={!file || loading}>
          {loading ? "Processing..." : "Analyze File"}
        </SubmitBtn>

        <FormatInfo>
          <strong>Supported format:</strong> CSV files with network traffic data
          <br />
          <small>Expected columns: duration, protocol_type, service, flag, src_bytes, dst_bytes, etc.</small>
        </FormatInfo>
      </Card>
    </UserPageLayout>
  )
}

export default Upload
