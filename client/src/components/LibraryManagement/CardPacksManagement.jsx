import React from 'react'
import { Card, Button } from '@heroui/react'

export default function CardPacksManagement({ cardPacks, setCardPacks }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#1d3557]">Card Packs Management</h3>
        <Button radius="full" color="primary" onClick={() => {
          const id = `pack-${Date.now()}`
          setCardPacks(prev => [{ id, title: `New Pack ${prev.length + 1}`, color: 'primary-mint', cards: 0 }, ...prev])
        }}>Create New Pack</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cardPacks.map((pack, i) => (
          <Card key={pack.id} className="overflow-hidden">
            <div className={`h-24 ${pack.color === 'primary-mint' ? 'bg-primary-mint' : pack.color === 'deep-ocean' ? 'bg-deep-ocean' : 'bg-amber-400'} flex items-end p-4 font-semibold`} style={{ color: pack.color === 'deep-ocean' ? '#ffffff' : '#1d3557' }}>{pack.title}</div>
            <div className="p-4 flex flex-col gap-3">
              <div className="font-semibold text-[#1d3557] text-sm">{pack.title}</div>
              <div className="text-sm text-slate-600">{pack.cards} cards</div>
              <div className="flex items-center gap-3 mt-auto">
                <button className="text-sm text-slate-600 hover:underline">Edit</button>
                <button className="text-sm text-red-600 hover:underline" onClick={() => setCardPacks(prev => prev.filter(p => p.id !== pack.id))}>Delete</button>
                <div className="ml-auto">
                  <Button color="primary" radius="full">Play</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
