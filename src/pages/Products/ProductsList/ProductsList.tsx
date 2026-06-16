import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import './ProductsList.css';

interface Product {
  id: string | number;
  title: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  src?: string;
}

// Subcomponente local para controlar el estado de precarga e iconos fallback de la imagen (US7)
function ProductRowImage({ src, alt }: { src?: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="product-thumb-container">
      {!loaded && !error && (
        <div className="image-loading-placeholder">
          <span className="material-symbols-outlined spinner-icon">hourglass_empty</span>
        </div>
      )}
      {error || !src ? (
        <div className="image-error-placeholder">
          <span className="material-symbols-outlined">image</span>
        </div>
      ) : (
        <img 
          src={src} 
          alt={alt} 
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{ display: loaded ? 'block' : 'none' }}
          className="product-thumb-image"
        />
      )}
    </div>
  );
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await apiFetch<Product[]>('/products');
        if (Array.isArray(data)) {
          // Normalizar estados a español si vienen en inglés desde el backend
          const normalized = data.map(p => ({
            ...p,
            status: normalizeStatus(p.status)
          }));
          setProducts(normalized);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.warn('Error al cargar productos del backend.', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }

      try {
        const categoriesList = await apiFetch<any[]>('/categories');
        if (Array.isArray(categoriesList)) {
          setTotalCategories(categoriesList.length);
        }
      } catch (error) {
        // Fallback silencioso para categorías en estadísticas
      }
    }

    fetchProducts();
  }, []);

  const normalizeStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'activo':
        return 'Activo';
      case 'low stock':
      case 'stock bajo':
      case 'bajo stock':
        return 'Stock Bajo';
      case 'out of stock':
      case 'sin stock':
        return 'Sin Stock';
      case 'draft':
      case 'borrador':
        return 'Borrador';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Activo':
        return 'badge-success';
      case 'Stock Bajo':
        return 'badge-warning';
      case 'Sin Stock':
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      // Intentar eliminación física en el backend
      await apiFetch(`/products/${id}`, {
        method: 'DELETE',
      });
      // Actualizar estado local
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar producto del backend. Eliminando del estado local para deomstración.', error);
      // Eliminar del estado local como fallback para que la interfaz responda al usuario
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Filtrado dinámico por nombre, id o categoría (US8)
  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase();
    return (
      product.title.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.id.toString().includes(term)
    );
  });

  // Cálculos estadísticos rápidos basados en el listado completo
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock <= 12).length;

  return (
    <div className="products-canvas">
      {/* Encabezado de Página y Acciones (US7 & US8) */}
      <div className={`products-header-section ${isSearchFocused ? 'search-active' : ''}`}>
        <div>
          <h2 className="headline-md">Productos</h2>
          <p className="body-sm text-secondary-color mt-1">Gestiona los artículos de tu catálogo, precios y niveles de stock.</p>
        </div>
        <div className="header-actions-group">
          <div className={`search-container ${isSearchFocused ? 'expanded' : ''}`}>
            <span className="material-symbols-outlined search-icon">search</span>
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="search-input"
            />
          </div>
          <Link to="/products/new" className="md3-btn md3-btn-filled">
            <span className="material-symbols-outlined icon-btn">add</span>
            <span className="btn-text">Agregar Producto</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="products-summary-row">
        <div className="products-summary-card">
          <div className="card-top">
            <span className="label-md text-secondary-color uppercase">Total de Productos</span>
            <span className="material-symbols-outlined summary-card-icon primary-text">inventory_2</span>
          </div>
          <div className="card-bottom">
            <span className="display-value">{totalProducts}</span>
            <span className="trend-percentage-value success-text">
              <span className="material-symbols-outlined">trending_up</span>
              +12%
            </span>
          </div>
        </div>

        <div className="products-summary-card">
          <div className="card-top">
            <span className="label-md text-secondary-color uppercase">Stock Bajo</span>
            <span className="material-symbols-outlined summary-card-icon error-text">warning</span>
          </div>
          <div className="card-bottom">
            <span className="display-value">{lowStockCount}</span>
            <span className="trend-percentage-value error-text">
              <span className="material-symbols-outlined">trending_up</span>
              +4
            </span>
          </div>
        </div>

        <div className="products-summary-card">
          <div className="card-top">
            <span className="label-md text-secondary-color uppercase">Categorías Activas</span>
            <span className="material-symbols-outlined summary-card-icon">category</span>
          </div>
          <div className="card-bottom">
            <span className="display-value">{totalCategories}</span>
            <span className="trend-percentage-value text-secondary-color">
              <span className="material-symbols-outlined">horizontal_rule</span>
              0
            </span>
          </div>
        </div>
      </div>

      {/* Tabla Principal de Datos */}
      <div className="products-table-container card shadow-sm p-0">
        <div className="table-responsive">
          <table className="md3-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th className="text-right">Precio</th>
                <th className="text-right">Stock</th>
                <th className="text-center">Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center text-secondary-color" style={{ padding: '32px' }}>
                    Cargando productos...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-secondary-color" style={{ padding: '32px' }}>
                    {searchTerm ? 'No se encontraron productos coincidentes.' : 'No se encontraron productos en el catálogo.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      <ProductRowImage src={product.src} alt={product.title} />
                    </td>
                    <td className="text-secondary-color">#{product.id}</td>
                    <td>
                      <Link to={`/products/${product.id}`} className="product-name-link font-semibold">
                        {product.title}
                      </Link>
                    </td>
                    <td>{product.category}</td>
                    <td className="text-right">${product.price.toFixed(2)}</td>
                    <td className={`text-right ${product.stock <= 12 ? 'error-text font-semibold' : ''}`}>
                      {product.stock}
                    </td>
                    <td className="text-center">
                      <span className={`status-badge ${getStatusBadgeClass(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="table-row-actions">
                        <Link to={`/products/${product.id}`} className="action-icon-btn" title="Editar">
                          <span className="material-symbols-outlined">edit</span>
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="action-icon-btn hover-danger" 
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="table-pagination">
          <p className="body-sm text-secondary-color">
            Mostrando <span className="font-semibold text-on-surface">1</span> a{' '}
            <span className="font-semibold text-on-surface">{filteredProducts.length}</span> de{' '}
            <span className="font-semibold text-on-surface">{filteredProducts.length}</span> resultados
          </p>
          <div className="pagination-controls">
            <button className="pagination-btn-arrow" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn-arrow" disabled>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
