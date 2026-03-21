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
  const [statusModal, setStatusModal] = useState<{ message: string; variant?: "danger" | "admin"; path?: string } | null>(null)
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
      setStatusModal({
        message: "☠️ Signup Access Denied by Admin. Protocol halted. ☠️",
        variant: "danger"
      })
      setLoading(false)
      return
    }

    const users = getUsers()
    if (users.length >= config.maxUsers) {
      setStatusModal({
        message: "☠️ User limit reached. Contact admin before re-attempt. ☠️",
        variant: "danger"
      })
      setLoading(false)
      return
    }

    const existing = users.find(u => u.username === username)

    if (existing) {
      setStatusModal({
        message: "☠️ Username already exists. Pick another alias. ☠️",
        variant: "danger"
      })
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
    setStatusModal({ message: "✅ Credentials Passed — Welcome to the system", variant: "admin", path: "/dashboard" })
  }

  return (
    <>
      <CyberPattern />
      {statusModal && (
        <CyberStatusModal
          message={statusModal.message}
          variant={statusModal.variant}
          onClose={() => {
            if (statusModal?.path) {
              const nextPath = statusModal.path
              setStatusModal(null)
              navigate(nextPath)
              return
            }
            setStatusModal(null)
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
