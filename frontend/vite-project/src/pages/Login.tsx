import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ensureAppData, getUsers, setLoggedInUser } from "../utils/authUtils"
import AuthForm from "../components/AuthForm"
import CyberPattern from "../components/CyberPattern"
import CyberStatusModal from "../components/CyberStatusModal"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"user" | "admin">("user")
  const [loading, setLoading] = useState(false)
  const [statusModal, setStatusModal] = useState<{ message: string; path: string } | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    ensureAppData()
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (username === "" || password === "") {
      alert("Please fill all fields")
      setLoading(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 300))

    const users = getUsers()
    const account = users.find((u) => u.username === username && u.password === password && u.role === role)

    if (!account) {
      alert("Invalid credentials for selected role")
      setLoading(false)
      return
    }

    if (account.role === "admin") {
      setLoggedInUser(account.username, "admin")
      setLoading(false)
      setStatusModal({ message: "System Access Granted", path: "/admin" })
      return
    }

    setLoggedInUser(account.username, "user")
    setLoading(false)
    setStatusModal({ message: "System Access Granted", path: "/dashboard" })
  }

  return (
    <>
      <CyberPattern />
      {statusModal && (
        <CyberStatusModal
          message={statusModal.message}
          onClose={() => {
            setStatusModal(null)
            navigate(statusModal.path)
          }}
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
