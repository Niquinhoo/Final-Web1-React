import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import { Chip, CircularProgress } from '../../../components/atoms';
import { useDialog, useSnackbar } from '../../../components/molecules';
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

interface Category {
  id: string | number;
  name: string;
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

/** Mapea los estados persistidos localmente a etiquetas en español. */
function normalizeStatus(status: string): string {
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
}

function getChipColor(status: string) {
  switch (status) {
    case 'Activo':
      return 'success' as const;
    case 'Stock Bajo':
      return 'warning' as const;
    case 'Sin Stock':
      return 'danger' as const;
    default:
      return 'neutral' as const;
  }
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get('filter');

  const dialog = useDialog();
  const snackbar = useSnackbar();

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await apiFetch<Product[]>('/products');
        if (Array.isArray(data)) {
          const normalized = data.map(p => ({
            ...p,
            status: normalizeStatus(p.status)
          }));
          setProducts(normalized);
        } else {
          setProducts([]);
        }
      } catch {
        console.warn('Error al cargar productos locales.');
        setProducts([]);
      } finally {
        setLoading(false);
      }

      try {
        const categoriesList = await apiFetch<Category[]>('/categories');
        if (Array.isArray(categoriesList)) {
          setTotalCategories(categoriesList.length);
        }
      } catch {
        // Fallback silencioso
      }
    }

    fetchProducts();
  }, []);

  const handleDelete = async (id: string | number) => {
    const confirmed = await dialog.confirm({
      title: 'Eliminar producto',
      message: '¿Estás seguro de que deseas eliminar este producto?',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      danger: true,
    });

    if (!confirmed) return;

    try {
      await apiFetch(`/products/${id}`, {
        method: 'DELETE',
      });
      setProducts(prev => prev.filter(p => p.id !== id));
      snackbar.show('Producto eliminado correctamente.');
    } catch {
      console.warn('Error al eliminar producto local.');
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter(product => {
    if (filterType === 'low-stock' && product.stock > 12) {
      return false;
    }
    const term = searchTerm.toLowerCase();
    return (
      product.title.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.id.toString().includes(term)
    );
  });

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock <= 12).length;

  return (
    <div className="products-canvas">
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
          <Link to="/admin/products/new" className="md3-btn md3-btn-filled">
            <span className="material-symbols-outlined icon-btn">add</span>
            <span className="btn-text">Agregar Producto</span>
          </Link>
        </div>
      </div>

      <div className="products-summary-row">
        <div className="products-summary-card card interactive">
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

        <div className="products-summary-card card interactive">
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

        <div className="products-summary-card card interactive">
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

      {filterType === 'low-stock' && (
        <div className="filter-badge-row" style={{ display: 'flex', gap: '8px', padding: '0 0 16px 8px', alignItems: 'center' }}>
          <span className="body-sm text-secondary-color" style={{ fontSize: '13px', fontWeight: 500 }}>Filtrado por:</span>
          <Chip 
            label="Stock Bajo" 
            color="warning" 
            trailingIcon="close"
            onClick={() => navigate('/admin/products')}
          />
        </div>
      )}

      <div className="products-table-container card p-0">
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
                  <td colSpan={8} className="text-center" style={{ padding: '32px' }}>
                    <div className="loading-row">
                      <CircularProgress size={32} />
                      <span className="body-sm text-secondary-color" style={{ marginLeft: '12px' }}>Cargando productos...</span>
                    </div>
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
                      <Link to={`/admin/products/${product.id}`} className="product-name-link font-semibold">
                        {product.title}
                      </Link>
                    </td>
                    <td>{product.category}</td>
                    <td className="text-right">${product.price.toFixed(2)}</td>
                    <td className={`text-right ${product.stock <= 12 ? 'error-text font-semibold' : ''}`}>
                      {product.stock}
                    </td>
                    <td className="text-center">
                      <Chip label={product.status} color={getChipColor(product.status)} />
                    </td>
                    <td className="text-right">
                      <div className="table-row-actions">
                        <Link to={`/admin/products/${product.id}`} className="action-icon-btn" title="Editar">
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
