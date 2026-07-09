import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import { Button, IconButton, Card } from '../../../components/atoms';
import { useDialog, useSnackbar } from '../../../components/molecules';
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

interface CategoryData {
  id: string | number;
  name: string;
}

export default function ProductView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;

  const dialog = useDialog();
  const snackbar = useSnackbar();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [src, setSrc] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Otros');
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [originalData, setOriginalData] = useState<ProductData | null>(null);

  const getProductImageUrl = (url: string) => {
    if (!url) return '';
    if (/^(https?:|data:|blob:|\/)/.test(url)) return url;
    return `/${url}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const data = await apiFetch<{ url: string }>('/upload', {
        method: 'POST',
        body: formData,
      });
      if (data && data.url) {
        setSrc(data.url);
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      snackbar.show('Error al guardar la imagen localmente.');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await apiFetch<CategoryData[]>('/categories');
        const loadedCategories = Array.isArray(data) ? data : [];
        setCategories(loadedCategories);
        if (!isEditMode && loadedCategories.length > 0) {
          setCategory((current) => (
            loadedCategories.some((item) => item.name === current) ? current : loadedCategories[0].name
          ));
        }
      } catch (error) {
        console.warn('Error al cargar categorías locales.', error);
      }
    }

    loadCategories();
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) return;

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
          setCategory(product.category || 'Otros');
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

  const handleCancel = async () => {
    if (isEditMode && originalData) {
      const confirmed = await dialog.confirm({
        title: 'Revertir cambios',
        message: '¿Deseas descartar los cambios realizados y volver al estado original?',
        confirmLabel: 'Revertir',
        cancelLabel: 'Cancelar',
      });

      if (confirmed) {
        setTitle(originalData.title || '');
        setPrice(originalData.price || 0);
        setStock(originalData.stock || 0);
        setSrc(originalData.src || '');
        setDescription(originalData.description || '');
        setCategory(originalData.category || 'Otros');
        snackbar.show('Cambios revertidos al estado original.');
      }
    } else {
      setTitle('');
      setPrice(0);
      setStock(0);
      setSrc('');
      setDescription('');
        setCategory('Otros');
      snackbar.show('Formulario de creación restablecido.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      const endpoint = isEditMode ? `/products/${id}` : '/products';
      const method = isEditMode ? 'PUT' : 'POST';

      await apiFetch<ProductData>(endpoint, {
        method,
        body: JSON.stringify(productPayload),
      });

      snackbar.show(isEditMode ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error al guardar el producto localmente:', error);
      snackbar.show('No se pudo guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await dialog.confirm({
      title: 'Eliminar producto',
      message: '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      danger: true,
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      await apiFetch(`/products/${id}`, {
        method: 'DELETE',
      });
      snackbar.show('Producto eliminado correctamente.');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error al eliminar el producto localmente:', error);
      snackbar.show('No se pudo eliminar el producto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-view-canvas">
      <div className="product-view-header-section">
        <div className="breadcrumbs font-body-sm text-secondary-color">
          <Link to="/admin/products" className="breadcrumb-link">Productos</Link>
          <span className="material-symbols-outlined breadcrumb-separator">chevron_right</span>
          <span className="breadcrumb-current">{isEditMode ? `#${id}` : 'Nuevo Producto'}</span>
        </div>
        {isEditMode && (
          <Button variant="danger" icon="delete" onClick={handleDelete} disabled={loading}>
            Eliminar
          </Button>
        )}
      </div>

      <div className="product-view-split">
        <Card className="product-preview-card">
          <h3 className="headline-sm">Vista Previa</h3>
          <div className="preview-image-box">
            {src ? (
              <img src={getProductImageUrl(src)} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
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
        </Card>

        <Card className="product-edit-card">
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

            <div className="form-fields-row">
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
                  {categories.length === 0 && <option value={category}>{category}</option>}
                  {categories.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-field-group">
              <label htmlFor="prod-stock" className="label-sm uppercase">Stock *</label>
              <div className="md3-stock-adjuster">
                <IconButton
                  variant="outlined"
                  icon="remove"
                  label="Reducir stock"
                  onClick={() => handleStockChange(-1)}
                  disabled={loading}
                  size={20}
                />
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
                <IconButton
                  variant="outlined"
                  icon="add"
                  label="Aumentar stock"
                  onClick={() => handleStockChange(1)}
                  disabled={loading}
                  size={20}
                />
              </div>
            </div>

            <div className="form-field-group">
              <label htmlFor="prod-image" className="label-sm uppercase">Imagen del Producto</label>
              <div className="product-image-controls">
                <input
                  type="text"
                  id="prod-image"
                  value={src}
                  onChange={(e) => setSrc(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg o sube un archivo"
                  className="md3-input"
                  style={{ flex: 1, margin: 0 }}
                  disabled={loading || uploadingImage}
                />
                <label className="md3-btn md3-btn-outlined" style={{ height: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: 0, whiteSpace: 'nowrap' }}>
                  <span className="material-symbols-outlined icon-btn" style={{ marginRight: '8px' }}>upload</span>
                  {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    disabled={loading || uploadingImage}
                  />
                </label>
                {src && (
                  <Button
                    variant="outlined"
                    icon="no_photography"
                    onClick={() => setSrc('')}
                    disabled={loading || uploadingImage}
                    size="sm"
                  >
                    Eliminar Imagen
                  </Button>
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

            <div className="form-btn-actions centered-btn-actions">
              <Button variant="outlined" icon="close" onClick={handleCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button variant="filled" type="submit" icon={isEditMode ? "save" : "add"} disabled={loading}>
                {isEditMode ? 'Guardar Cambios' : 'Crear Producto'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
