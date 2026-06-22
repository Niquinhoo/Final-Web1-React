import { useState } from 'react';
import { Button, IconButton, Card } from '../../components/atoms';
import { useSnackbar } from '../../components/molecules';
import './Profile.css';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  bio: string;
}

function loadProfile(): ProfileData {
  try {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      const parsed = JSON.parse(saved) as ProfileData;
      return {
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
        email: parsed.email || '',
        jobTitle: parsed.jobTitle || '',
        bio: parsed.bio || '',
      };
    }
  } catch {
    // ignore
  }
  return { firstName: '', lastName: '', email: '', jobTitle: '', bio: '' };
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>(loadProfile);
  const snackbar = useSnackbar();

  const setField = <K extends keyof ProfileData>(field: K, value: ProfileData[K]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('user_profile', JSON.stringify(profile));
    snackbar.show('Cambios del perfil guardados con éxito.');
  };

  const handleCancel = () => {
    const restored = loadProfile();
    setProfile(restored);
    snackbar.show('Edición cancelada. Se restauraron los datos guardados.');
  };

  return (
    <div className="profile-canvas">
      <div className="profile-header-section">
        <h2 className="headline-md">Perfil de Administrador</h2>
        <p className="body-md text-secondary-color mt-xs">Gestiona tu información personal y la configuración de tu cuenta.</p>
      </div>

      <div className="profile-grid">
        <div className="profile-sidebar-column">
          <Card className="avatar-card">
            <div className="avatar-wrapper">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaeBYJjn2bFdPYlZwRJMbeJ9RlrIfLlDr6uXMF0Fp8TUIT_RztkcXiw7EIDg6GMOxVZVkcoQJl-0xy5wkdGzUkcyPneySklfyjMQPoj2J-jDFKGhSqIuhCWqQmb16nF89cbEIM_3zPYFKmhD3FFtvQdizgstj-H3EMsBixCeMMoWs24YlKkHpr-MrjHvDEiUOhRDVvc7fkdB15qtT_taf_QJOmbsaseh-XHacfVhQqlMzEgykfrrLZTqSx0lz10Hq3erymqm4SRkFE"
                alt="Avatar del Administrador"
                className="avatar-large"
              />
              <IconButton
                variant="tonal"
                icon="edit"
                label="Editar foto de perfil"
                className="avatar-edit-btn"
              />
            </div>
            <h3 className="headline-sm">{profile.firstName} {profile.lastName}</h3>
            <p className="body-md text-secondary-color font-medium">{profile.jobTitle}</p>
            <div className="status-pill-container">
              <span className="status-pill-dot"></span>
              <span className="label-sm text-on-surface font-semibold">Cuenta Activa</span>
            </div>
          </Card>

          <Card className="quick-stats-card">
            <h4 className="label-md uppercase text-secondary-color mb-sm font-semibold">Estadísticas Rápidas</h4>
            <div className="stats-list">
              <div className="stats-list-item">
                <span className="body-sm text-secondary-color">Último Acceso</span>
                <span className="body-sm font-semibold text-on-surface">Hoy, 08:45 AM</span>
              </div>
              <div className="stats-list-item">
                <span className="body-sm text-secondary-color">Nivel de Rol</span>
                <span className="body-sm font-semibold text-on-surface">Super Administrador</span>
              </div>
              <div className="stats-list-item">
                <span className="body-sm text-secondary-color">Departamento</span>
                <span className="body-sm font-semibold text-on-surface">Operaciones</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="profile-form-column">
          <h3 className="headline-sm form-card-title">Información Personal</h3>
          <form onSubmit={handleSave} className="md3-form">
            <div className="form-fields-row">
              <div className="form-field-group flex-1">
                <label className="label-sm uppercase">Nombre</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  className="md3-input"
                  required
                />
              </div>
              <div className="form-field-group flex-1">
                <label className="label-sm uppercase">Apellido</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setField('lastName', e.target.value)}
                  className="md3-input"
                  required
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="label-sm uppercase">Correo Electrónico</label>
              <div className="input-with-icon">
                <span className="material-symbols-outlined input-icon">mail</span>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className="md3-input pl-xl"
                  required
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="label-sm uppercase">Puesto de Trabajo</label>
              <input
                type="text"
                value={profile.jobTitle}
                onChange={(e) => setField('jobTitle', e.target.value)}
                className="md3-input"
                required
              />
            </div>

            <div className="form-field-group">
              <label className="label-sm uppercase">Biografía</label>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(e) => setField('bio', e.target.value)}
                className="md3-textarea"
              />
            </div>

            <div className="form-btn-actions mt-lg">
              <Button variant="outlined" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button variant="filled" type="submit">
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
