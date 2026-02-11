import { supabase } from '../config/supabaseClient'
import Tracker from './Tracker'
import './Dashboard.css'

function Dashboard({ user, onLogout }) {

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation - Style based on 'Rumah' */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Control Horario</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="icon"></span>
            Panel Principal
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <span className="icon"></span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-bar">
            <h1>Panel de Control</h1>
          </div>
          <div className="user-profile">
            <div className="user-info-text">
              <span className="user-name">Usuario</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <div className="avatar">
              {user?.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          {/* Tracker Card - Designed to match 'Air Conditioner' or 'Weather' cards */}
          <div className="dashboard-card main-tracker">
            <Tracker user={user} />
          </div>

          {/* Session Info Card */}
          <div className="dashboard-card session-info">
            <div className="card-header">
              <h3>Detalles de Sesión</h3>
              <span className="badge">Activo</span>
            </div>
            <div className="info-content">
              <div className="info-item">
                <span className="label">ID Usuario</span>
                <span className="value">{user?.id.slice(0, 8)}...</span>
              </div>
              <div className="info-item">
                <span className="label">Email</span>
                <span className="value">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
