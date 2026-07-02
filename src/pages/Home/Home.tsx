import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { Card } from '../../components/atoms';
import './Home.css';

interface Product {
  id: string | number;
  title: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

interface Category {
  id: string | number;
  name: string;
  icon?: string;
}

interface Activity {
  id: number;
  action: string;
  item: string;
  user: string;
  time: string;
  type: 'edit' | 'add' | 'warning' | 'folder' | 'delete';
  removed?: boolean;
}

function getStoredUsername(): string {
  try {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      const parsed = JSON.parse(saved) as { firstName?: string };
      if (parsed.firstName) return parsed.firstName;
    }
  } catch {
    // ignore
  }
  return 'Administrador';
}

export default function Home() {
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [lowStock, setLowStock] = useState<number>(0);
  const [activities] = useState<Activity[]>([]);
  const [username] = useState<string>(getStoredUsername);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const productsList = await apiFetch<Product[]>('/products');
        if (Array.isArray(productsList)) {
          setTotalProducts(productsList.length);
          const lowStockCount = productsList.filter(p => p.stock <= 12).length;
          setLowStock(lowStockCount);
        }
      } catch (error) {
        console.warn('No se pudieron cargar productos locales.', error);
      }

      try {
        const categoriesList = await apiFetch<Category[]>('/categories');
        if (Array.isArray(categoriesList)) {
          setTotalCategories(categoriesList.length);
        }
      } catch (error) {
        console.warn('No se pudieron cargar categorías locales.', error);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="home-canvas">
      <div className="page-header">
        <h2 className="display-lg">¡Hola {username}!</h2>
        <p className="body-lg text-secondary-color">Bienvenido de nuevo. Esto es lo que está pasando en tu catálogo hoy.</p>
      </div>

      <div className="stats-grid">
        <Card interactive className="stat-card action-stat-card">
          <div className="stat-card-header">
            <span className="label-md text-secondary-color uppercase">Productos</span>
            <span className="material-symbols-outlined stat-icon primary-icon">inventory_2</span>
          </div>
          <div className="stat-value">{totalProducts.toLocaleString()}</div>
          <div className="stat-actions">
            <Link to="/admin/products" className="md3-btn md3-btn-outlined btn-sm flex-1">
              <span className="material-symbols-outlined icon-btn">list</span>
              Ver Listado
            </Link>
            <Link to="/admin/products/new" className="md3-btn md3-btn-filled btn-sm flex-1">
              <span className="material-symbols-outlined icon-btn">add</span>
              Agregar Producto
            </Link>
          </div>
        </Card>

        <Card interactive className="stat-card action-stat-card">
          <div className="stat-card-header">
            <span className="label-md text-secondary-color uppercase">Categorías</span>
            <span className="material-symbols-outlined stat-icon primary-icon">category</span>
          </div>
          <div className="stat-value">{totalCategories}</div>
          <div className="stat-actions">
            <Link to="/admin/categories" className="md3-btn md3-btn-outlined btn-sm flex-1">
              <span className="material-symbols-outlined icon-btn">list</span>
              Ver Listado
            </Link>
            <Link to="/admin/categories/new" className="md3-btn md3-btn-filled btn-sm flex-1">
              <span className="material-symbols-outlined icon-btn">add</span>
              Agregar Categoría
            </Link>
          </div>
        </Card>

        <Link to="/admin/products?filter=low-stock" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }} className="flex-1">
          <Card interactive className={`stat-card ${lowStock > 0 ? 'low-stock-alert' : ''}`} style={{ justifyContent: 'center', width: '100%', height: '100%' }}>
            <div className="stat-card-header">
              <span className="label-md text-secondary-color uppercase">Stock Bajo</span>
              <span className="material-symbols-outlined stat-icon error-icon">warning</span>
            </div>
            <div className="stat-value">{lowStock}</div>
            <div className="stat-label body-sm text-secondary-color" style={{ marginTop: '8px' }}>
              {lowStock > 0 ? '¡Productos requieren reabastecimiento urgente!' : 'Inventario en niveles óptimos'}
            </div>
          </Card>
        </Link>
      </div>

      <div className="home-split-layout">
        <div className="left-column">
          <Card className="flex-center min-h-200 bg-container-low">
            <div className="visual-placeholder text-center">
              <span className="material-symbols-outlined placeholder-icon">bar_chart</span>
              <p className="body-sm text-secondary-color">Gráfico de Estado del Inventario<br/>(Respaldo Visual)</p>
            </div>
          </Card>
        </div>

        <Card noPadding className="right-column">
          <div className="table-header">
            <h3 className="headline-sm">Actividad Reciente</h3>
            <button className="text-btn">Ver Todo</button>
          </div>
          <div className="table-responsive">
            <table className="md3-table">
              <thead>
                <tr>
                  <th>Acción</th>
                  <th>Elemento</th>
                  <th>Usuario</th>
                  <th className="text-right">Hora</th>
                </tr>
              </thead>
              <tbody>
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-secondary-color" style={{ padding: '24px' }}>
                      No hay actividad reciente disponible.
                    </td>
                  </tr>
                ) : (
                  activities.map(activity => (
                    <tr key={activity.id}>
                      <td className="action-cell">
                        {activity.type === 'edit' && <span className="material-symbols-outlined action-icon primary-text">edit</span>}
                        {activity.type === 'add' && <span className="material-symbols-outlined action-icon success-text">add_box</span>}
                        {activity.type === 'warning' && <span className="material-symbols-outlined action-icon error-text">warning</span>}
                        {activity.type === 'folder' && <span className="material-symbols-outlined action-icon primary-text">folder_open</span>}
                        {activity.type === 'delete' && <span className="material-symbols-outlined action-icon error-text">delete</span>}
                        {activity.action}
                      </td>
                      <td className={`font-semibold text-on-surface ${activity.removed ? 'line-through text-secondary-color' : ''}`}>
                        {activity.item}
                      </td>
                      <td className="text-secondary-color">{activity.user}</td>
                      <td className="text-right text-secondary-color body-sm">{activity.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
