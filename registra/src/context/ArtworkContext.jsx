import { createContext, useContext, useState } from 'react'

const ArtworkContext = createContext()

export function ArtworkProvider({ children }) {
  const [artworks, setArtworks] = useState([
    { id: 1, title: 'Forest Study No. 3', date: 'Apr 18, 2026', hash: 'a3f8...c21d', cls: 'thumb-1', medium: 'digital illustration' },
    { id: 2, title: 'Neon Botanica', date: 'Mar 2, 2026', hash: 'b19e...77fa', cls: 'thumb-2', medium: 'digital illustration' },
    { id: 3, title: 'Character Sheet 01', date: 'Jan 14, 2026', hash: 'f402...9b3c', cls: 'thumb-3', medium: 'graphic design' },
    { id: 4, title: 'Urban Sketch #7', date: 'Dec 3, 2025', hash: 'c881...d4ae', cls: 'thumb-4', medium: 'digital illustration' },
    { id: 5, title: 'Portrait Study', date: 'Nov 20, 2025', hash: 'e230...ff12', cls: 'thumb-5', medium: 'digital illustration' },
    { id: 6, title: 'Abstract No. 1', date: 'Oct 5, 2025', hash: '9b44...7c01', cls: 'thumb-6', medium: 'mixed media' },
  ])

  const thumbClasses = ['thumb-1', 'thumb-2', 'thumb-3', 'thumb-4', 'thumb-5', 'thumb-6']

  const addArtwork = (artwork) => {
    const newArtwork = {
      id: Date.now(),
      title: artwork.title,
      medium: artwork.medium,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      hash: artwork.hash,
      cls: thumbClasses[Math.floor(Math.random() * thumbClasses.length)],
    }
    setArtworks(prev => [newArtwork, ...prev])
  }

  return (
    <ArtworkContext.Provider value={{ artworks, addArtwork }}>
      {children}
    </ArtworkContext.Provider>
  )
}

export function useArtworks() {
  return useContext(ArtworkContext)
}
