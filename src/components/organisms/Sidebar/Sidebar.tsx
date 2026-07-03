import { NavLink } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
}

export default function Sidebar({ isSidebarOpen, closeSidebar }: SidebarProps) {
  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <h2>Mi Ecommerce</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          onClick={closeSidebar}
        >
          <span className="material-symbols-outlined nav-icon">home</span>
          <span className="nav-label">Inicio</span>
        </NavLink>
        <NavLink 
          to="/admin/products" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          onClick={closeSidebar}
        >
          <span className="material-symbols-outlined nav-icon">inventory_2</span>
          <span className="nav-label">Productos</span>
        </NavLink>
        <NavLink 
          to="/admin/categories" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          onClick={closeSidebar}
        >
          <span className="material-symbols-outlined nav-icon">category</span>
          <span className="nav-label">Categorías</span>
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          onClick={closeSidebar}
        >
          <span className="material-symbols-outlined nav-icon">group</span>
          <span className="nav-label">Usuarios</span>
        </NavLink>
        <NavLink 
          to="/admin/profile" 
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          onClick={closeSidebar}
        >
          <span className="material-symbols-outlined nav-icon">account_circle</span>
          <span className="nav-label">Perfil</span>
        </NavLink>
      </nav>
    </aside>
  );
}
