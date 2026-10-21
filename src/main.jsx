
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Terms from './Terms.jsx'
import Privacy from './Privacy.jsx'

const path = window.location.pathname.replace(/\/+$/, '')
const isTermsPage = path === '/terms'
const isPrivacyPage = path === '/privacy'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isTermsPage ? (
      <Terms />
    ) : isPrivacyPage ? (
      <Privacy />
    ) : (
      <App />
    )}
  </StrictMode>,
)
