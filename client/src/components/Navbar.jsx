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

// Minimal, responsive HeroUI Navbar (JavaScript + Tailwind for small layout tweaks)
export default function AppNavbar() {
  const [active, setActive] = useState('Home')
  const [menuOpen, setMenuOpen] = useState(false)

  const links = ['Home', 'Features', 'Pricing', 'About']

  return (
    <Navbar isBordered maxWidth="full" className="mb-4 w-full" isMenuOpen={menuOpen} onMenuOpenChange={setMenuOpen}>
      <NavbarBrand className="px-6" aria-label="Double (Spot It!)">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center font-bold"
            style={{ backgroundColor: 'var(--primary-mint)', color: 'var(--text-dark)' }}
            aria-hidden
          >
            D
          </div>
          <div className="leading-tight">
            <div className="font-semibold">Double</div>
            <div className="text-xs text-slate-500">Spot It!</div>
          </div>
        </div>
      </NavbarBrand>

      <NavbarContent justify="center" className="hidden sm:flex px-6">
        {links.map((label) => (
          <NavbarItem
            key={label}
            isActive={active === label}
            onClick={() => setActive(label)}
            role="link"
            tabIndex={0}
            className="cursor-pointer"
            aria-current={active === label ? 'page' : undefined}
          >
            {label}
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2! px-6">
        <NavbarItem>
          <Link href="#" color="foreground">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button auto size="sm" color="primary" onPress={() => setActive('SignUp')}>Sign Up</Button>
        </NavbarItem>
        <NavbarMenuToggle srOnlyText="open/close navigation menu" />
      </NavbarContent>

      {/* Mobile menu (collapses into hamburger) */}
      <NavbarMenu className="px-6">
        {links.map((label) => (
          <NavbarMenuItem
            key={label}
            isActive={active === label}
            onClick={() => { setActive(label); setMenuOpen(false) }}
          >
            {label}
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Link href="#">Login</Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Button fullWidth color="primary">Sign Up</Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  )
}
