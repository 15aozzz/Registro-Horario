import { useState } from 'react'
import { supabase } from '../config/supabaseClient'
import Tracker from './Tracker'
import History from './History'
import './Dashboard.css'

function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('dashboard') // 'dashboard' | 'history'

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
          <button 
            className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <span className="icon"></span>
            Panel Principal
          </button>
          
          <button 
            className={`nav-item ${view === 'history' ? 'active' : ''}`}
            onClick={() => setView('history')}
          >
            <span className="icon"></span>
            Historial
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
            <h1>{view === 'dashboard' ? 'Panel de Control' : 'Historial de Jornadas'}</h1>
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

        {view === 'dashboard' ? (
          <div className="dashboard-grid">
            {/* Tracker Card */}
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
        ) : (
          <div className="dashboard-grid">
            {/* History Card - Full Width */}
            <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
              <History user={user} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
