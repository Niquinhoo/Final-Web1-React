import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
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

export default function Home() {
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [lowStock, setLowStock] = useState<number>(0);
  const [recentSales] = useState<string>('$0.00');
  const [activities] = useState<Activity[]>([]);
  const [username, setUsername] = useState<string>('Administrador');

  useEffect(() => {
    // Intentar leer el nombre del perfil desde localStorage
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { firstName?: string };
        if (parsed.firstName) {
          setUsername(parsed.firstName);
        }
      } catch (e) {
        console.error('Error al parsear el perfil del usuario para el saludo:', e);
      }
    }

    async function loadDashboardData() {
      try {
        // Intentar obtener productos reales del backend
        const productsList = await apiFetch<Product[]>('/products');
        if (Array.isArray(productsList)) {
          setTotalProducts(productsList.length);
          // Calcular productos con bajo stock (ej: stock <= 12)
          const lowStockCount = productsList.filter(p => p.stock <= 12).length;
          setLowStock(lowStockCount);
        }
      } catch (error) {
        console.warn('No se pudo conectar al backend para cargar productos.', error);
      }

      try {
        // Intentar obtener categorías reales del backend
        const categoriesList = await apiFetch<Category[]>('/categories');
        if (Array.isArray(categoriesList)) {
          setTotalCategories(categoriesList.length);
        }
      } catch (error) {
        console.warn('No se pudo conectar al backend para cargar categorías.', error);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="home-canvas">
      {/* Encabezado de la Página (US6) */}
      <div className="page-header">
        <h2 className="display-lg">¡Hola {username}!</h2>
        <p className="body-lg text-secondary-color">Bienvenido de nuevo. Esto es lo que está pasando en tu catálogo hoy.</p>
      </div>

      {/* Cuadrícula de Estadísticas */}
      <div className="stats-grid">
        {/* Tarjeta 1 (Productos con acciones integradas) */}
        <div className="stat-card action-stat-card">
          <div className="stat-card-header">
            <span className="label-md text-secondary-color uppercase">Productos</span>
            <span className="material-symbols-outlined stat-icon primary-icon">inventory_2</span>
          </div>
          <div className="stat-value">{totalProducts.toLocaleString()}</div>
          <div className="stat-trend">
            <span className="material-symbols-outlined trend-arrow primary-text">arrow_upward</span>
            <span className="trend-percentage primary-text">+2.4%</span>
            <span className="trend-label text-secondary-color">desde el mes pasado</span>
          </div>
          <div className="stat-actions">
            <Link to="/products" className="md3-btn md3-btn-outlined btn-sm flex-1">
              <span className="material-symbols-outlined icon-btn">list</span>
              Ver Listado
            </Link>
            <Link to="/products/new" className="md3-btn md3-btn-filled btn-sm flex-1">
              <span className="material-symbols-outlined icon-btn">add</span>
              Agregar Producto
            </Link>
          </div>
        </div>

        {/* Tarjeta 2 (Categorías con acciones integradas) */}
        <div className="stat-card action-stat-card">
          <div className="stat-card-header">
            <span className="label-md text-secondary-color uppercase">Categorías</span>
            <span className="material-symbols-outlined stat-icon primary-icon">category</span>
          </div>
          <div className="stat-value">{totalCategories}</div>
          <div className="stat-trend">
            <span className="trend-label text-secondary-color">Activas en múltiples departamentos</span>
          </div>
          <div className="stat-actions">
            <Link to="/categories" className="md3-btn md3-btn-outlined btn-sm flex-1">
              <span className="material-symbols-outlined icon-btn">list</span>
              Ver Listado
            </Link>
            <Link to="/categories/new" className="md3-btn md3-btn-filled btn-sm flex-1">
              <span className="material-symbols-outlined icon-btn">add</span>
              Agregar Categoría
            </Link>
          </div>
        </div>

        {/* Tarjeta 3 (Alerta de Stock Bajo) */}
        <div className="stat-card border-error">
          <div className="stat-card-header">
            <span className="label-md text-secondary-color uppercase">Stock Bajo</span>
            <span className="material-symbols-outlined stat-icon error-icon">warning</span>
          </div>
          <div className="stat-value">{lowStock}</div>
          <div className="stat-trend">
            <span className="material-symbols-outlined trend-arrow error-text">arrow_upward</span>
            <span className="trend-percentage error-text">+{lowStock}</span>
            <span className="trend-label text-secondary-color">requieren reabastecimiento</span>
          </div>
        </div>

        {/* Tarjeta 4 */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="label-md text-secondary-color uppercase">Ventas Recientes (30d)</span>
            <span className="material-symbols-outlined stat-icon primary-icon">payments</span>
          </div>
          <div className="stat-value">{recentSales}</div>
          <div className="stat-trend">
            <span className="material-symbols-outlined trend-arrow primary-text">arrow_upward</span>
            <span className="trend-percentage primary-text">+8.1%</span>
            <span className="trend-label text-secondary-color">vs período anterior</span>
          </div>
        </div>
      </div>

      {/* Distribución del Contenido Principal */}
      <div className="home-split-layout">
        {/* Acciones Rápidas y Alertas */}
        <div className="left-column">
          {/* Gráfico Visual */}
          <div className="card shadow-sm flex-center min-h-200 bg-container-low">
            <div className="visual-placeholder text-center">
              <span className="material-symbols-outlined placeholder-icon">bar_chart</span>
              <p className="body-sm text-secondary-color">Gráfico de Estado del Inventario<br/>(Respaldo Visual)</p>
            </div>
          </div>
        </div>


        {/* Tabla de Actividad Reciente */}
        <div className="right-column card shadow-sm p-0">
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
        </div>
      </div>
    </div>
  );
}
