import { useState, useEffect } from 'react';
import './Profile.css';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  bio: string;
}

export default function Profile() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [bio, setBio] = useState('');

  // Cargar datos de LocalStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ProfileData;
        setFirstName(parsed.firstName || '');
        setLastName(parsed.lastName || '');
        setEmail(parsed.email || '');
        setJobTitle(parsed.jobTitle || '');
        setBio(parsed.bio || '');
      } catch (e) {
        console.error('Error al parsear el perfil guardado en localStorage:', e);
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const profileData: ProfileData = {
      firstName,
      lastName,
      email,
      jobTitle,
      bio,
    };
    localStorage.setItem('user_profile', JSON.stringify(profileData));
    alert('Cambios del perfil guardados con éxito.');
  };

  const handleCancel = () => {
    // Restaurar los datos desde localStorage o reiniciar a vacío
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ProfileData;
        setFirstName(parsed.firstName || '');
        setLastName(parsed.lastName || '');
        setEmail(parsed.email || '');
        setJobTitle(parsed.jobTitle || '');
        setBio(parsed.bio || '');
      } catch (e) {
        // ignore
      }
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setJobTitle('');
      setBio('');
    }
    alert('Edición cancelada. Se restauraron los datos guardados.');
  };

  return (
    <div className="profile-canvas">
      {/* Encabezado de Página */}
      <div className="profile-header-section">
        <h2 className="headline-md">Perfil de Administrador</h2>
        <p className="body-md text-secondary-color mt-xs">Gestiona tu información personal y la configuración de tu cuenta.</p>
      </div>

      {/* Grid Principal */}
      <div className="profile-grid">
        {/* Columna Izquierda: Avatar y Estadísticas Rápidas */}
        <div className="profile-sidebar-column">
          {/* Tarjeta de Avatar */}
          <div className="avatar-card card shadow-sm">
            <div className="avatar-wrapper">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaeBYJjn2bFdPYlZwRJMbeJ9RlrIfLlDr6uXMF0Fp8TUIT_RztkcXiw7EIDg6GMOxVZVkcoQJl-0xy5wkdGzUkcyPneySklfyjMQPoj2J-jDFKGhSqIuhCWqQmb16nF89cbEIM_3zPYFKmhD3FFtvQdizgstj-H3EMsBixCeMMoWs24YlKkHpr-MrjHvDEiUOhRDVvc7fkdB15qtT_taf_QJOmbsaseh-XHacfVhQqlMzEgykfrrLZTqSx0lz10Hq3erymqm4SRkFE" 
                alt="Avatar del Administrador" 
                className="avatar-large"
              />
              <button type="button" className="avatar-edit-btn" aria-label="Editar foto de perfil">
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>
            <h3 className="headline-sm">{firstName} {lastName}</h3>
            <p className="body-md text-secondary-color font-medium">{jobTitle}</p>
            <div className="status-pill-container">
              <span className="status-pill-dot"></span>
              <span className="label-sm text-on-surface font-semibold">Cuenta Activa</span>
            </div>
          </div>

          {/* Tarjeta de Estadísticas Rápidas */}
          <div className="quick-stats-card card shadow-sm">
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
          </div>
        </div>

        {/* Columna Derecha: Formulario de Información Personal */}
        <div className="profile-form-column card shadow-sm">
          <h3 className="headline-sm form-card-title">Información Personal</h3>
          <form onSubmit={handleSave} className="md3-form">
            <div className="form-fields-row">
              <div className="form-field-group flex-1">
                <label className="label-sm uppercase">Nombre</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)}
                  className="md3-input"
                  required
                />
              </div>
              <div className="form-field-group flex-1">
                <label className="label-sm uppercase">Apellido</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)}
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
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="md3-input pl-xl"
                  required
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="label-sm uppercase">Puesto de Trabajo</label>
              <input 
                type="text" 
                value={jobTitle} 
                onChange={(e) => setJobTitle(e.target.value)}
                className="md3-input"
                required
              />
            </div>

            <div className="form-field-group">
              <label className="label-sm uppercase">Biografía</label>
              <textarea 
                rows={4}
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                className="md3-textarea"
              />
            </div>

            <div className="form-btn-actions mt-lg">
              <button type="button" onClick={handleCancel} className="md3-btn md3-btn-outlined">
                Cancelar
              </button>
              <button type="submit" className="md3-btn md3-btn-filled">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
