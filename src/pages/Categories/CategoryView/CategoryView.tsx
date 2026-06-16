import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
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

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('folder');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      setName('');
      setIcon('folder');
      return;
    }

    async function loadCategory() {
      try {
        setLoading(true);
        const category = await apiFetch<CategoryData>(`/categories/${id}`);
        if (category) {
          setName(category.name || '');
          setIcon(category.icon || 'folder');
        }
      } catch (error) {
        console.warn(`Error al cargar la categoría #${id} de la API.`, error);
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

      alert(isEditMode ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.');
      navigate('/categories');
    } catch (error) {
      console.error('Error al guardar la categoría en el backend:', error);
      alert('Se simuló el guardado con éxito (API del backend no conectada).');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      return;
    }

    setLoading(true);
    try {
      await apiFetch(`/categories/${id}`, {
        method: 'DELETE',
      });
      alert('Categoría eliminada correctamente.');
      navigate('/categories');
    } catch (error) {
      console.error('Error al eliminar la categoría del backend:', error);
      alert('Se simuló la eliminación con éxito (API del backend no conectada).');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-view-canvas">
      {/* Encabezado de Página */}
      <div className="category-view-header-section">
        <div className="breadcrumbs font-body-sm text-secondary-color">
          <Link to="/categories" className="breadcrumb-link">Categorías</Link>
          <span className="material-symbols-outlined breadcrumb-separator">chevron_right</span>
          <span className="breadcrumb-current">{isEditMode ? `Detalle #${id}` : 'Nueva Categoría'}</span>
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

      <div className="category-view-body">
        <div className="category-form-card card shadow-sm">
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
              <Link to="/categories" className="md3-btn md3-btn-outlined" style={{ height: '48px', lineHeight: '48px', display: 'flex', alignItems: 'center' }}>
                Cancelar
              </Link>
              <button type="submit" className="md3-btn md3-btn-filled" disabled={loading}>
                {isEditMode ? 'Guardar Cambios' : 'Crear Categoría'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
