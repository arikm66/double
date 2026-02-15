import React from 'react'
import { Card, Button } from '@heroui/react'

export default function NounsManagement(props) {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    nouns,
    loadingNouns,
    loadingCategories,
    query,
    setQuery,
    handleDelete,
    deletingId,
    isAdmin,
    pickEmoji
  } = props

  return (
    <>
      <aside className="w-full lg:w-72 rounded-2xl overflow-hidden shadow-sm bg-[#1d3557] text-white p-4 flex flex-col lg:h-[calc(100vh-6rem)]">
        <div className="mb-4">
          <input
            className="w-full rounded-md px-3 py-2 text-sm bg-[#153147] placeholder-slate-300"
            placeholder="Search categories..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {loadingCategories ? (
            <div className="text-sm text-slate-300">Loading categories...</div>
          ) : (
            categories.map((cat, i) => (
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

      <main className="w-full flex-1 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#1d3557]">{selectedCategory ? selectedCategory.categoryHe : 'Select a category'}</h3>
            <div className="text-sm text-slate-600">{(nouns || []).length} nouns in this category</div>
          </div>
          <div className="flex items-center gap-3">
            <Button radius="full" color="primary">Add New Noun</Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-6">
          {loadingNouns ? (
            <div className="text-sm text-slate-500">Loading nouns...</div>
          ) : (nouns || []).length === 0 ? (
            <div className="text-sm text-slate-500">No nouns found for this category.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {nouns.map(noun => (
                <Card key={noun._id} className="overflow-hidden border border-slate-200 rounded-2xl">
                  <div className="w-full h-44 bg-white/80 overflow-hidden">
                    <div className="h-10 flex items-center justify-end px-3 pt-1">
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(noun._id)}
                          disabled={deletingId === noun._id}
                          title={`Delete ${noun.nameEn}`}
                          aria-label={`Delete ${noun.nameEn}`}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm hover:bg-white disabled:opacity-50"
                        >
                          {deletingId === noun._id ? (
                            <svg className="w-4 h-4 animate-spin text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h14a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm-1 6a1 1 0 011-1h8a1 1 0 011 1v7a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => {/* TODO: open edit modal / navigate */}}
                        title={`Edit ${noun.nameEn}`}
                        aria-label={`Edit ${noun.nameEn}`}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-deep-ocean shadow-sm hover:bg-white"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828L7.828 15H5v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center pb-3">
                      <div className="w-[90%] max-w-36 border border-slate-200 rounded-md p-2 bg-white/80 flex items-center justify-center">
                        {noun.imageUrl ? (
                          <img loading="lazy" src={noun.imageUrl} alt={noun.nameEn} className="max-w-full max-h-28 object-contain block" />
                        ) : (
                          <div className="text-4xl">📦</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="font-semibold text-[#1d3557] text-sm">{noun.nameEn}</div>
                    <div className="text-xs text-slate-500">{noun.nameHe}</div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
