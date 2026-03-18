import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"

import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Upload from "./pages/Upload"
import Results from "./pages/Results"
import Alerts from "./pages/Alerts"
import Reports from "./pages/Reports"


function AppContent(){

  const location = useLocation()
  const isLoggedIn = localStorage.getItem("isLoggedIn")

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/"

  return(

    <>
    
      {!hideNavbar && isLoggedIn && <Navbar/>}

      <Routes>

        <Route path="/" element={<Signup/>} />

        <Route path="/signup" element={<Signup/>} />

        <Route path="/login" element={<Login/>} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
        }/>

        <Route path="/upload" element={
          <ProtectedRoute>
            <Upload/>
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