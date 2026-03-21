import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ensureAppData, getUsers, setLoggedInUser, getConfig } from "../utils/authUtils"
import AuthForm from "../components/AuthForm"
import CyberPattern from "../components/CyberPattern"
import CyberStatusModal from "../components/CyberStatusModal"

type StatusStep = "granted" | "protocol" | null

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"user" | "admin">("user")
  const [loading, setLoading] = useState(false)
  const [statusModal, setStatusModal] = useState<{ message: string; path?: string; isAdmin?: boolean; variant?: "danger" | "admin" } | null>(null)
  const [accessStep, setAccessStep] = useState<StatusStep>(null)
  const navigate = useNavigate()

  useEffect(() => {
    ensureAppData()
  }, [])

  function handleModalClose() {
    if (statusModal?.isAdmin && accessStep === "granted") {
      setAccessStep("protocol")
      setStatusModal({ message: "Admin Protocol Activated", path: "/admin", isAdmin: true })
      return
    }

    if (statusModal?.isAdmin === false && accessStep === "granted") {
      setAccessStep("protocol")
      setStatusModal({ message: "User Protocol Activated", path: "/dashboard", isAdmin: false })
      return
    }

    if (statusModal?.path) {
      navigate(statusModal.path)
    }
    setStatusModal(null)
    setAccessStep(null)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (username === "" || password === "") {
      alert("Please fill all fields")
      setLoading(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 300))

    const config = getConfig()
    if (!config.allowLogin && role === "user") {
      setStatusModal({
        message: "☠️ User Login Access Denied by Admin. User logins are currently disabled. ☠️",
        variant: "danger"
      })
      setLoading(false)
      return
    }

    const users = getUsers()
    const account = users.find((u) => u.username === username && u.password === password && u.role === role)

    if (!account) {
      setStatusModal({
        message: "☠️ Invalid credentials for selected role. Try again or contact admin. ☠️",
        variant: "danger"
      })
      setLoading(false)
      return
    }

    if (account.role === "admin") {
      setLoggedInUser(account.username, "admin")
      setLoading(false)
      setAccessStep("granted")
      setStatusModal({ message: "System Access Granted", path: "/admin", isAdmin: true })
      return
    }

    setLoggedInUser(account.username, "user")
    setLoading(false)
    setAccessStep("granted")
    setStatusModal({ message: "System Access Granted", path: "/dashboard", isAdmin: false })
  }

  return (
    <>
      <CyberPattern />
      {statusModal && (
        <CyberStatusModal
          message={statusModal.message}
          onClose={handleModalClose}
          variant={statusModal.isAdmin ? "admin" : undefined}
        />
      )}
      <AuthForm
        mode="login"
        username={username}
        password={password}
        role={role}
        loading={loading}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onRoleChange={setRole}
        onSubmit={handleLogin}
      />
    </>
  )
}

export default Login
