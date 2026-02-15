import React, { useEffect, useMemo, useState } from 'react'
import { Tabs, Tab } from '@heroui/react'
import { request } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

// child UI components (presentation only)
import NounsManagement from './NounsManagement'
import CardPacksManagement from './CardPacksManagement'

const EMOJI_POOL = ['🍎','🐶','🚗','🍌','🐘','🏠','✈️','🧸','⚽','🐱','🐦','🐟','🪑','🛋️','🛏️','🥤','🥄','👟','🎩','📚','⏰','📱','🌳','🌸','🎸','🧢','🥛','🍪','🐷','🐮','🐑','🚆','🚚','🚲','🚤','🚪','🪟','🖊️','✏️','🍏','🍊','🍇','🎂','🍕','📷','💻','🎈','⭐','🌙','☀️','🌧️','🍃','🦋','🪨','🔑','🔒','🗺️','👞','👓','🕰️','📸','🍾','🍴','🔪','☂️']

export default function LibraryManagement() {
  const auth = useAuth()
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [nouns, setNouns] = useState([])
  const [loadingNouns, setLoadingNouns] = useState(false)
  const [query, setQuery] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  // sub-navigation state (HeroUI Tabs)
  const [activeTab, setActiveTab] = useState('nouns')

  // sample Card Packs Management (replace with server-driven data later)
  const [cardPacks, setCardPacks] = useState([
    { id: 'pack-1', title: 'Early Sounds Pack', color: 'primary-mint', cards: 24 },
    { id: 'pack-2', title: 'Animals Pack', color: 'deep-ocean', cards: 36 },
    { id: 'pack-3', title: 'Everyday Objects', color: 'amber-400', cards: 18 }
  ])

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

  const isAdmin = !!auth?.user?.role && auth.user.role === 'admin'

  const handleDelete = async (id) => {
    if (!isAdmin) return
    const ok = window.confirm('Delete this noun? This cannot be undone.')
    if (!ok) return
    try {
      setDeletingId(id)
      const res = await request({ path: `/api/nouns/${id}`, method: 'DELETE' })
      if (res.ok) {
        setNouns(prev => prev.filter(n => n._id !== id))
      } else {
        alert(res.body?.message || 'Could not delete noun')
      }
    } catch (err) {
      console.error('Delete noun error', err)
      alert('Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="w-full bg-accent-sand min-h-screen py-12">
      <div className="w-full">
        <div className="flex justify-center mb-6 no-panel">
          <Tabs selectedKey={activeTab} onSelectionChange={(k) => setActiveTab(k)} variant="underlined" className="w-max" disableCursorAnimation>
            <Tab key="nouns">Nouns Management</Tab>
            <Tab key="cardPacks">Card Packs Management</Tab>
          </Tabs>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-8 lg:h-[calc(100vh-6rem)]">
        {/* Nouns/CardPacks UI (now delegated to child components) */}
        {activeTab === 'nouns' ? (
          <NounsManagement
            categories={filteredCategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            nouns={nouns}
            loadingNouns={loadingNouns}
            loadingCategories={loadingCategories}
            query={query}
            setQuery={setQuery}
            handleDelete={handleDelete}
            deletingId={deletingId}
            isAdmin={isAdmin}
            pickEmoji={pickEmoji}
          />
        ) : (
          <CardPacksManagement cardPacks={cardPacks} setCardPacks={setCardPacks} />
        )}
      </div>
    </div>
  )
}

