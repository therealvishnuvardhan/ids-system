import { Link, useNavigate } from "react-router-dom"

function Navbar(){

  const navigate = useNavigate()

  function handleLogout(){

    localStorage.removeItem("isLoggedIn")

    navigate("/login")

  }

  return(

    <nav style={{
      background:"#111",
      color:"white",
      padding:"15px",
      display:"flex",
      gap:"20px"
    }}>

      <Link to="/dashboard">Dashboard</Link>

      <Link to="/upload">Upload</Link>

      <Link to="/results">Results</Link>

      <Link to="/alerts">Alerts</Link>

      <Link to="/reports">Reports</Link>

      <button onClick={handleLogout}>Logout</button>

    </nav>

  )

}

export default Navbar