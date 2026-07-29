'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Lang = 'ar' | 'fr'

type LangStore = {
  lang: Lang
  setLang: (l: Lang) => void
}

export const useCartStore = create<LangStore>()(
  persist(
    (set) => ({
      lang: 'ar',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'fmz-lang' }
  )
)
