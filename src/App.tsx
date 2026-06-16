import { useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import ProductsList from './pages/Products/ProductsList/ProductsList';
import ProductView from './pages/Products/ProductView/ProductView';
import CategoriesList from './pages/Categories/CategoriesList/CategoriesList';
import CategoryView from './pages/Categories/CategoryView/CategoryView';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound/NotFound';
import Sidebar from './components/organisms/Sidebar/Sidebar';
import Header from './components/organisms/Header/Header';
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

      {/* Sidebar Navigation Drawer (US5) */}
      <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />

      {/* Main Content Area */}
      <div className="main-area">
        <Header toggleSidebar={toggleSidebar} />
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

