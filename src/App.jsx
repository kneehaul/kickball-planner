import React, { useState } from 'react'
import PlayerBank from './components/PlayerBank'
import FieldView from './components/FieldView'

const POSITIONS = [
  'Pitcher',
  'Catcher',
  '1st Base',
  '2nd Base',
  '3rd Base',
  'Shortstop',
  'Left Field',
  'Left Center',
  'Right Center',
  'Right Field',
]

const INNINGS = [1, 2, 3, 4, 5, 6]

function buildEmptyRoster() {
  const roster = {}
  for (const inning of INNINGS) {
    roster[inning] = {}
    for (const pos of POSITIONS) {
      roster[inning][pos] = ''
    }
  }
  return roster
}

export default function App() {
  const [players, setPlayers] = useState([])
  const [roster, setRoster] = useState(buildEmptyRoster)
  const [activeInning, setActiveInning] = useState(INNINGS[0])

  function addPlayer(name) {
    const trimmed = name.trim()
    if (!trimmed || players.includes(trimmed)) return
    setPlayers(prev => [...prev, trimmed])
  }

  function removePlayer(name) {
    setPlayers(prev => prev.filter(p => p !== name))
    setRoster(prev => {
      const next = {}
      for (const inning of INNINGS) {
        next[inning] = {}
        for (const pos of POSITIONS) {
          next[inning][pos] = prev[inning][pos] === name ? '' : prev[inning][pos]
        }
      }
      return next
    })
  }

  function assignPlayer(inning, position, playerName) {
    setRoster(prev => ({
      ...prev,
      [inning]: {
        ...prev[inning],
        [position]: playerName,
      },
    }))
  }

  function getBench(inning) {
    const assigned = new Set(Object.values(roster[inning]).filter(Boolean))
    return players.filter(p => !assigned.has(p))
  }

  const bench = getBench(activeInning)

  return (
    <div className="app">
      <header className="app-header no-print">
        <h1>Kickball Roster Planner</h1>
      </header>
      <div className="app-body">
        <aside className="sidebar no-print">
          <PlayerBank
            players={players}
            roster={roster}
            innings={INNINGS}
            onAdd={addPlayer}
            onRemove={removePlayer}
          />
        </aside>
        <main className="main-content">
          <div className="roster-header no-print">
            <h2>Field Lineup</h2>
            <button className="export-btn" onClick={() => window.print()}>
              Export to PDF
            </button>
          </div>

          <div className="inning-tabs no-print">
            {INNINGS.map(i => (
              <button
                key={i}
                className={`inning-tab${activeInning === i ? ' active' : ''}`}
                onClick={() => setActiveInning(i)}
              >
                Inning {i}
              </button>
            ))}
          </div>

          <div className="print-inning-label">Inning {activeInning}</div>

          <FieldView
            players={players}
            inningRoster={roster[activeInning]}
            onAssign={(position, playerName) => assignPlayer(activeInning, position, playerName)}
          />

          <div className="bench-section">
            <h3>Bench — Inning {activeInning}</h3>
            <div className="bench-players">
              {bench.length === 0 ? (
                <span className="bench-empty">Everyone is assigned</span>
              ) : (
                bench.map(name => (
                  <span key={name} className="bench-player">{name}</span>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
