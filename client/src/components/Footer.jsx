import React from 'react'
import { Link } from '@heroui/react'

export default function Footer() {
  return (
    <footer className="w-screen bg-[#1d3557] text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col items-center gap-4 text-center">
        <div className="text-sm md:text-base font-medium text-white">© 2026 Double - Spot It! | Non-Profit Speech Therapy Tool</div>

        <div className="flex gap-6 text-sm mt-2">
          <Link href="#" className="text-white hover:text-primary-mint transition-colors">[ADMIN LOGIN]</Link>
          <Link href="#" className="text-white hover:text-accent-sand transition-colors">[PRIVACY POLICY]</Link>
          <Link href="#" className="text-white hover:text-accent-sand transition-colors">[SUPPORT]</Link>
        </div>
      </div>
    </footer>
  )
}
