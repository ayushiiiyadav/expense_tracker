import { NavLink, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div>
      <nav className="navbar">
        <div className="brand">💰 Expense-Tracker</div>
        <div className="nav-links">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
        </div>
        <div className="nav-user">
          <span>Hi {user.name}</span>
          <button className="small-btn" onClick={logout}>
            Log out
          </button>
        </div>
      </nav>
      <main className="page">{children}</main>
    </div>
  );
}