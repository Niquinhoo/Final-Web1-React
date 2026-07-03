import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import { Button, Card } from '../../../components/atoms';
import { useDialog, useSnackbar } from '../../../components/molecules';
import './CategoryView.css';

interface CategoryData {
  id?: string | number;
  name: string;
  icon?: string;
}

interface ProductData {
  id: string | number;
  title: string;
  category: string;
  price: number;
  stock: number;
  src?: string;
  description?: string;
}

export default function CategoryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;

  const dialog = useDialog();
  const snackbar = useSnackbar();

  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [icon, setIcon] = useState('folder');
  const [products, setProducts] = useState<ProductData[]>([]);
  const [assignedProductIds, setAssignedProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    async function loadCategory() {
      try {
        setLoading(true);
        const [category, productsList] = await Promise.all([
          apiFetch<CategoryData>(`/categories/${id}`),
          apiFetch<ProductData[]>('/products'),
        ]);
        if (category) {
          const categoryName = category.name || '';
          setName(categoryName);
          setOriginalName(categoryName);
          setIcon(category.icon || 'folder');
          setProducts(productsList);
          setAssignedProductIds(
            productsList
              .filter((product) => product.category === categoryName)
              .map((product) => String(product.id)),
          );
        }
      } catch (error) {
        console.warn(`Error al cargar la categoría #${id}.`, error);
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [id, isEditMode]);

  const toggleAssignedProduct = (productId: string | number) => {
    const key = String(productId);
    setAssignedProductIds((current) => (
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    ));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const categoryPayload: CategoryData = {
      name,
      icon,
    };

    try {
      const endpoint = isEditMode ? `/categories/${id}` : '/categories';
      const method = isEditMode ? 'PUT' : 'POST';

      const savedCategory = await apiFetch<CategoryData>(endpoint, {
        method,
        body: JSON.stringify(categoryPayload),
      });

      if (isEditMode) {
        const selected = new Set(assignedProductIds);
        await Promise.all(products.map((product) => {
          const shouldBelong = selected.has(String(product.id));
          const belongedBefore = product.category === originalName;
          const nextCategory = shouldBelong ? savedCategory.name : belongedBefore ? 'Otros' : product.category;

          if (nextCategory === product.category) return Promise.resolve();

          return apiFetch<ProductData>(`/products/${product.id}`, {
            method: 'PUT',
            body: JSON.stringify({ ...product, category: nextCategory }),
          });
        }));
      }

      snackbar.show(isEditMode ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error al guardar la categoría localmente:', error);
      snackbar.show('No se pudo guardar la categoría.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await dialog.confirm({
      title: 'Eliminar categoría',
      message: '¿Estás seguro de que deseas eliminar esta categoría?',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      danger: true,
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      await apiFetch(`/categories/${id}`, {
        method: 'DELETE',
      });
      snackbar.show('Categoría eliminada correctamente.');
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error al eliminar la categoría localmente:', error);
      snackbar.show('No se pudo eliminar la categoría.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-view-canvas">
      <div className="category-view-header-section">
        <div className="breadcrumbs font-body-sm text-secondary-color">
          <Link to="/admin/categories" className="breadcrumb-link">Categorías</Link>
          <span className="material-symbols-outlined breadcrumb-separator">chevron_right</span>
          <span className="breadcrumb-current">{isEditMode ? `Detalle #${id}` : 'Nueva Categoría'}</span>
        </div>
        {isEditMode && (
          <Button variant="danger" icon="delete" onClick={handleDelete} disabled={loading}>
            Eliminar
          </Button>
        )}
      </div>

      <div className="category-view-body">
        <Card className="category-form-card">
          <h3 className="headline-sm">{isEditMode ? 'Editar Categoría' : 'Agregar Nueva Categoría'}</h3>
          <form onSubmit={handleSave} className="md3-form">
            <div className="form-field-group">
              <label htmlFor="cat-name" className="label-sm uppercase">Nombre de la Categoría *</label>
              <input
                type="text"
                id="cat-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la categoría"
                className="md3-input"
                disabled={loading}
              />
            </div>

            <div className="form-field-group">
              <label htmlFor="cat-icon" className="label-sm uppercase">Icono (Nombre del icono en Material Symbols)</label>
              <input
                type="text"
                id="cat-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Ej: devices, home, apparel, laundry"
                className="md3-input"
                disabled={loading}
              />
            </div>

            <div className="form-btn-actions">
              <Link to="/admin/categories" className="md3-btn md3-btn-outlined" style={{ height: '48px', lineHeight: '48px', display: 'flex', alignItems: 'center' }}>
                Cancelar
              </Link>
              <button type="submit" className="md3-btn md3-btn-filled" disabled={loading}>
                {isEditMode ? 'Guardar Cambios' : 'Crear Categoría'}
              </button>
            </div>
          </form>
        </Card>

        {isEditMode && (
          <Card className="category-products-card">
            <h3 className="headline-sm">Productos en la categoría</h3>
            <p className="body-sm text-secondary-color">
              Marca los productos que deben pertenecer a esta categoría.
            </p>
            <div className="category-products-list">
              {products.length === 0 ? (
                <p className="body-sm text-secondary-color">No hay productos disponibles.</p>
              ) : (
                products.map((product) => (
                  <label key={product.id} className="category-product-row">
                    <input
                      type="checkbox"
                      checked={assignedProductIds.includes(String(product.id))}
                      onChange={() => toggleAssignedProduct(product.id)}
                      disabled={loading}
                    />
                    <span>
                      <strong>{product.title}</strong>
                      <small>{product.category}</small>
                    </span>
                  </label>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
