import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import { Button, Card } from '../../../components/atoms';
import { useDialog, useSnackbar } from '../../../components/molecules';
import './UserView.css';

interface UserData {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  adminFlag: boolean;
}

export default function UserView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== undefined;
  const dialog = useDialog();
  const snackbar = useSnackbar();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [adminFlag, setAdminFlag] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    async function loadUser() {
      try {
        setLoading(true);
        const user = await apiFetch<UserData>(`/users/${id}`);
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setEmail(user.email || '');
        setAdminFlag(Boolean(user.adminFlag));
      } catch (error) {
        console.warn(`Error al cargar el usuario #${id}.`, error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [id, isEditMode]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isEditMode && !password) {
      snackbar.show('La contraseña es obligatoria para crear un usuario.');
      return;
    }

    if ((password || confirmPassword) && password !== confirmPassword) {
      snackbar.show('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        firstName,
        lastName,
        email,
        adminFlag,
        password: password || undefined,
        confirmPassword: confirmPassword || undefined,
      };
      const endpoint = isEditMode ? `/users/${id}` : '/users';
      const method = isEditMode ? 'PUT' : 'POST';

      await apiFetch<UserData>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      snackbar.show(isEditMode ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
      navigate('/admin/users');
    } catch (error) {
      snackbar.show(error instanceof Error ? error.message : 'No se pudo guardar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await dialog.confirm({
      title: 'Eliminar usuario',
      message: '¿Estás seguro de que deseas eliminar este usuario?',
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      danger: true,
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      snackbar.show('Usuario eliminado correctamente.');
      navigate('/admin/users');
    } catch (error) {
      snackbar.show(error instanceof Error ? error.message : 'No se pudo eliminar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-view-canvas">
      <div className="user-view-header-section">
        <div className="breadcrumbs font-body-sm text-secondary-color">
          <Link to="/admin/users" className="breadcrumb-link">Usuarios</Link>
          <span className="material-symbols-outlined breadcrumb-separator">chevron_right</span>
          <span className="breadcrumb-current">{isEditMode ? `#${id}` : 'Nuevo Usuario'}</span>
        </div>
        {isEditMode && (
          <Button variant="danger" icon="delete" onClick={handleDelete} disabled={loading}>
            Eliminar
          </Button>
        )}
      </div>

      <div className="user-view-body">
        <Card className="user-form-card">
          <h3 className="headline-sm">{isEditMode ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</h3>
          <form onSubmit={handleSave} className="md3-form">
            <div className="form-fields-row">
              <div className="form-field-group flex-1">
                <label htmlFor="user-first-name" className="label-sm uppercase">Nombre *</label>
                <input
                  id="user-first-name"
                  type="text"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="md3-input"
                  disabled={loading}
                />
              </div>
              <div className="form-field-group flex-1">
                <label htmlFor="user-last-name" className="label-sm uppercase">Apellido *</label>
                <input
                  id="user-last-name"
                  type="text"
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="md3-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-field-group">
              <label htmlFor="user-email" className="label-sm uppercase">Email *</label>
              <input
                id="user-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="md3-input"
                disabled={loading}
              />
            </div>

            <label className="admin-toggle-row">
              <input
                type="checkbox"
                checked={adminFlag}
                onChange={(event) => setAdminFlag(event.target.checked)}
                disabled={loading}
              />
              <span>
                <strong>Administrador</strong>
                <small>Puede acceder y gestionar el dashboard.</small>
              </span>
            </label>

            <div className="form-fields-row">
              <div className="form-field-group flex-1">
                <label htmlFor="user-password" className="label-sm uppercase">
                  {isEditMode ? 'Nueva Contraseña' : 'Contraseña *'}
                </label>
                <input
                  id="user-password"
                  type="password"
                  required={!isEditMode}
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="md3-input"
                  disabled={loading}
                />
              </div>
              <div className="form-field-group flex-1">
                <label htmlFor="user-confirm-password" className="label-sm uppercase">Repetir Contraseña</label>
                <input
                  id="user-confirm-password"
                  type="password"
                  required={!isEditMode || Boolean(password)}
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="md3-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-btn-actions">
              <Link to="/admin/users" className="md3-btn md3-btn-outlined user-cancel-link">
                Cancelar
              </Link>
              <Button variant="filled" type="submit" disabled={loading}>
                {isEditMode ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
