import React from 'react'
import { createRoot } from 'react-dom/client'
import * as Hero from '@heroui/react'
import App from './App'
import './styles.css'

// Use HeroUI provider when available; fall back to a no-op wrapper.
const Provider = Hero.HeroUIProvider || Hero.HeroProvider || Hero.NextUIProvider || React.Fragment

let heroTheme
if (typeof Hero.createTheme === 'function') {
  // map our palette into HeroUI tokens where possible
  heroTheme = Hero.createTheme({
    type: 'light',
    theme: {
      colors: {
        primary: '#457b9d', // deep-ocean
        primaryLight: '#a8dadc', // primary-mint
        background: '#f1faee', // accent-sand
        foreground: '#1d3557', // text-dark
        success: '#e9c46a' // success-cta
      },
      radii: {
        md: '1rem',
        lg: '1.5rem'
      }
    }
  })
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider {...(heroTheme ? { theme: heroTheme } : {})}>
      <App />
    </Provider>
  </React.StrictMode>
)

