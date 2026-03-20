import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ensureAppData, getUsers, saveUsers, setLoggedInUser, incrementMetric, getConfig, addAuditLog } from "../utils/authUtils"
import AuthForm from "../components/AuthForm"
import CyberPattern from "../components/CyberPattern"
import CyberStatusModal from "../components/CyberStatusModal"

function Signup() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [statusModal, setStatusModal] = useState(false)
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

    ensureAppData()
    const config = getConfig()
    if (!config.allowSignup) {
      alert("Signup is currently disabled by admin")
      setLoading(false)
      return
    }

    const users = getUsers()
    if (users.length >= config.maxUsers) {
      alert("User limit reached. Contact admin.")
      setLoading(false)
      return
    }

    const existing = users.find(u => u.username === username)

    if (existing) {
      alert("Username already exists")
      setLoading(false)
      return
    }

    const newUser = {
      username,
      password,
      role: "user" as const,
      active: true
    }
    users.push(newUser)
    saveUsers(users)
    incrementMetric("totalUsers", 1)
    addAuditLog({ type: "signup", user: username, details: `User ${username} signed up` })

    await new Promise(resolve => setTimeout(resolve, 500))

    setLoggedInUser(username, "user")

    setLoading(false)
    setStatusModal(true)
  }

  return (
    <>
      <CyberPattern />
      {statusModal && (
        <CyberStatusModal
          message="Credentials Passed"
          onClose={() => {
            setStatusModal(false)
            navigate("/dashboard")
          }}
        />
      )}
      <AuthForm
        mode="signup"
        username={username}
        password={password}
        loading={loading}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSubmit={handleSignup}
      />
    </>
  )
}

export default Signup
