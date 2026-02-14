import React, { useState } from 'react'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Link
} from '@heroui/react'
import DoubleLogo from './DoubleLogo'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AppNavbar() {
  const [active, setActive] = useState('Home')
  const [menuOpen, setMenuOpen] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()

  // menu items vary by auth state & role
  const links = auth.user
    ? [
        'Dashboard',
        'New Session',
        'Word Packs',
        ...(auth.user.role === 'therapist' || auth.user.role === 'admin' ? ['Progress Logs'] : []),
        ...(auth.user.role === 'admin' ? ['Admin Panel'] : [])
      ]
    : ['How it Works', 'The Science', 'Library Preview', 'Non-Profit']

  // when auth changes, reset active to the first available link
  React.useEffect(() => {
    if (!links.includes(active)) setActive(links[0] || '')
  }, [auth.user])

  const routeForLabel = (label) => {
    if (label === 'Word Packs') return '/word-packs'
    if (label === 'Dashboard') return '/'
    if (label === 'Home') return '/'
    return null
  }

  const handleNav = (label) => {
    setActive(label)
    const p = routeForLabel(label)
    if (p) navigate(p)
  }

  return (
    <Navbar 
      isBordered 
      maxWidth="full" 
      /* Using w-screen and fixed to ensure it stays outside centered containers */
      className="bg-white/70 backdrop-blur-md w-screen" 
      isMenuOpen={menuOpen} 
      onMenuOpenChange={setMenuOpen}
    >
      <NavbarBrand className="px-4">
        <DoubleLogo />
      </NavbarBrand>

      <NavbarContent justify="center" className="hidden sm:flex items-center gap-8">
        {links.map((label) => (
          <NavbarItem
            key={label}
            isActive={active === label}
            onClick={() => handleNav(label)}
            className="cursor-pointer text-sm leading-none font-medium text-deep-ocean/80 hover:text-deep-ocean transition-colors"
          >
            {label}
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-4 px-4 pr-6 items-center">
        {auth.user ? (
          <>
            <NavbarItem className="hidden md:flex items-center">
              <span className="text-sm font-semibold leading-none">
                Hi, {auth.user.username}
                {(auth.user.role === 'therapist' || auth.user.role === 'admin') && (
                  <span className="ml-2 text-sm font-semibold text-slate-500">({auth.user.role.charAt(0).toUpperCase() + auth.user.role.slice(1)})</span>
                )}
              </span>
            </NavbarItem>
            <NavbarItem>
              <Link href="#" color="foreground" className="text-sm font-semibold mr-2 leading-none inline-flex items-center" onClick={() => auth.logout()}>Logout</Link>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem className="hidden md:flex">
              <Link href="#" color="foreground" className="text-sm font-semibold leading-none inline-flex items-center" onClick={() => auth.setShowLogin(true)}>Login</Link>
            </NavbarItem>
            <NavbarItem>
              <Link href="#" color="foreground" className="text-sm font-semibold mr-2 leading-none inline-flex items-center" onClick={() => auth.setShowLogin(true)}>Join Us</Link>
            </NavbarItem>
          </>
        )}
        <NavbarMenuToggle className="sm:hidden" />
      </NavbarContent>

      <NavbarMenu>
        {links.map((label) => (
          <NavbarMenuItem key={label} onClick={() => { handleNav(label); setMenuOpen(false) }}>
            {label}
          </NavbarMenuItem>
        ))}
        {auth.user ? (
          <>
            <NavbarMenuItem>
              <Link href="#" className="text-sm leading-none" onClick={() => { setMenuOpen(false); }}>Profile</Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link href="#" className="text-sm leading-none" onClick={() => { auth.logout(); setMenuOpen(false); }}>Logout</Link>
            </NavbarMenuItem>
          </>
        ) : (
          <>
            <NavbarMenuItem>
              <Link href="#" className="text-sm leading-none" onClick={() => { auth.setShowLogin(true); setMenuOpen(false); }}>Login</Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link href="#" className="text-sm leading-none" onClick={() => { auth.setShowLogin(true); setMenuOpen(false); }}>Join Us</Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>
  )
}