import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import './CategoriesList.css';

interface Category {
  id: string | number;
  name: string;
  icon?: string;
}

export default function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const data = await apiFetch<Category[]>('/categories');
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.warn('Error al cargar categorías del backend.', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="categories-canvas">
      {/* Encabezado de Página y Acciones */}
      <div className="categories-header-section">
        <div>
          <h2 className="headline-md">Categorías</h2>
          <p className="body-sm text-secondary-color mt-1">Organiza los productos mediante departamentos y clasificaciones.</p>
        </div>
        <div className="header-actions-group">
          <Link to="/categories/new" className="md3-btn md3-btn-filled">
            <span className="material-symbols-outlined icon-btn">add</span>
            Nueva Categoría
          </Link>
        </div>
      </div>

      {/* Grilla de Categorías */}
      <div className="categories-grid">
        {loading ? (
          <div className="text-center text-secondary-color" style={{ gridColumn: '1 / -1', padding: '48px' }}>
            Cargando categorías...
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center text-secondary-color" style={{ gridColumn: '1 / -1', padding: '48px' }}>
            No se encontraron categorías.
          </div>
        ) : (
          categories.map(category => (
            <div key={category.id} className="category-card">
              <span className="material-symbols-outlined category-card-icon">
                {category.icon || 'folder'}
              </span>
              <div className="category-info">
                <h3 className="headline-sm">{category.name}</h3>
                <p className="body-sm text-secondary-color">ID: #{category.id}</p>
              </div>
              <div className="category-actions">
                <Link to={`/categories/${category.id}`} className="md3-btn md3-btn-outlined btn-sm">
                  Editar
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
