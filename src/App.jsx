import React, { useState } from 'react'
import PlayerBank from './components/PlayerBank'
import RosterGrid from './components/RosterGrid'

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

  function addPlayer(name) {
    const trimmed = name.trim()
    if (!trimmed || players.includes(trimmed)) return
    setPlayers(prev => [...prev, trimmed])
  }

  function removePlayer(name) {
    setPlayers(prev => prev.filter(p => p !== name))
    // Clear this player from all inning assignments
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
          <div className="roster-header">
            <h2>Roster</h2>
            <button className="export-btn no-print" onClick={() => window.print()}>
              Export to PDF
            </button>
          </div>
          <RosterGrid
            players={players}
            roster={roster}
            positions={POSITIONS}
            innings={INNINGS}
            onAssign={assignPlayer}
          />
        </main>
      </div>
    </div>
  )
}
