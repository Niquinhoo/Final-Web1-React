import { Link } from 'react-router-dom';
import ThemeToggle from '../../atoms/ThemeToggle/ThemeToggle';
import './Header.css';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="header">
      <button
        className="mobile-menu-toggle"
        onClick={toggleSidebar}
        aria-label="Abrir navegación"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>
      <h1 className="header-title">Panel de Control</h1>
      <div className="header-actions">
        <Link to="/home" className="header-store-btn" title="Volver a la Tienda">
          <span className="material-symbols-outlined">shopping_bag</span>
          <span className="btn-text">Ver Tienda</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
