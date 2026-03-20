import { Navigate } from "react-router-dom"

type ProtectedRouteProps = {
  children: any
  requiredRole?: "admin" | "user"
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps){
  const isLoggedIn = localStorage.getItem("isLoggedIn")
  const role = localStorage.getItem("role")

  if (!isLoggedIn) {
    return <Navigate to="/login" />
  }

  if (requiredRole && role !== requiredRole) {
    if (role === "admin") return <Navigate to="/admin" />
    return <Navigate to="/dashboard" />
  }

  return children
}

export default ProtectedRoute