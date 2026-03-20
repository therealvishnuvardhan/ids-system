import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"

import UserNavbar from "./components/UserNavbar"
import ProtectedRoute from "./components/ProtectedRoute"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import AdminHome from "./pages/AdminHome"
import AdminDashboard from "./pages/AdminDashboard"
import AdminConfig from "./pages/AdminConfig"
import AdminAudit from "./pages/AdminAudit"
import AdminSessions from "./pages/AdminSessions"
import AdminPerformance from "./pages/AdminPerformance"
import Upload from "./pages/Upload"
import Results from "./pages/Results"
import Alerts from "./pages/Alerts"
import Reports from "./pages/Reports"
import History from "./pages/History"


function AppContent(){

  const location = useLocation()
  const isLoggedIn = localStorage.getItem("isLoggedIn")

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/" ||
    location.pathname.startsWith("/admin")

  return(

    <>
    
      {!hideNavbar && isLoggedIn && <UserNavbar/>}

      <Routes>

        <Route path="/" element={<Signup/>} />

        <Route path="/signup" element={<Signup/>} />

        <Route path="/login" element={<Login/>} />

        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="user">
            <Dashboard/>
          </ProtectedRoute>
        }/>

        <Route path="/upload" element={
          <ProtectedRoute requiredRole="user">
            <Upload/>
          </ProtectedRoute>
        }/>

        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminHome/>
          </ProtectedRoute>
        }/>

        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard/>
          </ProtectedRoute>
        }/>

        <Route path="/admin/results" element={
          <ProtectedRoute requiredRole="admin">
            <Results/>
          </ProtectedRoute>
        }/>

        <Route path="/admin/config" element={
          <ProtectedRoute requiredRole="admin">
            <AdminConfig/>
          </ProtectedRoute>
        }/>

        <Route path="/admin/audit" element={
          <ProtectedRoute requiredRole="admin">
            <AdminAudit/>
          </ProtectedRoute>
        }/>

        <Route path="/admin/sessions" element={
          <ProtectedRoute requiredRole="admin">
            <AdminSessions/>
          </ProtectedRoute>
        }/>

        <Route path="/admin/performance" element={
          <ProtectedRoute requiredRole="admin">
            <AdminPerformance/>
          </ProtectedRoute>
        }/>

        <Route path="/results" element={
          <ProtectedRoute>
            <Results/>
          </ProtectedRoute>
        }/>

        <Route path="/alerts" element={
          <ProtectedRoute>
            <Alerts/>
          </ProtectedRoute>
        }/>

        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports/>
          </ProtectedRoute>
        }/>

        <Route path="/history" element={
          <ProtectedRoute>
            <History/>
          </ProtectedRoute>
        }/>

      </Routes>

    </>
  )
}


function App(){

  return(

    <Router>
      <AppContent/>
    </Router>

  )
}

export default App