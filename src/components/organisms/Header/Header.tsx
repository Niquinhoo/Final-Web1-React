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
    </header>
  );
}
