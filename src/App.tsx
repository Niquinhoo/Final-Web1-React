import { useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, NavLink, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import ProductsList from './pages/Products/ProductsList/ProductsList';
import ProductView from './pages/Products/ProductView/ProductView';
import CategoriesList from './pages/Categories/CategoriesList/CategoriesList';
import CategoryView from './pages/Categories/CategoryView/CategoryView';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound/NotFound';
import './App.css';

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Drawer Overlay backdrop */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`} 
        onClick={closeSidebar}
        aria-hidden="true"
      ></div>

      {/* Sidebar Navigation Drawer */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>Mi Ecommerce</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink 
            to="/home" 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            onClick={closeSidebar}
          >
            <span className="material-symbols-outlined nav-icon">home</span>
            <span className="nav-label">Inicio</span>
          </NavLink>
          <NavLink 
            to="/products" 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            onClick={closeSidebar}
          >
            <span className="material-symbols-outlined nav-icon">inventory_2</span>
            <span className="nav-label">Productos</span>
          </NavLink>
          <NavLink 
            to="/categories" 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            onClick={closeSidebar}
          >
            <span className="material-symbols-outlined nav-icon">category</span>
            <span className="nav-label">Categorías</span>
          </NavLink>
          <NavLink 
            to="/profile" 
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            onClick={closeSidebar}
          >
            <span className="material-symbols-outlined nav-icon">account_circle</span>
            <span className="nav-label">Perfil</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-area">
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
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '',
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'products',
        element: <ProductsList />,
      },
      {
        path: 'products/new',
        element: <ProductView />,
      },
      {
        path: 'products/:id',
        element: <ProductView />,
      },
      {
        path: 'categories',
        element: <CategoriesList />,
      },
      {
        path: 'categories/new',
        element: <CategoryView />,
      },
      {
        path: 'categories/:id',
        element: <CategoryView />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

