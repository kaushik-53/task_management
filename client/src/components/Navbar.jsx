import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="navbar">
      <a href="/tasks" className="navbar-brand">
        <div className="navbar-brand-icon">⚡</div>
        <span className="navbar-brand-text">TaskFlow</span>
      </a>

      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar">{initials}</div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user?.name}</span>
        </div>
        <button
          id="logout-btn"
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
