import { useEffect, useState } from 'react'
import { supabase } from './config/supabaseClient'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSignup, setShowSignup] = useState(false)

  useEffect(() => {
    // Verificar si hay una sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="App">
        <p>Cargando...</p>
      </div>
    )
  }

  // Si el usuario está autenticado, mostrar Dashboard
  if (user) {
    return <Dashboard user={user} onLogout={() => setUser(null)} />
  }

  // Si no está autenticado, mostrar Login o Signup
  return (
    <>
      {showSignup ? (
        <Signup onToggleForm={() => setShowSignup(false)} />
      ) : (
        <Login 
          onToggleForm={() => setShowSignup(true)}
          onLoginSuccess={(user) => setUser(user)}
        />
      )}
    </>
  )
}

export default App
