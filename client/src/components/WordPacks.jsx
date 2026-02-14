import React, { useEffect, useMemo, useState } from 'react'
import { Card, Switch, Button } from '@heroui/react'
import { request } from '../services/api'

const EMOJI_POOL = ['🍎','🐶','🚗','🍌','🐘','🏠','✈️','🧸','⚽','🐱','🐦','🐟','🪑','🛋️','🛏️','🥤','🥄','👟','🎩','📚','⏰','📱','🌳','🌸','🎸','🧢','🥛','🍪','🐷','🐮','🐑','🚆','🚚','🚲','🚤','🚪','🪟','🖊️','✏️','🍏','🍊','🍇','🎂','🍕','📷','💻','🎈','⭐','🌙','☀️','🌧️','🍃','🦋','🪨','🔑','🔒','🗺️','👞','👓','🕰️','📸','🍾','🍴','🔪','☂️']

export default function WordPacks() {
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [nouns, setNouns] = useState([])
  const [loadingNouns, setLoadingNouns] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true)
      const res = await request({ path: '/api/categories?limit=200' })
      if (res.ok && res.body?.categories) {
        setCategories(res.body.categories)
        if (res.body.categories.length) {
          setSelectedCategory(res.body.categories[0])
        }
      }
      setLoadingCategories(false)
    }
    loadCategories()
  }, [])

  useEffect(() => {
    async function loadNouns() {
      if (!selectedCategory) return
      setLoadingNouns(true)
      const res = await request({ path: `/api/nouns/category/${selectedCategory._id}` })
      if (res.ok && res.body?.nouns) setNouns(res.body.nouns)
      else setNouns([])
      setLoadingNouns(false)
    }
    loadNouns()
  }, [selectedCategory])

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase()
    return categories.filter(c => c.categoryHe.toLowerCase().includes(q))
  }, [categories, query])

  const pickEmoji = (index) => EMOJI_POOL[index % EMOJI_POOL.length]

  return (
    <div className="w-full bg-accent-sand min-h-[60vh] py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="w-full rounded-2xl overflow-hidden shadow-sm bg-[#1d3557] text-white p-4 h-160 flex flex-col">
          <div className="mb-4">
            <input
              className="w-full rounded-md px-3 py-2 text-sm bg-[#153147] placeholder-slate-300"
              placeholder="Search categories..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {loadingCategories ? (
              <div className="text-sm text-slate-300">Loading categories...</div>
            ) : (
              filteredCategories.map((cat, i) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${selectedCategory && selectedCategory._id === cat._id ? 'bg-[#152938] ring-2 ring-primary-mint' : 'hover:bg-[#122630]'}`}
                >
                  <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-lg">{pickEmoji(i)}</div>
                  <div className="text-sm font-medium">{cat.categoryHe}</div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="bg-accent-sand rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#1d3557]">{selectedCategory ? selectedCategory.categoryHe : 'Select a category'}</h3>
              <div className="text-sm text-slate-600">{nouns.length} nouns in this category</div>
            </div>
            <div className="flex items-center gap-3">
              <Button radius="full" color="primary">Add New Noun</Button>
            </div>
          </div>

          <div>
            {loadingNouns ? (
              <div className="text-sm text-slate-500">Loading nouns...</div>
            ) : nouns.length === 0 ? (
              <div className="text-sm text-slate-500">No nouns found for this category.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {nouns.map(noun => (
                  <Card key={noun._id} className="overflow-hidden">
                    {noun.imageUrl ? (
                      <img src={noun.imageUrl} alt={noun.nameEn} className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-white/80 flex items-center justify-center text-4xl">📦</div>
                    )}
                    <div className="p-3">
                      <div className="font-semibold text-[#1d3557] text-sm">{noun.nameEn}</div>
                      <div className="text-xs text-slate-500">{noun.nameHe}</div>
                      <div className="mt-3 flex justify-end">
                        <Button size="sm" radius="full" className="text-sm">Edit</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}