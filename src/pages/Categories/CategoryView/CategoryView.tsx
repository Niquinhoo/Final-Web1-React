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

export default function CategoryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;

  const dialog = useDialog();
  const snackbar = useSnackbar();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('folder');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    async function loadCategory() {
      try {
        setLoading(true);
        const category = await apiFetch<CategoryData>(`/categories/${id}`);
        if (category) {
          setName(category.name || '');
          setIcon(category.icon || 'folder');
      }
    } catch (error) {
      console.warn(`Error al cargar la categoría #${id}.`, error);
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [id, isEditMode]);

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

      await apiFetch<CategoryData>(endpoint, {
        method,
        body: JSON.stringify(categoryPayload),
      });

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
      </div>
    </div>
  );
}
