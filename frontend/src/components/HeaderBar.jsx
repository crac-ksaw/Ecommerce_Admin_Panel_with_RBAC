export default function HeaderBar({ user, isAdmin, onLogout }) {
  const title = isAdmin ? "Admin Dashboard" : "Sales Workspace";

  return (
    <header className="header">
      <div>
        <h1>{title}</h1>
        <p className="muted">
          Signed in as {user.name} ({user.role})
        </p>
      </div>
      <div className="header-actions">
        <span className={`role-badge ${isAdmin ? "admin" : "sales"}`}>
          {isAdmin ? "ADMIN" : "SALES"}
        </span>
        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
