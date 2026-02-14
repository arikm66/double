import React, { useState } from 'react'
import { Button } from '@heroui/react'
import NounImaging from './NounImaging'

export default function AdminPanel() {
  const [active, setActive] = useState('nounImaging')
  const utilities = [
    { key: 'nounImaging', label: 'Noun Imaging' },
    { key: 'imports', label: 'Import / Audit (coming soon)' }
  ]

  return (
    <div className="w-full flex bg-accent-sand min-h-screen">
      <aside className="w-72 rounded-2xl overflow-hidden shadow-sm bg-[#1d3557] text-white p-6 h-screen flex flex-col gap-6">
        <div className="text-lg font-semibold">Admin Console</div>

        <div className="flex flex-col gap-2 mt-2">
          {utilities.map(u => (
            <Button
              key={u.key}
              radius="md"
              color={active === u.key ? 'primary' : 'ghost'}
              className={`justify-start text-sm ${active === u.key ? 'bg-[#457b9d] text-white' : 'text-white/90'}`}
              onClick={() => setActive(u.key)}
            >
              {u.label}
            </Button>
          ))}
        </div>

        <div className="mt-auto text-xs text-white/60">Tools for administrators. Use with care.</div>
      </aside>

      <main className="flex-1 p-8">
        {active === 'nounImaging' && <NounImaging />}
        {active === 'imports' && (
          <div className="text-slate-700">Import / Audit utilities will be added here.</div>
        )}
      </main>
    </div>
  )
}