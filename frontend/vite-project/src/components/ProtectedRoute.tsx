import { Navigate } from "react-router-dom"

function ProtectedRoute({ children }: any){

  const user = localStorage.getItem("username")
  const isLoggedIn = localStorage.getItem("isLoggedIn")

  // If account not created → go to signup
  if(!user){
    return <Navigate to="/signup" />
  }

  // If account exists but not logged in → go to login
  if(!isLoggedIn){
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute