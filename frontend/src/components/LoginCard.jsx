import StatusBanner from "./StatusBanner.jsx";

export default function LoginCard({ loginForm, onChange, onSubmit, status }) {
  return (
    <div className="page">
      <div className="card auth-card">
        <h1>E-commerce Admin</h1>
        <p className="muted">Sign in to manage products.</p>
        <form onSubmit={onSubmit} className="form">
          <label>
            Email
            <input
              type="email"
              value={loginForm.email}
              onChange={(event) => onChange("email", event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={loginForm.password}
              onChange={(event) => onChange("password", event.target.value)}
              required
            />
          </label>
          <button type="submit">Login</button>
        </form>
        <StatusBanner status={status} />
      </div>
    </div>
  );
}
