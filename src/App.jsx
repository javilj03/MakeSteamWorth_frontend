import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [topGames, setTopGames] = useState([])
  const [loadingTop, setLoadingTop] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)

  // Carga del top 10 al inicio
  useEffect(() => {
    fetch('/api/juegos/top')
      .then(res => res.json())
      .then(data => {

        if (data.datos) {
          setTopGames(data.datos.slice(0, 10))
        }
      })
      .catch(err => {
        console.error("Error cargando el top:", err)
      })
      .finally(() => {
        setLoadingTop(false)
      })
  }, [])

  // Búsqueda de un juego
  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearchLoading(true)
    setSearchError(null)
    setSearchResult(null)

    fetch(`/api/juegos/buscar?nombre=${encodeURIComponent(searchQuery)}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Juego no encontrado o error en el servidor')
        }
        return res.json()
      })
      .then(data => {
        // Según tu documentación el endpoint devuelve { origen, datos }
        setSearchResult(data.datos)
      })
      .catch(err => {
        setSearchError(err.message)
      })
      .finally(() => {
        setSearchLoading(false)
      })
  }

    return (
    <>
      <header className="hero-header">
        <div className="header-content">
          <h1>MakeSteamWorth</h1>
          <p className="subtitle">Encuentra los juegos más rentables y sus datos en tiempo real</p>
          
          <form className="search-form" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Ej. Dota 2, Counter-Strike..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" disabled={searchLoading} className="search-btn">
              {searchLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          {searchError && <p className="error-msg">{searchError}</p>}
        </div>
      </header>
      
      <main className="main-content">
        {searchResult && (
          <section className="search-result-section">
            <div className="search-result">
              <h3>{searchResult.nombre || searchQuery}</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-label">Puntuación</span>
                  <span className="stat-value highlight">{searchResult.puntuacion_compra || 'N/D'}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Pico 30 días</span>
                  <span className="stat-value">{searchResult.pico_30_dias || 0}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Horas (30 días)</span>
                  <span className="stat-value">{searchResult.horas_jugadas_30_dias || 0}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="top-section">
          <h2>Top 10 Rentabilidad</h2>
          {loadingTop ? (
            <p className="loading-text">Cargando el top de juegos...</p>
          ) : (
            <div className="top-list">
              {topGames.length > 0 ? (
                topGames.map((game, index) => (
                  <div key={game.appId || index} className="top-item">
                    <span className="rank-badge">#{index + 1}</span>
                    <div className="game-info">
                      <strong>{game.nombre}</strong>
                      <span className="game-score">
                        Puntuación: {game.puntuacion_compra || 'N/D'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No se encontraron juegos todavía.</p>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export default App
