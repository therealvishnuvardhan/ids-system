import { useState } from "react"
import { useNavigate } from "react-router-dom"

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    background: "#1a1a1a",
    color: "#ffffff",
    fontFamily: "system-ui, -apple-system, sans-serif",
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "auto"
  },
  navbar: {
    background: "#2d2d2d",
    padding: "15px 30px",
    borderBottom: "1px solid #374151",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky" as const,
    top: 0,
    zIndex: 100
  },
  navBrand: {
    fontSize: "1.2rem",
    fontWeight: "bold" as const,
    color: "#60a5fa",
    cursor: "pointer"
  },
  navLinks: {
    display: "flex",
    gap: "20px"
  },
  navLink: {
    color: "#9ca3af",
    textDecoration: "none",
    cursor: "pointer",
    padding: "5px 10px"
  },
  activeNavLink: {
    color: "#60a5fa",
    textDecoration: "none",
    cursor: "pointer",
    padding: "5px 10px",
    borderBottom: "2px solid #60a5fa"
  },
  contentWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 70px)",
    padding: "20px"
  },
  content: {
    maxWidth: "800px",
    width: "100%",
    margin: "0 auto"
  },
  card: {
    background: "#2d2d2d",
    padding: "40px",
    borderRadius: "12px",
    border: "1px solid #374151"
  },
  title: {
    fontSize: "2rem",
    color: "#60a5fa",
    marginBottom: "30px",
    textAlign: "center" as const
  },
  uploadArea: {
    border: "2px dashed #4b5563",
    borderRadius: "8px",
    padding: "40px",
    textAlign: "center" as const,
    marginBottom: "20px",
    cursor: "pointer",
    transition: "border-color 0.3s"
  },
  fileInfo: {
    background: "#374151",
    padding: "15px",
    borderRadius: "6px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  fileName: {
    color: "#60a5fa",
    fontWeight: "bold" as const
  },
  fileSize: {
    color: "#9ca3af",
    fontSize: "0.9rem"
  },
  button: {
    width: "100%",
    padding: "15px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "1.1rem",
    fontWeight: "bold" as const,
    cursor: "pointer",
    marginTop: "20px",
    boxSizing: "border-box" as const
  },
  buttonDisabled: {
    width: "100%",
    padding: "15px",
    background: "#4b5563",
    color: "#9ca3af",
    border: "none",
    borderRadius: "6px",
    fontSize: "1.1rem",
    fontWeight: "bold" as const,
    cursor: "not-allowed",
    marginTop: "20px",
    boxSizing: "border-box" as const
  },
  error: {
    color: "#ef4444",
    padding: "10px",
    background: "rgba(239, 68, 68, 0.1)",
    borderRadius: "4px",
    marginTop: "10px",
    textAlign: "center" as const
  },
  format: {
    color: "#9ca3af",
    fontSize: "0.9rem",
    marginTop: "20px",
    padding: "10px",
    background: "#374151",
    borderRadius: "4px",
    textAlign: "center" as const
  }
}

function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    navigate("/login")
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile)
      setError(null)
    } else {
      setError("Please select a valid CSV file")
      setFile(null)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.currentTarget.style.borderColor = "#60a5fa"
  }

  function handleDragLeave(e: React.DragEvent) {
    e.currentTarget.style.borderColor = "#4b5563"
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.currentTarget.style.borderColor = "#4b5563"
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
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

      const response = await fetch("http://localhost:8000/upload_csv", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      navigate("/results", { 
        state: { predictions: data.predictions } 
      })

    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navBrand} onClick={() => navigate("/dashboard")}>
          IDS DASHBOARD
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLink} onClick={() => navigate("/dashboard")}>Dashboard</span>
          <span style={styles.activeNavLink}>Upload</span>
          <span style={styles.navLink} onClick={() => navigate("/alerts")}>Alerts</span>
          <span style={styles.navLink} onClick={() => navigate("/reports")}>Reports</span>
          <span style={styles.navLink} onClick={handleLogout}>Logout</span>
        </div>
      </div>

      {/* Centered Content */}
      <div style={styles.contentWrapper}>
        <div style={styles.content}>
          <div style={styles.card}>
            <h1 style={styles.title}>Upload Network CSV</h1>

            {/* Upload Area */}
            <div
              style={styles.uploadArea}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📁</div>
              <p style={{ color: "#9ca3af", marginBottom: "5px" }}>
                Drag & drop your CSV file here
              </p>
              <p style={{ color: "#4b5563", fontSize: "0.9rem" }}>
                or click to browse
              </p>
            </div>

            {/* File Info */}
            {file && (
              <div style={styles.fileInfo}>
                <div>
                  <span style={styles.fileName}>{file.name}</span>
                  <span style={styles.fileSize}>
                    {" "} ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "1.2rem"
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && <div style={styles.error}>⚠️ {error}</div>}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              style={(!file || loading) ? styles.buttonDisabled : styles.button}
            >
              {loading ? "Processing..." : "Analyze File"}
            </button>

            {/* Format Info */}
            <div style={styles.format}>
              <strong>📋 Supported Format:</strong> CSV files with network traffic data
              <br />
              <small>Expected columns: duration, protocol_type, service, flag, src_bytes, dst_bytes, etc.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Upload