import { Link } from "react-router-dom"

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    background: "#1a1a1a",
    color: "#ffffff",
    fontFamily: "system-ui, -apple-system, sans-serif",
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
  content: {
    maxWidth: "800px",
    width: "100%",
    margin: "auto",
    padding: "40px 20px"
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#60a5fa",
    textAlign: "center" as const
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#9ca3af",
    marginBottom: "40px",
    lineHeight: "1.6",
    textAlign: "center" as const
  },
  section: {
    marginBottom: "40px"
  },
  sectionTitle: {
    fontSize: "1.8rem",
    marginBottom: "20px",
    color: "#60a5fa",
    borderBottom: "2px solid #374151",
    paddingBottom: "10px"
  },
  list: {
    listStyle: "none",
    padding: 0
  },
  listItem: {
    padding: "12px",
    marginBottom: "10px",
    background: "#2d2d2d",
    borderRadius: "8px",
    border: "1px solid #374151",
    color: "#d1d5db"
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center" as const,
    marginTop: "30px"
  },
  button: {
    display: "inline-block",
    padding: "12px 30px",
    background: "#3b82f6",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "1.1rem",
    border: "none",
    cursor: "pointer",
    transition: "background 0.3s"
  }
}

function Home() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Network Intrusion Detection System</h1>
        <p style={styles.subtitle}>
          Advanced machine learning system that analyzes network traffic 
          to detect malicious activity and cyber attacks in real-time.
        </p>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Key Features</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>🔍 Real-time intrusion detection and monitoring</li>
            <li style={styles.listItem}>🤖 ML-based attack type classification</li>
            <li style={styles.listItem}>📊 Risk level analysis with confidence scores</li>
            <li style={styles.listItem}>📁 CSV network log upload and analysis</li>
            <li style={styles.listItem}>🚨 Security alert generation and tracking</li>
            <li style={styles.listItem}>📈 Detailed reports with visualizations</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Supported Attacks</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>🛡️ DoS/DDoS attacks (neptune, smurf, pod, teardrop)</li>
            <li style={styles.listItem}>🔎 Network probes (satan, ipsweep, nmap, portsweep)</li>
            <li style={styles.listItem}>🔑 Unauthorized access (guess_passwd, ftp_write, imap)</li>
            <li style={styles.listItem}>📡 Remote attacks (warezclient, warezmaster, multihop)</li>
          </ul>
        </div>

        <div style={styles.buttonContainer}>
          <Link to="/signup" style={styles.button}>
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home