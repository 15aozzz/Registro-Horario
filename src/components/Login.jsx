import { useState } from 'react'
import { supabase } from '../config/supabaseClient'
import './Auth.css'

function Login({ onToggleForm, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Por favor completa todos los campos')
      setLoading(false)
      return
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      onLoginSuccess(data.user)
    }
  }

  return (
    <div className="auth-container">
      {/* Panel izquierdo — Marca */}
      <div className="auth-brand-panel" aria-hidden="true">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">⏱</div>
          <h1 className="auth-brand-title">Control Horario</h1>
          <p className="auth-brand-tagline">
            Registra, controla y analiza tu jornada laboral en tiempo real.
          </p>
          <ul className="auth-brand-features">
            <li>✓ Seguimiento en tiempo real</li>
            <li>✓ Historial completo de sesiones</li>
            <li>✓ Sincronización en la nube</li>
          </ul>
        </div>
        <div className="auth-brand-glow" />
      </div>

      {/* Panel derecho — Formulario */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-card-icon" aria-hidden="true">👤</div>
            <h2>Bienvenido de nuevo</h2>
            <p className="auth-card-subtitle">Inicia sesión para continuar</p>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">✉</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={0}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" aria-hidden="true" />
                  Iniciando sesión…
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <p className="auth-toggle">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={onToggleForm}
              className="link-button"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
