import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    background: "#1a1a1a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    margin: 0,
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  card: {
    background: "#2d2d2d",
    padding: "40px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
    border: "1px solid #374151",
    margin: "auto"
  },
  title: {
    fontSize: "2rem",
    color: "#60a5fa",
    marginBottom: "30px",
    textAlign: "center" as const
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px"
  },
  label: {
    color: "#9ca3af",
    fontSize: "0.9rem",
    fontWeight: "bold" as const
  },
  input: {
    padding: "12px",
    background: "#374151",
    border: "1px solid #4b5563",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const
  },
  button: {
    padding: "14px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: "bold" as const,
    cursor: "pointer",
    marginTop: "10px",
    transition: "background 0.3s",
    width: "100%",
    boxSizing: "border-box" as const
  },
  buttonDisabled: {
    padding: "14px",
    background: "#4b5563",
    color: "#9ca3af",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: "bold" as const,
    cursor: "not-allowed",
    marginTop: "10px",
    width: "100%",
    boxSizing: "border-box" as const
  },
  link: {
    color: "#60a5fa",
    textDecoration: "none",
    textAlign: "center" as const,
    marginTop: "20px",
    display: "block"
  }
}

function Signup() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (username === "" || password === "") {
      alert("Please fill all fields")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    localStorage.setItem("username", username)
    localStorage.setItem("password", password)
    localStorage.setItem("isLoggedIn", "true")

    alert("Account created successfully!")
    setLoading(false)
    navigate("/dashboard")
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        
        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              style={styles.input}
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              placeholder="Enter password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            style={loading ? styles.buttonDisabled : styles.button}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <Link to="/login" style={styles.link}>
          Already have an account? Login
        </Link>
      </div>
    </div>
  )
}

export default Signup