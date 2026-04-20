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

function emptyInning() {
  const inning = {}
  for (const pos of POSITIONS) inning[pos] = ''
  return inning
}

export default function App() {
  const [players, setPlayers] = useState([])
  const [innings, setInnings] = useState([1])
  const [roster, setRoster] = useState(() => ({ 1: emptyInning() }))
  const [activeInning, setActiveInning] = useState(1)

  function addInning() {
    const next = innings[innings.length - 1] + 1
    setInnings(prev => [...prev, next])
    setRoster(prev => ({ ...prev, [next]: emptyInning() }))
    setActiveInning(next)
  }

  function addPlayer(name) {
    const trimmed = name.trim()
    if (!trimmed || players.includes(trimmed)) return
    setPlayers(prev => [...prev, trimmed])
  }

  function removePlayer(name) {
    setPlayers(prev => prev.filter(p => p !== name))
    setRoster(prev => {
      const next = {}
      for (const inning of innings) {
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
            innings={innings}
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
            {innings.map(i => (
              <button
                key={i}
                className={`inning-tab${activeInning === i ? ' active' : ''}`}
                onClick={() => setActiveInning(i)}
              >
                Inning {i}
              </button>
            ))}
            <button className="inning-tab add-inning-btn" onClick={addInning}>
              + Add Inning
            </button>
          </div>

          {/* Interactive view */}
          <div className="no-print">
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
          </div>

          {/* Print-only view: all innings */}
          <div className="print-only">
            {innings.map(i => {
              const benchForInning = getBench(i)
              return (
                <div key={i} className="print-inning">
                  <h2 className="print-inning-label">Inning {i}</h2>
                  <FieldView
                    players={players}
                    inningRoster={roster[i]}
                    onAssign={() => {}}
                  />
                  <div className="bench-section">
                    <h3>Bench</h3>
                    <div className="bench-players">
                      {benchForInning.length === 0 ? (
                        <span className="bench-empty">Everyone is assigned</span>
                      ) : (
                        benchForInning.map(name => (
                          <span key={name} className="bench-player">{name}</span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
