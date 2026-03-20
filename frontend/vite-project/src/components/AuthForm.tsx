import { Link } from "react-router-dom"
import styled from "styled-components"

type AuthFormMode = "login" | "signup"

type AuthFormProps = {
  mode: AuthFormMode
  username: string
  password: string
  role?: "user" | "admin"
  loading?: boolean
  onUsernameChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onRoleChange?: (v: "user" | "admin") => void
  onSubmit: (e: React.FormEvent) => void
}

const StyledWrapper = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;

  .glitch-form-wrapper {
    --bg-color: #0d0d0d;
    --primary-color: #00f2ea;
    --secondary-color: #a855f7;
    --text-color: #e5e5e5;
    --font-family: "Fira Code", Consolas, "Courier New", Courier, monospace;
    --glitch-anim-duration: 0.5s;
  }

  .glitch-form-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: var(--font-family);
    padding: 1.5rem;
    background: transparent;
  }

  .auth-heading {
    position: relative;
    text-align: center;
    margin-bottom: 1.5rem;
    color: var(--primary-color);
    font-family: "Orbitron", "Fira Code", sans-serif;
    font-size: 2.25rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    text-shadow: 0 0 20px rgba(0, 242, 234, 0.4);
  }

  .auth-heading .glitch-text {
    position: relative;
    display: inline-block;
    margin-left: 0.6em;
  }

  .auth-heading .glitch-text::before,
  .auth-heading .glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .auth-heading .glitch-text::before {
    color: var(--secondary-color);
    animation: heading-glitch 2.5s infinite;
    clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
    transform: translate(-3px, -2px);
  }

  .auth-heading .glitch-text::after {
    color: var(--primary-color);
    animation: heading-glitch 2.5s infinite reverse;
    clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
    transform: translate(3px, 2px);
  }

  @keyframes heading-glitch {
    0%, 88%, 100% { opacity: 0; transform: translate(0); }
    89% { opacity: 0.9; transform: translate(-4px, 2px); }
    91% { opacity: 0; transform: translate(3px, -3px); }
    93% { opacity: 0.85; transform: translate(2px, 3px); }
    95% { opacity: 0; transform: translate(-2px, -2px); }
  }

  .auth-heading .glitch-text::before {
    animation-delay: 0.1s;
  }

  .glitch-card {
    background-color: var(--bg-color);
    width: 100%;
    max-width: 380px;
    border: 1px solid rgba(0, 242, 234, 0.2);
    box-shadow:
      0 0 20px rgba(0, 242, 234, 0.1),
      inset 0 0 10px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    margin: 1rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.3);
    padding: 0.5em 1em;
    border-bottom: 1px solid rgba(0, 242, 234, 0.2);
  }

  .card-title {
    color: var(--primary-color);
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    display: flex;
    align-items: center;
    gap: 0.5em;
  }

  .card-title svg {
    width: 1.2em;
    height: 1.2em;
    stroke: var(--primary-color);
  }

  .card-dots span {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #333;
    margin-left: 5px;
  }

  .card-body {
    padding: 1.5rem;
  }

  .form-group {
    position: relative;
    margin-bottom: 1.5rem;
  }

  .form-label {
    position: absolute;
    top: 0.75em;
    left: 0;
    font-size: 1rem;
    color: var(--primary-color);
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    pointer-events: none;
    transition: all 0.3s ease;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 2px solid rgba(0, 242, 234, 0.3);
    padding: 0.75em 0;
    font-size: 1rem;
    color: var(--text-color);
    font-family: inherit;
    outline: none;
    transition: border-color 0.3s ease;
  }

  .form-group select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2300f2ea' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0 center;
    padding-right: 1.5em;
  }

  .form-group select option {
    background: #0d0d0d;
    color: var(--text-color);
  }

  .form-group input:focus,
  .form-group select:focus {
    border-color: var(--primary-color);
  }

  .form-group input:focus + .form-label,
  .form-group input:not(:placeholder-shown) + .form-label,
  .form-group select:focus + .form-label,
  .form-group select.has-value + .form-label {
    top: -1.2em;
    font-size: 0.8rem;
    opacity: 1;
  }

  .form-group input:focus + .form-label::before,
  .form-group input:focus + .form-label::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--bg-color);
  }

  .form-group input:focus + .form-label::before {
    color: var(--secondary-color);
    animation: glitch-anim var(--glitch-anim-duration)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  .form-group input:focus + .form-label::after {
    color: var(--primary-color);
    animation: glitch-anim var(--glitch-anim-duration)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both;
  }

  @keyframes glitch-anim {
    0% {
      transform: translate(0);
      clip-path: inset(0 0 0 0);
    }
    20% {
      transform: translate(-5px, 3px);
      clip-path: inset(50% 0 20% 0);
    }
    40% {
      transform: translate(3px, -2px);
      clip-path: inset(20% 0 60% 0);
    }
    60% {
      transform: translate(-4px, 2px);
      clip-path: inset(80% 0 5% 0);
    }
    80% {
      transform: translate(4px, -3px);
      clip-path: inset(30% 0 45% 0);
    }
    100% {
      transform: translate(0);
      clip-path: inset(0 0 0 0);
    }
  }

  .submit-btn {
    width: 100%;
    padding: 0.8em;
    margin-top: 1rem;
    background-color: transparent;
    border: 2px solid var(--primary-color);
    color: var(--primary-color);
    font-family: inherit;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    cursor: pointer;
    position: relative;
    transition: all 0.3s;
    overflow: hidden;
  }

  .submit-btn:hover:not(:disabled),
  .submit-btn:focus:not(:disabled) {
    background-color: var(--primary-color);
    color: var(--bg-color);
    box-shadow: 0 0 25px var(--primary-color);
    outline: none;
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .submit-btn:active:not(:disabled) {
    transform: scale(0.97);
  }

  .submit-btn .btn-text {
    position: relative;
    z-index: 1;
    transition: opacity 0.2s ease;
  }

  .submit-btn:hover:not(:disabled) .btn-text {
    opacity: 0;
  }

  .submit-btn::before,
  .submit-btn::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    background-color: var(--primary-color);
    transition: opacity 0.2s ease;
  }

  .submit-btn:hover:not(:disabled)::before,
  .submit-btn:focus:not(:disabled)::before {
    opacity: 1;
    color: var(--secondary-color);
    animation: glitch-anim var(--glitch-anim-duration)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  .submit-btn:hover:not(:disabled)::after,
  .submit-btn:focus:not(:disabled)::after {
    opacity: 1;
    color: var(--bg-color);
    animation: glitch-anim var(--glitch-anim-duration)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both;
  }

  .auth-link {
    display: block;
    text-align: center;
    margin-top: 1.25rem;
    color: var(--primary-color);
    font-size: 0.85rem;
    text-decoration: none;
    opacity: 0.9;
    transition: opacity 0.2s;
  }

  .auth-link:hover {
    opacity: 1;
    text-decoration: underline;
  }

  @media (prefers-reduced-motion: reduce) {
    .auth-heading .glitch-text::before,
    .auth-heading .glitch-text::after {
      animation: none;
      opacity: 0;
    }
    .form-group input:focus + .form-label::before,
    .form-group input:focus + .form-label::after,
    .submit-btn:hover::before,
    .submit-btn:focus::before,
    .submit-btn:hover::after,
    .submit-btn:focus::after {
      animation: none;
      opacity: 0;
    }

    .submit-btn:hover .btn-text {
      opacity: 1;
    }
  }
`

function AuthForm({
  mode,
  username,
  password,
  role = "user",
  loading = false,
  onUsernameChange,
  onPasswordChange,
  onRoleChange,
  onSubmit
}: AuthFormProps) {
  const submitText =
    mode === "login"
      ? loading
        ? "CONNECTING..."
        : "INITIATE_CONNECTION"
      : loading
        ? "CREATING_ACCOUNT..."
        : "CREATE_ACCOUNT"

  return (
    <StyledWrapper>
      <div className="glitch-form-wrapper">
        <h1 className="auth-heading">
          <span className="glitch-text" data-text="System Access Protocol">System Access Protocol</span>
        </h1>
        <form className="glitch-card" onSubmit={onSubmit}>
          <div className="card-header">
            <div className="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                <path d="M12 11.5a3 3 0 0 0 -3 2.824v1.176a3 3 0 0 0 6 0v-1.176a3 3 0 0 0 -3 -2.824z" />
              </svg>
              <span>SECURE_DATA</span>
            </div>
            <div className="card-dots"><span /><span /><span /></div>
          </div>
          <div className="card-body">
            {mode === "login" && onRoleChange && (
              <div className="form-group">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => onRoleChange(e.target.value as "user" | "admin")}
                  disabled={loading}
                  className={role ? "has-value" : ""}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <label htmlFor="role" className="form-label" data-text="ACCESS_MODE">
                  ACCESS_MODE
                </label>
              </div>
            )}

            <div className="form-group">
              <input
                type="text"
                id="username"
                name="username"
                required
                placeholder=" "
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                disabled={loading}
              />
              <label htmlFor="username" className="form-label" data-text="USERNAME">
                USERNAME
              </label>
            </div>

            <div className="form-group">
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder=" "
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                disabled={loading}
              />
              <label htmlFor="password" className="form-label" data-text="ACCESS_KEY">
                ACCESS_KEY
              </label>
            </div>

            <button
              data-text={submitText}
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              <span className="btn-text">{submitText}</span>
            </button>

            {mode === "login" ? (
              <Link to="/signup" className="auth-link">
                No credentials? Create account
              </Link>
            ) : (
              <Link to="/login" className="auth-link">
                Have credentials? Initiate connection
              </Link>
            )}
          </div>
        </form>
      </div>
    </StyledWrapper>
  )
}

export default AuthForm
