import { supabase } from '../config/supabaseClient'
import './Dashboard.css'

function Dashboard({ user, onLogout }) {

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Control Horario</h1>
        <div className="user-info">
          <span>Usuario: {user?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Bienvenido al Sistema de Control Horario</h2>
          <p>Autenticación completada</p>
          <div className="info-box">
            <h3>Estado de la sesión:</h3>
            <p>Email: <strong>{user?.email}</strong></p>
            <p>ID de usuario: <code>{user?.id}</code></p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
