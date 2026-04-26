import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { ArtworkProvider } from './context/ArtworkContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ArtworkProvider>
        <App />
      </ArtworkProvider>
    </AuthProvider>
  </StrictMode>
)