import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found-container">
      <h1>Error 404</h1>
      <h2>Página No Encontrada</h2>
      <p>La ruta que intentas acceder no existe o aún no ha sido implementada en nuestro panel de control.</p>
      <Link to="/home" className="home-link">
        Volver al Inicio
      </Link>
    </div>
  );
}
