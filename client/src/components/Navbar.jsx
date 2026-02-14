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

export default function AppNavbar() {
  const [active, setActive] = useState('Home')
  const [menuOpen, setMenuOpen] = useState(false)
  const links = ['Home', 'Features', 'Pricing', 'About']

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

      <NavbarContent justify="center" className="hidden sm:flex gap-8">
        {links.map((label) => (
          <NavbarItem
            key={label}
            isActive={active === label}
            onClick={() => setActive(label)}
            className="cursor-pointer font-medium text-deep-ocean/80 hover:text-deep-ocean transition-colors"
          >
            {label}
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-4 px-4 pr-6">
        <NavbarItem className="hidden md:flex">
          <Link href="#" color="foreground" className="text-sm font-semibold">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="#" color="foreground" className="text-sm font-semibold mr-2" onClick={() => setActive('Join Us')}>Join Us</Link>
        </NavbarItem>
        <NavbarMenuToggle className="sm:hidden" />
      </NavbarContent>

      <NavbarMenu>
        {links.map((label) => (
          <NavbarMenuItem key={label} onClick={() => { setActive(label); setMenuOpen(false) }}>
            {label}
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Link href="#" onClick={() => setMenuOpen(false)}>Login</Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link href="#" onClick={() => { setActive('Join Us'); setMenuOpen(false); }}>Join Us</Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  )
}