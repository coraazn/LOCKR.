import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Terms from './Terms.jsx'

const path = window.location.pathname.replace(/\/+$/, '')
const isTermsPage = path === '/terms'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isTermsPage ? <Terms /> : <App />}
  </StrictMode>,
)
