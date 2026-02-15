import React from 'react'
import { Button, Card } from '@heroui/react'

export default function Home() {
  // Placeholder tagline used because Landing2.html isn't in the workspace — change on request.
  const tagline = 'Short, engaging activities to strengthen speech, language, and word‑finding skills.'
  const categories = ['🍎','🐶','🚗','🍌','🐘','🏠','✈️','🧸']

  return (
    <div className="w-full bg-accent-sand pt-24 pb-20">
      <div className="w-full">
        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1d3557]">
              Making Speech Therapy <span className="text-deep-ocean">Playful.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#1d3557] opacity-90 mx-auto max-w-2xl">{tagline}</p>
            <div className="flex justify-center">
              <Button radius="full" size="lg" color="primary" className="shadow-lg">Start Therapy Session</Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Card className="w-64 h-64 rounded-full border-8 border-slate-200 bg-white flex items-center justify-center text-6xl shadow-md motion-safe:animate-float motion-reduce:animate-none manual-float">
              🐘
            </Card>
          </div>
        </section>

        {/* Benefits / Why Use */}
        <section className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-[#1d3557]">Why Use Spot It?</h2>
          <p className="text-sm text-slate-600 mt-2">Designed to target core skills through short, repeatable play.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            <Card className="p-6 text-center">
              <div className="text-3xl">🔊</div>
              <h3 className="mt-4 font-semibold text-[#1d3557]">Phonological Retrieval</h3>
              <p className="mt-2 text-sm text-slate-600">Boost word‑finding through rapid, engaging prompts.</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl">👀</div>
              <h3 className="mt-4 font-semibold text-[#1d3557]">Visual Discrimination</h3>
              <p className="mt-2 text-sm text-slate-600">Train attention to small visual differences that support language.</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="text-3xl">🧠</div>
              <h3 className="mt-4 font-semibold text-[#1d3557]">Category Recognition</h3>
              <p className="mt-2 text-sm text-slate-600">Reinforce semantic grouping and retrieval in context.</p>
            </Card>
          </div>
        </section>

        {/* Symbol Library */}
        <section className="mt-12 bg-white rounded-2xl p-6 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-[#1d3557]">Simple Categories. Concrete Nouns.</h3>
          <p className="text-base md:text-lg text-slate-600 mt-2 mx-auto max-w-2xl">A compact library of common nouns across 70 categories.</p>

          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {categories.map((c, i) => (
              <div key={i} className="w-20 h-20 bg-[#f8faf9] rounded-xl flex items-center justify-center text-3xl border border-primary-mint">
                {c}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
