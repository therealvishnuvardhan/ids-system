export type AppUser = {
  username: string
  password: string
  role: "user" | "admin"
  active?: boolean
}

export type AppMetrics = {
  totalLogins: number
  activeUsers: number
  totalUsers: number
  removedUsers: number
  totalSessions: number
}

export type AppConfig = {
  allowSignup: boolean
  allowLogin: boolean
  maxUsers: number
}

export type AuditEvent = {
  id: string
  timestamp: string
  type: "signup" | "login" | "logout" | "user_removed" | "config_update"
  user: string
  details: string
}

const ADMIN_USER: AppUser = {
  username: "admin",
  password: "admin123",
  role: "admin",
  active: true
}

const DEFAULT_METRICS: AppMetrics = {
  totalLogins: 0,
  activeUsers: 0,
  totalUsers: 1,
  removedUsers: 0,
  totalSessions: 0
}

const DEFAULT_CONFIG: AppConfig = {
  allowSignup: true,
  allowLogin: true,
  maxUsers: 100
}

const DEFAULT_AUDIT: AuditEvent[] = []

export function ensureAppData() {
  const usersRaw = localStorage.getItem("appUsers")
  if (!usersRaw) {
    localStorage.setItem("appUsers", JSON.stringify([ADMIN_USER]))
  } else {
    try {
      const users = JSON.parse(usersRaw) as AppUser[]
      const hasAdmin = users.some(u => u.role === "admin")
      if (!hasAdmin) {
        users.push(ADMIN_USER)
        localStorage.setItem("appUsers", JSON.stringify(users))
      }
    } catch {
      localStorage.setItem("appUsers", JSON.stringify([ADMIN_USER]))
    }
  }

  const metricsRaw = localStorage.getItem("appMetrics")
  if (!metricsRaw) {
    localStorage.setItem("appMetrics", JSON.stringify(DEFAULT_METRICS))
  }

  const configRaw = localStorage.getItem("appConfig")
  if (!configRaw) {
    localStorage.setItem("appConfig", JSON.stringify(DEFAULT_CONFIG))
  } else {
    try {
      const existingConfig = JSON.parse(configRaw) as Partial<AppConfig>
      const normalizedConfig = { ...DEFAULT_CONFIG, ...existingConfig }
      if (JSON.stringify(normalizedConfig) !== JSON.stringify(existingConfig)) {
        localStorage.setItem("appConfig", JSON.stringify(normalizedConfig))
      }
    } catch {
      localStorage.setItem("appConfig", JSON.stringify(DEFAULT_CONFIG))
    }
  }

  const auditRaw = localStorage.getItem("appAudit")
  if (!auditRaw) {
    localStorage.setItem("appAudit", JSON.stringify(DEFAULT_AUDIT))
  }
}

export function getUsers(): AppUser[] {
  ensureAppData()
  try {
    return JSON.parse(localStorage.getItem("appUsers") || "[]") as AppUser[]
  } catch {
    return [ADMIN_USER]
  }
}

export function saveUsers(users: AppUser[]) {
  localStorage.setItem("appUsers", JSON.stringify(users))
}

export function getMetrics(): AppMetrics {
  ensureAppData()
  try {
    return JSON.parse(localStorage.getItem("appMetrics") || "") as AppMetrics
  } catch {
    return DEFAULT_METRICS
  }
}

export function saveMetrics(metrics: AppMetrics) {
  localStorage.setItem("appMetrics", JSON.stringify(metrics))
}

export function getConfig(): AppConfig {
  ensureAppData()
  try {
    const stored = JSON.parse(localStorage.getItem("appConfig") || "") as Partial<AppConfig>
    return {
      ...DEFAULT_CONFIG,
      ...stored
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveConfig(config: AppConfig) {
  localStorage.setItem("appConfig", JSON.stringify(config))
}

export function getAuditLogs(): AuditEvent[] {
  ensureAppData()
  try {
    return JSON.parse(localStorage.getItem("appAudit") || "") as AuditEvent[]
  } catch {
    return []
  }
}

export function addAuditLog(entry: Omit<AuditEvent, "id" | "timestamp">) {
  const logs = getAuditLogs()
  const newLog: AuditEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...entry
  }
  logs.unshift(newLog)
  localStorage.setItem("appAudit", JSON.stringify(logs.slice(0, 200)))
}

export function incrementMetric(key: keyof AppMetrics, delta = 1) {
  const metrics = getMetrics()
  metrics[key] = Math.max(0, metrics[key] + delta)
  saveMetrics(metrics)
}

export function setLoggedInUser(username: string, role: "user" | "admin") {
  localStorage.setItem("isLoggedIn", "true")
  localStorage.setItem("username", username)
  localStorage.setItem("role", role)
  incrementMetric("totalLogins", 1)
  incrementMetric("activeUsers", 1)
  incrementMetric("totalSessions", 1)
  addAuditLog({ type: "login", user: username, details: `${role} logged in` })
}

export function logoutCurrentSession() {
  const username = localStorage.getItem("username") || "unknown"
  const isLoggedIn = localStorage.getItem("isLoggedIn")
  if (isLoggedIn === "true") {
    incrementMetric("activeUsers", -1)
  }
  addAuditLog({ type: "logout", user: username, details: `${username} logged out` })
  localStorage.removeItem("isLoggedIn")
  localStorage.removeItem("username")
  localStorage.removeItem("role")
}

export type CsvResultRecord = {
  id: string
  username: string
  fileName: string
  timestamp: string
  summaries: {
    totalRecords: number
    attacksDetected: number
    normalTraffic: number
    avgConfidence: number
  }
  data: any
}

export function getUploadHistory(): CsvResultRecord[] {
  try {
    return JSON.parse(localStorage.getItem("uploadHistory") || "[]") as CsvResultRecord[]
  } catch {
    return []
  }
}

export function saveUploadHistory(history: CsvResultRecord[]) {
  localStorage.setItem("uploadHistory", JSON.stringify(history))
}

export function addUploadHistory(record: Omit<CsvResultRecord, "id" | "timestamp">) {
  const username = record.username
  const current = getUploadHistory()
  const newRecord: CsvResultRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...record
  }
  // keep most recent first
  saveUploadHistory([newRecord, ...current].slice(0, 50))
  addAuditLog({ type: "config_update", user: username, details: `Saved upload history for ${record.fileName}` })
}

export function getUserUploadHistory(username: string): CsvResultRecord[] {
  return getUploadHistory().filter((h) => h.username === username)
}

export function removeUser(username: string) {
  const users = getUsers().filter((u) => u.username !== username)
  saveUsers(users)
  incrementMetric("removedUsers", 1)
  incrementMetric("totalUsers", -1)
  addAuditLog({ type: "user_removed", user: username, details: `Admin removed user ${username}` })
}

