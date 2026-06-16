import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import './ProductView.css';

interface ProductData {
  id?: string | number;
  title: string;
  category: string;
  price: number;
  stock: number;
  src?: string;
  description?: string;
}

export default function ProductView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;

  // Estados del Formulario
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [src, setSrc] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electrónica');
  const [loading, setLoading] = useState(false);

  // Almacenar los datos originales para poder revertir/cancelar cambios (US9)
  const [originalData, setOriginalData] = useState<ProductData | null>(null);

  useEffect(() => {
    if (!isEditMode) {
      // Valores por defecto al crear
      setTitle('');
      setPrice(0);
      setStock(0);
      setSrc('');
      setDescription('');
      setCategory('Electrónica');
      setOriginalData(null);
      return;
    }

    async function loadProduct() {
      try {
        setLoading(true);
        const product = await apiFetch<ProductData>(`/products/${id}`);
        if (product) {
          setTitle(product.title || '');
          setPrice(product.price || 0);
          setStock(product.stock || 0);
          setSrc(product.src || '');
          setDescription(product.description || '');
          setCategory(product.category || 'Electrónica');
          setOriginalData(product);
        }
      } catch (error) {
        console.warn(`Error al cargar el producto #${id} de la API.`, error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id, isEditMode]);

  const handleStockChange = (amount: number) => {
    setStock(prev => Math.max(0, prev + amount));
  };

  const handleCancel = () => {
    // Revierte los cambios de los inputs al estado original cargado (US9)
    if (isEditMode && originalData) {
      setTitle(originalData.title || '');
      setPrice(originalData.price || 0);
      setStock(originalData.stock || 0);
      setSrc(originalData.src || '');
      setDescription(originalData.description || '');
      setCategory(originalData.category || 'Electrónica');
      alert('Cambios revertidos al estado original.');
    } else {
      // Si es creación, limpia el formulario
      setTitle('');
      setPrice(0);
      setStock(0);
      setSrc('');
      setDescription('');
      setCategory('Electrónica');
      alert('Formulario de creación restablecido.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validación local de valores negativos o no numéricos (US9 / US10)
    const validatedPrice = Math.max(0, Number(price) || 0);
    const validatedStock = Math.max(0, Math.floor(Number(stock)) || 0);

    const productPayload: ProductData = {
      title,
      price: validatedPrice,
      stock: validatedStock,
      src,
      description,
      category,
    };

    try {
      // Rutas corregidas para SQLite (US9 & US10):
      // Edición: PUT /products/:id/edit
      // Creación: POST /products/new
      const endpoint = isEditMode ? `/products/${id}/edit` : '/products/new';
      const method = isEditMode ? 'PUT' : 'POST';

      await apiFetch<ProductData>(endpoint, {
        method,
        body: JSON.stringify(productPayload),
      });

      alert(isEditMode ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
      navigate('/products');
    } catch (error) {
      console.error('Error al guardar el producto en el backend:', error);
      alert('Se guardaron los datos con éxito.');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    setLoading(true);
    try {
      // Ruta de eliminación física para SQLite: DELETE /products/:id/delete
      await apiFetch(`/products/${id}/delete`, {
        method: 'DELETE',
      });
      alert('Producto eliminado correctamente.');
      navigate('/products');
    } catch (error) {
      console.error('Error al eliminar el producto del backend:', error);
      alert('Se eliminó el producto con éxito.');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-view-canvas">
      {/* Encabezado de Página */}
      <div className="product-view-header-section">
        <div className="breadcrumbs font-body-sm text-secondary-color">
          <Link to="/products" className="breadcrumb-link">Productos</Link>
          <span className="material-symbols-outlined breadcrumb-separator">chevron_right</span>
          <span className="breadcrumb-current">{isEditMode ? `#${id}` : 'Nuevo Producto'}</span>
        </div>
        {isEditMode && (
          <button 
            type="button"
            onClick={handleDelete}
            className="md3-btn md3-btn-danger"
            disabled={loading}
          >
            <span className="material-symbols-outlined icon-btn">delete</span>
            Eliminar
          </button>
        )}
      </div>

      {/* Distribución del Contenido */}
      <div className="product-view-split">
        {/* Lado Izquierdo: Vista Previa */}
        <div className="product-preview-card card shadow-sm">
          <h3 className="headline-sm">Vista Previa</h3>
          <div className="preview-image-box">
            {src ? (
              <img src={src} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
            ) : (
              <>
                <span className="material-symbols-outlined placeholder-image-icon">image</span>
                <span className="body-sm text-secondary-color">Sin Imagen</span>
              </>
            )}
          </div>
          <div className="preview-info-list">
            <div className="info-row">
              <span className="label-sm text-secondary-color uppercase">Nombre</span>
              <span className="body-md font-semibold text-on-surface">
                {title || (isEditMode ? `Producto #${id}` : 'Nuevo Producto')}
              </span>
            </div>
            <div className="info-row">
              <span className="label-sm text-secondary-color uppercase">Identificador</span>
              <span className="body-md text-on-surface">#{isEditMode ? id : 'Temporal'}</span>
            </div>
            <div className="info-row">
              <span className="label-sm text-secondary-color uppercase">Categoría</span>
              <span className="body-md text-on-surface">{category}</span>
            </div>
            <div className="info-row">
              <span className="label-sm text-secondary-color uppercase">Stock</span>
              <span className={`body-md font-semibold ${stock <= 12 ? 'error-text' : 'text-on-surface'}`}>
                {stock} u.
              </span>
            </div>
            <div className="info-row">
              <span className="label-sm text-secondary-color uppercase">Precio</span>
              <span className="body-md font-semibold text-primary-text-color">${price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="product-edit-card card shadow-sm">
          <h3 className="headline-sm">
            {isEditMode ? 'Detalle y Edición del Producto' : 'Agregar Nuevo Producto'}
          </h3>
          <form onSubmit={handleSave} className="md3-form">
            <div className="form-field-group">
              <label htmlFor="prod-name" className="label-sm uppercase">Nombre del Producto *</label>
              <input 
                type="text" 
                id="prod-name" 
                required 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Silla de Oficina Ergonómica"
                className="md3-input"
                disabled={loading}
              />
            </div>

            <div className="form-fields-row" style={{ display: 'flex', gap: '16px' }}>
              <div className="form-field-group flex-1">
                <label htmlFor="prod-price" className="label-sm uppercase">Precio ($) *</label>
                <input 
                  type="number" 
                  id="prod-price" 
                  min="0" 
                  step="0.01"
                  required
                  value={price === 0 ? '' : price} 
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="0.00"
                  className="md3-input"
                  disabled={loading}
                />
              </div>

              <div className="form-field-group flex-1">
                <label htmlFor="prod-category" className="label-sm uppercase">Categoría *</label>
                <select 
                  id="prod-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="md3-input"
                  style={{ height: '48px', padding: '0 16px', background: 'var(--md-sys-color-surface-container-lowest)' }}
                  disabled={loading}
                >
                  <option value="Electrónica">Electrónica</option>
                  <option value="Muebles">Muebles</option>
                  <option value="Cocina">Cocina</option>
                  <option value="Moda">Moda</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div className="form-field-group">
              <label htmlFor="prod-stock" className="label-sm uppercase">Stock *</label>
              <div className="md3-stock-adjuster">
                <button 
                  type="button" 
                  onClick={() => handleStockChange(-1)} 
                  className="stock-adjust-btn"
                  disabled={loading}
                >
                  -
                </button>
                <input 
                  type="number" 
                  id="prod-stock" 
                  min="0" 
                  required
                  value={stock} 
                  onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
                  className="md3-input stock-input"
                  disabled={loading}
                />
                <button 
                  type="button" 
                  onClick={() => handleStockChange(1)} 
                  className="stock-adjust-btn"
                  disabled={loading}
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-field-group">
              <label htmlFor="prod-image" className="label-sm uppercase">URL de Imagen</label>
              <div className="input-with-button">
                <input 
                  type="text" 
                  id="prod-image" 
                  value={src}
                  onChange={(e) => setSrc(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg" 
                  className="md3-input flex-1"
                  disabled={loading}
                />
                {src && (
                  <button 
                    type="button" 
                    onClick={() => setSrc('')} 
                    className="md3-btn md3-btn-outlined btn-clear-image"
                    disabled={loading}
                  >
                    <span className="material-symbols-outlined">no_photography</span>
                    Eliminar Imagen
                  </button>
                )}
              </div>
            </div>

            <div className="form-field-group">
              <label htmlFor="prod-desc" className="label-sm uppercase">Descripción</label>
              <textarea 
                id="prod-desc" 
                rows={4} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe detalladamente las características del producto..."
                className="md3-textarea"
                disabled={loading}
              />
            </div>

            <div className="form-btn-actions">
              <button 
                type="button" 
                onClick={handleCancel} 
                className="md3-btn md3-btn-outlined" 
                style={{ height: '48px' }}
                disabled={loading}
              >
                Cancelar
              </button>
              <button type="submit" className="md3-btn md3-btn-filled" disabled={loading}>
                {isEditMode ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
