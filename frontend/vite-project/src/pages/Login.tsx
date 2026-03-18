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
    bottom: 0,
    overflow: "auto"
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

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const savedUser = localStorage.getItem("username")
    const savedPass = localStorage.getItem("password")

    if (username === "" || password === "") {
      alert("Please fill all fields")
      setLoading(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    if (username === savedUser && password === savedPass) {
      localStorage.setItem("isLoggedIn", "true")
      alert("Login successful!")
      setLoading(false)
      navigate("/dashboard")
    } else {
      alert("Invalid username or password")
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login</h1>
        
        <form onSubmit={handleLogin} style={styles.form}>
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
              placeholder="Enter password"
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <Link to="/signup" style={styles.link}>
          Don't have an account? Sign up
        </Link>
      </div>
    </div>
  )
}

export default Login