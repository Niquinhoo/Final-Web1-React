import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import { Chip, CircularProgress } from '../../../components/atoms';
import { useDialog, useSnackbar } from '../../../components/molecules';
import './UsersList.css';

interface UserData {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  adminFlag: boolean;
  createdAt: string;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('es-AR');
}

export default function UsersList() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const dialog = useDialog();
  const snackbar = useSnackbar();

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setUsers(await apiFetch<UserData[]>('/users'));
      } catch (error) {
        console.warn('Error al cargar usuarios locales.', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      String(user.id).includes(term)
    );
  });
  const adminCount = users.filter((user) => user.adminFlag).length;

  const handleDelete = async (id: number) => {
    const confirmed = await dialog.confirm({
      title: 'Eliminar usuario',
      message: '¿Estás seguro de que deseas eliminar este usuario?',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      danger: true,
    });

    if (!confirmed) return;

    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      setUsers((current) => current.filter((user) => user.id !== id));
      snackbar.show('Usuario eliminado correctamente.');
    } catch (error) {
      console.warn('Error al eliminar usuario local.', error);
      snackbar.show('No se pudo eliminar el usuario.');
    }
  };

  return (
    <div className="users-canvas">
      <div className="users-header-section">
        <div>
          <h2 className="headline-md">Usuarios</h2>
          <p className="body-sm text-secondary-color mt-1">Gestiona cuentas y permisos del panel.</p>
        </div>
        <div className="header-actions-group">
          <div className="users-search-container">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="search-input"
            />
          </div>
          <Link to="/admin/users/new" className="md3-btn md3-btn-filled">
            <span className="material-symbols-outlined icon-btn">person_add</span>
            <span className="btn-text">Agregar Usuario</span>
          </Link>
        </div>
      </div>

      <div className="users-summary-row">
        <div className="users-summary-card card interactive">
          <span className="label-md text-secondary-color uppercase">Total de Usuarios</span>
          <strong>{users.length}</strong>
        </div>
        <div className="users-summary-card card interactive">
          <span className="label-md text-secondary-color uppercase">Administradores</span>
          <strong>{adminCount}</strong>
        </div>
      </div>

      <div className="users-table-container card p-0">
        <div className="table-responsive">
          <table className="md3-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th className="text-center">Rol</th>
                <th>Alta</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center users-loading-cell">
                    <CircularProgress size={32} />
                    <span className="body-sm text-secondary-color">Cargando usuarios...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-secondary-color users-empty-cell">
                    {searchTerm ? 'No se encontraron usuarios coincidentes.' : 'No hay usuarios registrados.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="text-secondary-color">#{user.id}</td>
                    <td>
                      <Link to={`/admin/users/${user.id}`} className="user-name-link font-semibold">
                        {user.name}
                      </Link>
                    </td>
                    <td>{user.email}</td>
                    <td className="text-center">
                      <Chip label={user.adminFlag ? 'Admin' : 'Usuario'} color={user.adminFlag ? 'success' : 'neutral'} />
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td className="text-right">
                      <div className="table-row-actions">
                        <Link to={`/admin/users/${user.id}`} className="action-icon-btn" title="Editar">
                          <span className="material-symbols-outlined">edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
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
      </div>
    </div>
  );
}
